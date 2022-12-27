import type {
  AnyAction,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { BreakDataWithProblemPlacementAndUserContestIndex } from "../events/types";
import type { ProblemDivision } from "../problems/types";
import type { RootState } from "../store";
import { generateContest } from "./generate-contest";
import { processSystests } from "./process-systests";
import { processTickOfContest } from "./process-tick";
import type { ContestSlice } from "./types";
import { recalculateRatings } from "./recalculate-ratings";
import type { User } from "../users/types";
import type { MockDispatch } from "../types";

export const contestSlice = createSlice({
  name: "contest",
  initialState: null as ContestSlice,
  reducers: {
    startContest: (
      _state: ContestSlice,
      action: PayloadAction<{
        division: ProblemDivision;
        playerParticipating: boolean;
        users: Array<User> | null;
      }>
    ) => {
      const users = action.payload.users;
      if (!users || users.length === 0) {
        console.warn("Cannot start a contest when users are not loaded.");
        return null;
      }

      return generateContest(
        action.payload.division,
        action.payload.playerParticipating,
        users
      );
    },

    updateContestSliceAfterTickOfContest: <RootStateType>(
      state: ContestSlice,
      action: PayloadAction<{
        numberOfMergedTicks: number;
        users: Array<User> | null;
        dispatch: ThunkDispatch<RootStateType, void, AnyAction> | MockDispatch;
      }>
    ) => {
      const dispatch = action.payload.dispatch;
      const users = action.payload.users;
      if (!users || !state) {
        console.warn(
          "Tried to process a tick of contest whenever there were no users or no contest."
        );
        return null;
      }

      const { newContestUsersData, breaksToAddToStore } =
        processTickOfContest<RootStateType>(
          state,
          action.payload.numberOfMergedTicks,
          users,
          state.ticksSinceBeginning,
          dispatch
        );

      dispatch(addBreaks(breaksToAddToStore));

      return {
        ...state,
        ticksSinceBeginning:
          state.ticksSinceBeginning + action.payload.numberOfMergedTicks,
        contestUsersData: newContestUsersData,
      };
    },

    processSystestsAndRecalculateRatings: (
      state: ContestSlice,
      action: PayloadAction<Array<User> | null>
    ) => {
      const users = action.payload;
      if (!state || !users) {
        console.warn(
          "Tried to process systests on a contest that does not exist yet or whenever users are not defined."
        );
        return null;
      }

      const problems = state.problems;
      const contestUsersData = state.contestUsersData;
      const problemScores = state.problemScores;
      const problemScoreDecrementsPerMinute =
        state.problemScoreDecrementsPerMinute;

      const newContestUsersData = processSystests(problems, contestUsersData);
      recalculateRatings(
        newContestUsersData,
        problemScores,
        problemScoreDecrementsPerMinute,
        users
      );
    },

    resetContest: (_state: ContestSlice, _action: PayloadAction<null>) => null,

    addBreaks: (
      state: ContestSlice,
      action: PayloadAction<
        Array<BreakDataWithProblemPlacementAndUserContestIndex>
      >
    ): ContestSlice => {
      if (state === null) return null;
      const breaksData = action.payload;
      breaksData.forEach((breakData) => {
        const contestUserData =
          state.contestUsersData[breakData.userContestIndex];
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
      });
      return state;
    },

    setNextEventIn: (state: ContestSlice, action: PayloadAction<number>) => {
      return state ? { ...state, nextEventIn: action.payload } : null;
    },
  },
});

export const {
  startContest,
  updateContestSliceAfterTickOfContest,
  resetContest,
  addBreaks,
  setNextEventIn,
  processSystestsAndRecalculateRatings,
} = contestSlice.actions;
export const selectTicksSinceBeginning = (state: RootState) =>
  state.contest ? state.contest.ticksSinceBeginning : null;
export const contestReducer = contestSlice.reducer;

export const getTicksSinceBeginning = (): ThunkAction<
  number,
  RootState,
  undefined,
  AnyAction
> => {
  return function getTicksSinceBeginningThunk(_dispatch, getState) {
    const contest = getState().contest;
    if (contest) return contest.ticksSinceBeginning;
    else {
      console.warn("Bad input passed to getTicksSinceBeginning function");
      return 0;
    }
  };
};
