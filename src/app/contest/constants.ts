import type { ProblemDivision, ProblemPlacement } from "../problems/types";

export const CONTEST_LENGTH = 7200;
export const EXPECTED_NUMBER_TICKS_PER_PHASE = 1200;

export const PROBLEM_SCORE_SCALING_FACTOR = 700;
export const PROBLEM_SCORE_STDEV_AT_PLACEMENT_A = 150;

export const MIN_USERS_SATISFYING_RATING_BOUND_TO_START_CONTEST = 100;
export const DIVISION_MERGE_TICKS_COUNT: Record<ProblemDivision, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
};

export const EXPECTED_PROBLEM_SCORE = (problemPlacement: ProblemPlacement) => {
  switch (problemPlacement) {
    case "A":
      return 500;
    case "B":
      return 800;
    case "C":
      return 1200;
    case "D":
      return 1750;
    case "E":
      return 2500;
    case "F":
      return 3500;
  }
};

export const WRONG_SUBMISSION_PENALTY = 50;
export const MIN_RATIO_OF_MAX_SCORE = 0.2;
