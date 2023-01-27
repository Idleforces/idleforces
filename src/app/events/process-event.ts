import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { zip } from "../../utils/utils";
import { EXPECTED_NUMBER_TICKS_PER_PHASE } from "../contest/constants";
import type {
  Problem,
  ProblemProgressIncrement,
  ProblemSolveStatusWhileActive,
} from "../problems/types";
import type { MockDispatch } from "../types";
import type { User } from "../users/types";
import { BASE_EVENT_PROBABILITY } from "./constants";
import { addEvent } from "./events-slice";
import type {
  BreakDataWithProblemPlacementAndUserContestIndex,
  ContestEventBlueprint,
  EventProbabilityParams,
} from "./types";

const scaleWithCurrentIncrement = (
  valueToBeScaled: number,
  rateOfScaling: number,
  increment: number
): number => {
  return (
    valueToBeScaled *
    Math.pow(increment * EXPECTED_NUMBER_TICKS_PER_PHASE, rateOfScaling)
  );
};

export const computeProbabilitiesOfEvents = (
  events: Readonly<Array<ContestEventBlueprint>>,
  increment: number,
  eventProbabilityParams: EventProbabilityParams
): Array<number> => {
  const probabilitiesScaledWithCurrentIncrement = events.map((event) => {
    const unscaledEventProbability =
      event.probability instanceof Function
        ? event.probability(eventProbabilityParams)
        : event.probability;
    return scaleWithCurrentIncrement(
      unscaledEventProbability,
      event.probabilityScalingRateWithRateOfIncrement,
      increment
    );
  });

  return probabilitiesScaledWithCurrentIncrement.map(
    (prob) => prob * BASE_EVENT_PROBABILITY
  );
};

const processEventAndReturnBreakData = <RootStateType>(
  event: ContestEventBlueprint,
  user: User,
  userContestIndex: number,
  problem: Problem,
  progressIncrement: ProblemProgressIncrement,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch
): BreakDataWithProblemPlacementAndUserContestIndex | null => {
  const problemPlacement = event.isGlobal ? "global" : problem.placement;

  if (user.isPlayer)
    dispatch(
      addEvent({
        message: event.message,
        ticksSinceBeginning,
        problemPlacement,
        sentiment: event.sentiment,
      })
    );

  if (event.setProgress !== undefined) {
    if (typeof event.setProgress === "number")
      progressIncrement.progress = event.setProgress;
    else
      progressIncrement.progress = event.setProgress({
        progress: progressIncrement.progress,
      });
  }

  if (event.setIncrement !== undefined) {
    if (typeof event.setIncrement === "number")
      progressIncrement.increment = event.setIncrement;
    else
      progressIncrement.increment = event.setIncrement({
        increment: progressIncrement.increment,
      });
  }

  if (event.setBreakInTicks) {
    if (event.setBreakInTicks instanceof Function) {
      return {
        ...event.setBreakInTicks({
          tag: problem.tag,
          user,
          penPaperDifficulty: problem.penPaperDifficulty,
          implementationDifficulty: problem.implementationDifficulty,
        }),
        problemPlacement: problem.placement,
        userContestIndex,
      };
    } else
      return {
        ...event.setBreakInTicks,
        problemPlacement: problem.placement,
        userContestIndex,
      };
  }

  return null;
};

export const processEventsAndIncrementProgress = <RootStateType>(
  events: Readonly<Array<ContestEventBlueprint>>,
  user: User,
  indexOfUser: number,
  problem: Problem,
  problemSolveStatus: ProblemSolveStatusWhileActive,
  nextEventIn: number,
  numberOfMergedTicks: number,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch
): {
  problemSolveStatus: ProblemSolveStatusWhileActive;
  nextEventIn: number;
  breakData: BreakDataWithProblemPlacementAndUserContestIndex | null;
} => {
  const phase = problemSolveStatus.phase;
  events = events.filter(
    (event) => event.phases === "all" || event.phases.includes(phase)
  );

  let progressIncrement: ProblemProgressIncrement;
  if (
    phase === "during-searching-for-mistake" &&
    Math.floor(ticksSinceBeginning / numberOfMergedTicks) % 2 > 0
  ) {
    progressIncrement = problemSolveStatus.penPaperProgressIncrement;
    problemSolveStatus.penPaperProgressIncrement.progress +=
      numberOfMergedTicks *
      problemSolveStatus.penPaperProgressIncrement.increment;
  } else if (phase === "during-searching-for-mistake") {
    progressIncrement = problemSolveStatus.implementationProgressIncrement;
    problemSolveStatus.implementationProgressIncrement.progress +=
      numberOfMergedTicks *
      problemSolveStatus.implementationProgressIncrement.increment;
  } else {
    progressIncrement = {
      progress: problemSolveStatus.progress,
      increment: problemSolveStatus.increment,
    };
    problemSolveStatus.progress +=
      problemSolveStatus.increment * numberOfMergedTicks;
  }

  const eventProbabilities = computeProbabilitiesOfEvents(
    events,
    progressIncrement.increment,
    {
      submissions: problemSolveStatus.submissions,
      progress: progressIncrement.progress,
    }
  );

  let eventFired = false;
  let breakData: BreakDataWithProblemPlacementAndUserContestIndex | null = null;

  for (const [event, eventProbability] of zip(events, eventProbabilities)) {
    nextEventIn -= eventProbability * numberOfMergedTicks;
    if (nextEventIn < 0 && !eventFired) {
      eventFired = true;
      breakData = processEventAndReturnBreakData(
        event,
        user,
        indexOfUser,
        problem,
        progressIncrement,
        ticksSinceBeginning,
        dispatch
      );
    }
  }

  return {
    problemSolveStatus,
    nextEventIn,
    breakData,
  };
};
