import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ProblemDivision } from "../problems/types";
import type { RootState } from "../store";
import { generateContest } from "./generate-contest";
import type { ContestSlice, ContestUserData } from "./types";
import type { User } from "../users/types";

export const contestSlice = createSlice({
  name: "contest",
  initialState: null as ContestSlice,
  reducers: {
    startContest: (
      _state: ContestSlice,
      action: PayloadAction<{
        division: ProblemDivision;
        playerParticipating: boolean;
        numberOfMergedTicks: number;
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

    resetContest: (_state: ContestSlice, _action: PayloadAction<null>) => null,

    setContest: (_state: ContestSlice, action: PayloadAction<ContestSlice>) =>
      action.payload,

    setContestFinished: (state: ContestSlice, _action: PayloadAction<null>) => {
      return state ? { ...state, finished: true } : null;
    },

    updateContestSlice: (
      state: ContestSlice,
      action: PayloadAction<{
        newContestUsersData: Array<ContestUserData>;
        nextEventIn: number;
        numberOfTicksSimulated: number;
        finished?: true;
      }>
    ) => {
      if (!state) {
        console.warn("Tried to update contest data when there was no contest");
        return null;
      }

      const finished = action.payload.finished ?? false;

      return {
        ...state,
        contestUsersData: action.payload.newContestUsersData,
        nextEventIn: action.payload.nextEventIn,
        finished,
        ticksSinceBeginning:
          state.ticksSinceBeginning + action.payload.numberOfTicksSimulated,
      };
    },
  },
});

export const {
  startContest,
  resetContest,
  setContest,
  setContestFinished,
  updateContestSlice,
} = contestSlice.actions;

export const selectTicksSinceBeginning = (state: RootState) =>
  state.contest ? state.contest.ticksSinceBeginning : null;
export const selectContest = (state: RootState) => state.contest;

export const contestReducer = contestSlice.reducer;
