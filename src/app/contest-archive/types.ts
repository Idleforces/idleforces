import type { ContestPlayerData, ContestSlice } from "../contest/types";

export type ContestArchivePlayerData = Pick<
  ContestPlayerData,
  "blockingBreak" | "nonBlockingBreaks" | "problemSolveStatuses"
>;

export type ContestArchiveSlice = Array<
  Pick<
    Exclude<ContestSlice, null>,
    "division" | "problems" | "problemScores" | "name"
  > & {
    timestamp: number;
    contestArchivePlayerData: ContestArchivePlayerData;
  }
>;
