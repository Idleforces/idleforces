import type { BreakDataWithProblemPlacement } from "../events/types";
import type {
  Problem,
  ProblemDivision,
  ProblemPlacement,
  ProblemSolveStatus,
} from "../problems/types";
import type { RatingPoint } from "../users/load-users";

export type ContestProblems = Array<Problem>;
export type ContestProblemNumberValues = Array<number>;
export type NonBlockingBreaks = Record<
  ProblemPlacement,
  BreakDataWithProblemPlacement | null
>;
export type ProblemSolveStatuses = Record<ProblemPlacement, ProblemSolveStatus>;

export type ContestCoreData = {
  handle: string;
  blockingBreak: BreakDataWithProblemPlacement | null;
  nonBlockingBreaks: NonBlockingBreaks;
  problemSolveStatuses: ProblemSolveStatuses;
  activeProblemPlacement: ProblemPlacement | null;
};

export type ContestNPCData = ContestCoreData & {
  isPlayer: false;
  numberOfTimesSwitched: ContestProblemNumberValues;
  remainingTicksToSwitchToAnotherProblem: number;
};

export type ContestPlayerData = ContestCoreData & {
  isPlayer: true;
};

export type ContestUserData = ContestNPCData | ContestPlayerData;

export type ContestSlice = {
  ticksSinceBeginning: number;
  division: ProblemDivision;
  nextEventIn: number;
  problems: ContestProblems;
  problemScores: ContestProblemNumberValues;
  problemScoreDecrementsPerMinute: ContestProblemNumberValues;
  contestUsersData: Array<ContestUserData>;
} | null;

export type ContestUserStats = {
  handle: string;
  scores: Array<number>;
  wrongSubmissionCounts: Array<number>;
  oldRating: number;
  country: string | null;
};

/**
 * Rating points indexed by user handle.
 */
export type RatingPoints = {
  [handle in string]: RatingPoint;
};
