import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ContestSlice } from "../contest/types";
import type { RootState } from "../store";

export type ContestArchiveSlice = Array<
  Pick<
    Exclude<ContestSlice, null>,
    "division" | "problems" | "problemScores" | "name"
  > & {
    timestamp: number;
  }
>;

export const contestArchiveSlice = createSlice({
  name: "contestArchive",
  initialState: [] as ContestArchiveSlice,
  reducers: {
    setContestArchive: (
      _state: ContestArchiveSlice,
      action: PayloadAction<ContestArchiveSlice>
    ) => action.payload,

    resetContestArchive: (
      _state: ContestArchiveSlice,
      _action: PayloadAction<null>
    ) => [],

    addContestToArchive: (
      state: ContestArchiveSlice,
      action: PayloadAction<Exclude<ContestSlice, null>>
    ) => {
      state.push({
        division: action.payload.division,
        problems: action.payload.problems,
        problemScores: action.payload.problemScores,
        name: action.payload.name,
        timestamp: Date.now(),
      });
    },
  },
});

export const { setContestArchive, resetContestArchive, addContestToArchive } =
  contestArchiveSlice.actions;

export const selectArchivedContests = (state: RootState) =>
  state.contestArchive;

export const contestArchiveReducer = contestArchiveSlice.reducer;
