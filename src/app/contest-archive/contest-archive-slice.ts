import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ContestSlice } from "../contest/types";
import type { RootState } from "../store";
import type { ContestArchivePlayerData, ContestArchiveSlice } from "./types";
import { declareRecordByInitializer } from "../../utils/utils";
import { problemPlacements } from "../problems/types";
import { generateInitialProblemSolveStatus } from "../problems/solve-problem";

const contestArchiveSlice = createSlice({
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
      const contest = action.payload;
      const playerParticipating = contest.contestUsersData[0].isPlayer;

      let contestArchivePlayerData: ContestArchivePlayerData = {
        blockingBreak: null,
        nonBlockingBreaks: declareRecordByInitializer(
          problemPlacements,
          (_placement) => null
        ),
        problemSolveStatuses: declareRecordByInitializer(
          problemPlacements,
          (_placement) => generateInitialProblemSolveStatus()
        ),
      };

      if (playerParticipating) {
        const contestPlayerData = contest.contestUsersData[0];
        contestArchivePlayerData = {
          blockingBreak: contestPlayerData.blockingBreak,
          nonBlockingBreaks: contestPlayerData.nonBlockingBreaks,
          problemSolveStatuses: contestPlayerData.problemSolveStatuses,
        };
      }

      state.push({
        division: contest.division,
        problems: contest.problems,
        problemScores: contest.problemScores,
        name: action.payload.name,
        timestamp: Date.now(),
        contestArchivePlayerData,
      });
    },
  },
});

export const { setContestArchive, resetContestArchive, addContestToArchive } =
  contestArchiveSlice.actions;

export const selectArchivedContests = (state: RootState) =>
  state.contestArchive;

export const contestArchiveReducer = contestArchiveSlice.reducer;
