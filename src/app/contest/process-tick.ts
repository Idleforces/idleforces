import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { addEvent } from "../events/events-slice";
import { resetNextEventIn } from "../events/next-event";
import { processTickOfProblemSolving } from "../problems/solve-problem";
import type {
  Problem,
  ProblemDivision,
  ProblemPlacement,
} from "../problems/types";
import { problemPlacements } from "../problems/types";
import { isActiveProblemSolveStatus } from "../problems/types";
import {
  computeProblemPositionFromProblemPlacement,
  computeProblemPlacementFromProblemPosition,
  computeTimeToSwitchToAnotherProblem,
} from "../problems/utils";
import type { MockDispatch } from "../types";
import type { NPC, User } from "../users/types";
import { computeActiveProblemPosition } from "./active-problem";
import type { ContestSlice, ContestUserData } from "./types";
import { cloneDeep } from "lodash";

const automaticallySwitchToAnotherProblem = (
  contestUserData: ContestUserData,
  division: ProblemDivision,
  problems: Array<Problem>,
  lastProblemPlacement: ProblemPlacement | null,
  user: User
): void => {
  const activeProblemPlacement = contestUserData.activeProblemPlacement;
  const problemSolveStatuses = contestUserData.problemSolveStatuses;

  const problemPositionsThatCanBecomeActive = problemPlacements.map(
    (placement) =>
      (isActiveProblemSolveStatus(problemSolveStatuses[placement]) ||
        problemSolveStatuses[placement].phase === "before-reading") &&
      placement !== activeProblemPlacement
  );

  const firstIndexThatCanBecomeActive: number =
    problemPositionsThatCanBecomeActive.findIndex(
      (canBecomeActive) => canBecomeActive
    );
  const firstPositionThatCanBecomeActive: number | null =
    firstIndexThatCanBecomeActive >= 0 ? firstIndexThatCanBecomeActive : null;

  const newActiveProblemPosition: number | null = user.isPlayer
    ? firstPositionThatCanBecomeActive
    : computeActiveProblemPosition(
        problemPositionsThatCanBecomeActive,
        user.willingnessToTryHarderProblems
      );

  contestUserData.activeProblemPlacement =
    newActiveProblemPosition !== null
      ? computeProblemPlacementFromProblemPosition(newActiveProblemPosition)
      : null;

  if (!contestUserData.isPlayer) {
    if (lastProblemPlacement)
      contestUserData.numberOfTimesSwitched[
        computeProblemPositionFromProblemPlacement(lastProblemPlacement)
      ]++;

    contestUserData.remainingTicksToSwitchToAnotherProblem =
      newActiveProblemPosition !== null &&
      contestUserData.activeProblemPlacement
        ? computeTimeToSwitchToAnotherProblem(
            user as NPC,
            contestUserData.activeProblemPlacement,
            division,
            problems[newActiveProblemPosition].tag,
            contestUserData.numberOfTimesSwitched[newActiveProblemPosition]
          )
        : 999999;
  }
};

export const processTickOfContest = <RootStateType>(
  contestSlice: Exclude<ContestSlice, null>,
  numberOfMergedTicks: number,
  users: Array<User>,
  dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch
): {
  newContestUsersData: Array<ContestUserData>;
  nextEventIn: number;
} => {
  let nextEventIn = contestSlice.nextEventIn;
  const ticksSinceBeginning = contestSlice.ticksSinceBeginning;
  let userSliceIndex = 0;

  const newContestUsersData = contestSlice.contestUsersData
    .map((contestUserData) => cloneDeep(contestUserData))
    .map((contestUserData, userContestIndex) => {
      while (users[userSliceIndex].handle !== contestUserData.handle)
        userSliceIndex++;
      const user = users[userSliceIndex];

      const blockingBreak = contestUserData.blockingBreak;
      if (
        blockingBreak &&
        blockingBreak.breakRemainingLength >= numberOfMergedTicks
      ) {
        blockingBreak.breakRemainingLength -= numberOfMergedTicks;
        return contestUserData;
      } else if (blockingBreak) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: blockingBreak.messageOnEndOfBreak,
              ticksSinceBeginning,
              problemPlacement: blockingBreak.problemPlacement,
              sentiment: "positive",
            })
          );

        contestUserData.blockingBreak = null;
        return contestUserData;
      }
      contestUserData.blockingBreak = blockingBreak;

      const activeProblemPlacement = contestUserData.activeProblemPlacement;
      if (!activeProblemPlacement) return contestUserData;

      const nonBlockingBreak =
        contestUserData.nonBlockingBreaks[activeProblemPlacement];
      if (
        nonBlockingBreak &&
        nonBlockingBreak.breakRemainingLength > numberOfMergedTicks
      ) {
        nonBlockingBreak.breakRemainingLength -= numberOfMergedTicks;
        return contestUserData;
      } else if (nonBlockingBreak) {
        if (user.isPlayer)
          dispatch(
            addEvent({
              message: nonBlockingBreak.messageOnEndOfBreak,
              ticksSinceBeginning,
              problemPlacement: nonBlockingBreak.problemPlacement,
              sentiment: "positive",
            })
          );

        contestUserData.nonBlockingBreaks[activeProblemPlacement] = null;
        return contestUserData;
      }
      contestUserData.nonBlockingBreaks[activeProblemPlacement] =
        nonBlockingBreak;

      const problemSolveStatuses = contestUserData.problemSolveStatuses;
      const activeProblemProblemSolveStatus =
        problemSolveStatuses[activeProblemPlacement];
      const problems = contestSlice.problems;

      if (
        (!contestUserData.isPlayer &&
          contestUserData.remainingTicksToSwitchToAnotherProblem <= 0) ||
        activeProblemProblemSolveStatus.phase === "after-passing-pretests" ||
        activeProblemProblemSolveStatus.phase === "after-passing-systests" ||
        activeProblemProblemSolveStatus.phase === "after-failing-systests"
      ) {
        automaticallySwitchToAnotherProblem(
          contestUserData,
          contestSlice.division,
          contestSlice.problems,
          activeProblemPlacement,
          user
        );
        return contestUserData;
      }

      if (!contestUserData.isPlayer) {
        contestUserData.remainingTicksToSwitchToAnotherProblem -=
          numberOfMergedTicks;
      }

      const newProblemSolveStatusWithNextEventInAndBreaks =
        processTickOfProblemSolving<RootStateType>(
          user,
          userContestIndex,
          problems[
            computeProblemPositionFromProblemPlacement(activeProblemPlacement)
          ],
          activeProblemProblemSolveStatus,
          nextEventIn,
          numberOfMergedTicks,
          ticksSinceBeginning,
          dispatch
        );

      nextEventIn = newProblemSolveStatusWithNextEventInAndBreaks.nextEventIn;
      if (nextEventIn <= 0) nextEventIn = resetNextEventIn(nextEventIn);

      contestUserData.problemSolveStatuses[activeProblemPlacement] =
        newProblemSolveStatusWithNextEventInAndBreaks.newProblemSolveStatus;

      const breakData = newProblemSolveStatusWithNextEventInAndBreaks.breakData;
      if (breakData) {
        const breakProblemPlacement = breakData.problemPlacement;
        const breakRemainingLength = breakData.breakRemainingLength;
        const messageOnEndOfBreak = breakData.messageOnEndOfBreak;

        const newBreak = {
          problemPlacement: breakProblemPlacement,
          breakRemainingLength,
          messageOnEndOfBreak,
          isBlocking: true,
        };

        if (breakData.isBlocking) {
          contestUserData.blockingBreak = newBreak;
        } else if (breakProblemPlacement !== "global") {
          contestUserData.nonBlockingBreaks[breakProblemPlacement] = newBreak;
        }
      }

      return contestUserData;
    });

  return { newContestUsersData, nextEventIn };
};
