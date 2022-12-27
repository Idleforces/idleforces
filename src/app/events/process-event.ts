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
  events: Array<ContestEventBlueprint>,
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

const processEventAndReturnBreaks = <RootStateType>(
  event: ContestEventBlueprint,
  user: User,
  userContestIndex: number,
  problem: Problem,
  progressIncrement: ProblemProgressIncrement,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch
): Array<BreakDataWithProblemPlacementAndUserContestIndex> => {
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
      return [
        {
          ...event.setBreakInTicks({
            tag: problem.tag,
            user,
            penPaperDifficulty: problem.penPaperDifficulty,
            implementationDifficulty: problem.implementationDifficulty,
          }),
          problemPlacement: problem.placement,
          userContestIndex,
        },
      ];
    } else
      return [
        {
          ...event.setBreakInTicks,
          problemPlacement: problem.placement,
          userContestIndex,
        },
      ];
  }

  return [];
};

export const processEventsAndIncrementProgress = <RootStateType>(
  events: Array<ContestEventBlueprint>,
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
  breaksToAddToStore: Array<BreakDataWithProblemPlacementAndUserContestIndex>;
} => {
  const phase = problemSolveStatus.phase;
  events = events.filter(
    (event) => event.phases === "all" || event.phases.includes(phase)
  );

  const progressIncrement =
    phase === "during-searching-for-mistake" &&
    Math.floor(ticksSinceBeginning / numberOfMergedTicks) % 2 > 0
      ? problemSolveStatus.penPaperProgressIncrement
      : phase === "during-searching-for-mistake"
      ? problemSolveStatus.implementationProgressIncrement
      : {
          progress: problemSolveStatus.progress,
          increment: problemSolveStatus.increment,
        };

  const eventProbabilities = computeProbabilitiesOfEvents(
    events,
    progressIncrement.increment,
    {
      submissions: problemSolveStatus.submissions,
      progress: progressIncrement.progress,
    }
  );

  let eventFired = false;
  const breaksToAddToStore: Array<BreakDataWithProblemPlacementAndUserContestIndex> =
    [];

  for (const [event, eventProbability] of zip(events, eventProbabilities)) {
    nextEventIn -= eventProbability * numberOfMergedTicks;
    if (nextEventIn < 0 && !eventFired) {
      eventFired = true;
      breaksToAddToStore.concat(
        processEventAndReturnBreaks(
          event,
          user,
          indexOfUser,
          problem,
          progressIncrement,
          ticksSinceBeginning,
          dispatch
        )
      );
    }
  }

  progressIncrement.progress +=
    progressIncrement.increment * numberOfMergedTicks;

  return {
    problemSolveStatus,
    nextEventIn,
    breaksToAddToStore,
  };
};
