import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { EVENTS } from "../events/events";
import { addEvent } from "../events/events-slice";
import { processEventsAndIncrementProgress } from "../events/process-event";
import type { BreakDataWithProblemPlacementAndUserContestIndex } from "../events/types";
import type { MockDispatch } from "../types";
import type { User } from "../users/types";
import { computeIfImplementationCorrect, startImplementing } from "./implement";
import {
  computeIfPenPaperCorrect,
  startPenPaperSolving,
} from "./pen-paper-solve";
import { startReadingProblem } from "./read-problem";
import { submitProblem } from "./submit-problem";
import type {
  Problem,
  ProblemSolveStatusAfterPassingPretests,
  ProblemSolveStatusBeforeReading,
  ProblemSolveStatusWhileActive,
} from "./types";
import type { ProblemSolveStatus } from "./types";

export const generateInitialProblemSolveStatus = (): ProblemSolveStatus => {
  return {
    phase: "before-reading",
    submissions: [],
  };
};

export const processTickOfProblemSolving = <RootStateType>(
  user: User,
  indexOfUser: number,
  problem: Problem,
  problemSolveStatus:
    | ProblemSolveStatusWhileActive
    | ProblemSolveStatusBeforeReading,
  nextEventIn: number,
  numberOfMergedTicks: number,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch
): {
  newProblemSolveStatus:
    | ProblemSolveStatusWhileActive
    | ProblemSolveStatusAfterPassingPretests;
  nextEventIn: number;
  breakData: BreakDataWithProblemPlacementAndUserContestIndex | null;
} => {
  if (problemSolveStatus.phase === "before-reading")
    return {
      newProblemSolveStatus: startReadingProblem(user, problem),
      nextEventIn,
      breakData: null,
    };

  let breakData: BreakDataWithProblemPlacementAndUserContestIndex | null;
  ({ problemSolveStatus, nextEventIn, breakData } =
    processEventsAndIncrementProgress(
      EVENTS,
      user,
      indexOfUser,
      problem,
      problemSolveStatus,
      nextEventIn,
      numberOfMergedTicks,
      ticksSinceBeginning,
      dispatch
    ));

  switch (problemSolveStatus.phase) {
    case "during-reading":
      if (problemSolveStatus.progress >= 1) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: `Finished reading problem ${problem.placement}`,
              sentiment: "positive",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

        return {
          newProblemSolveStatus: startPenPaperSolving(
            user,
            problem,
            problemSolveStatus.submissions
          ),
          nextEventIn,
          breakData,
        };
      }
      break;

    case "during-pen-paper-solving":
      if (problemSolveStatus.progress >= 1) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: `Found a pen-paper solution for problem ${problem.placement}`,
              sentiment: "positive",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

        const penPaperCorrect = computeIfPenPaperCorrect(
          user,
          problem,
          problemSolveStatus.submissions
        );
        return {
          newProblemSolveStatus: startImplementing(
            user,
            problem,
            penPaperCorrect,
            problemSolveStatus.submissions
          ),
          nextEventIn,
          breakData,
        };
      }
      break;

    case "during-implementing":
      if (problemSolveStatus.progress >= 1) {
        const implementationCorrect = computeIfImplementationCorrect(
          user,
          problem,
          problemSolveStatus.submissions
        );

        return {
          newProblemSolveStatus: submitProblem<RootStateType>(
            user,
            problem,
            problemSolveStatus.submissions,
            problemSolveStatus.penPaperCorrect,
            implementationCorrect,
            ticksSinceBeginning,
            dispatch
          ),
          nextEventIn,
          breakData,
        };
      }
      break;
    case "during-searching-for-mistake":
      if (problemSolveStatus.penPaperProgressIncrement.progress >= 1) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: `Found a mistake in the pen-paper solution for problem ${problem.placement}. Starting to fix it now.`,
              sentiment: "neutral",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

        return {
          newProblemSolveStatus: startPenPaperSolving(
            user,
            problem,
            problemSolveStatus.submissions
          ),
          nextEventIn,
          breakData,
        };
      }

      if (problemSolveStatus.implementationProgressIncrement.progress >= 1) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: `Found a mistake in the implementation of the solution for the problem ${problem.placement}. Starting to fix it now.`,
              sentiment: "neutral",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

        return {
          newProblemSolveStatus: startImplementing(
            user,
            problem,
            problemSolveStatus.penPaperCorrect,
            problemSolveStatus.submissions
          ),
          nextEventIn,
          breakData,
        };
      }
  }

  return {
    newProblemSolveStatus: problemSolveStatus,
    nextEventIn,
    breakData,
  };
};
