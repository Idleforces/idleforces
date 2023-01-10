import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { ProblemDivision, ProblemPlacement } from "../problems/types";
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
        users: Array<User> | null;
        name: string;
      }>
    ) => {
      const users = action.payload.users;
      const name = action.payload.name;
      if (!users || users.length === 0) {
        console.warn("Cannot start a contest when users are not loaded.");
        return null;
      }

      return generateContest(
        action.payload.division,
        action.payload.playerParticipating,
        users,
        name
      );
    },

    resetContest: (_state: ContestSlice, _action: PayloadAction<null>) => null,

    setContest: (_state: ContestSlice, action: PayloadAction<ContestSlice>) =>
      action.payload,

    setContestFinished: (state: ContestSlice, _action: PayloadAction<null>) => {
      return state ? { ...state, contestFinished: true } : null;
    },

    updatePlayerActiveProblemPlacement: (
      state: ContestSlice,
      action: PayloadAction<ProblemPlacement | null>
    ) => {
      if (state)
        state.contestUsersData[0].activeProblemPlacement = action.payload;
    },

    updateContestSlice: (
      state: ContestSlice,
      action: PayloadAction<{
        newContestUsersData: Array<ContestUserData>;
        nextEventIn: number;
        numberOfTicksSimulated: number;
        contestFinished?: true;
      }>
    ) => {
      if (!state) {
        console.warn("Tried to update contest data when there was no contest");
        return null;
      }

      const contestFinished = action.payload.contestFinished ?? false;

      return {
        ...state,
        contestUsersData: action.payload.newContestUsersData,
        nextEventIn: action.payload.nextEventIn,
        contestFinished,
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
  updatePlayerActiveProblemPlacement,
} = contestSlice.actions;

export const selectTicksSinceBeginning = (state: RootState) =>
  state.contest ? state.contest.ticksSinceBeginning : null;
export const selectContest = (state: RootState) => state.contest;
export const selectContestFinished = (state: RootState) =>
  state.contest ? state.contest.finished : null;
export const selectContestName = (state: RootState) =>
  state.contest ? state.contest.name : null;

export const contestReducer = contestSlice.reducer;
