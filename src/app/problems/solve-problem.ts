import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { EVENTS } from "../events/events";
import { addEvent } from "../events/events-slice";
import { processEventsAndIncrementProgress } from "../events/process-event";
import type { BreakDataWithProblemPlacementAndUserContestIndex } from "../events/types";
import type { RootState } from "../store";
import type { MockDispatch } from "../types";
import type { User } from "../users/types";
import { applyXPGain } from "../users/users-slice";
import { setLastXPGainData } from "../view/view-slice";
import { computeXPGainFromImplementing } from "../XP/xp-from-implementing";
import { computeXPGainFromPenPaperSolving } from "../XP/xp-from-pen-paper-solving";
import { computeXPGainFromReading } from "../XP/xp-from-reading";
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

export const processTickOfProblemSolving = (
  user: User,
  indexOfUser: number,
  problem: Problem,
  problemSolveStatus:
    | ProblemSolveStatusWhileActive
    | ProblemSolveStatusBeforeReading,
  nextEventIn: number,
  numberOfMergedTicks: number,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootState, void, AnyAction> | MockDispatch
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
        if (user.isPlayer) {
          dispatch(
            addEvent({
              message: `Finished reading problem ${problem.placement}`,
              sentiment: "positive",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

          const XPGain = computeXPGainFromReading(user, problem);
          dispatch(applyXPGain(XPGain));
          dispatch(setLastXPGainData({ XPGain, secondsVisible: 10 }));
        }

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
        const penPaperCorrect = computeIfPenPaperCorrect(
          user,
          problem,
          problemSolveStatus.submissions
        );

        if (user.isPlayer) {
          dispatch(
            addEvent({
              message: `Found a pen-paper solution for problem ${problem.placement}`,
              sentiment: "positive",
              ticksSinceBeginning,
              problemPlacement: problem.placement,
            })
          );

          const XPGain = computeXPGainFromPenPaperSolving(
            user,
            problem,
            penPaperCorrect
          );
          dispatch(applyXPGain(XPGain));
          dispatch(setLastXPGainData({ XPGain, secondsVisible: 10 }));
        }

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

        if (user.isPlayer) {
          const XPGain = computeXPGainFromImplementing(
            user,
            problem,
            implementationCorrect
          );
          dispatch(applyXPGain(XPGain));
          dispatch(setLastXPGainData({ XPGain, secondsVisible: 10 }));
        }

        return {
          newProblemSolveStatus: submitProblem(
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
