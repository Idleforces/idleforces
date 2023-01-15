import type { ProblemDivision } from "../problems/types";

export const DIVISION_COOLDOWNS: Record<ProblemDivision, number> = {
  1: 1000 * 60 * 60 * 24,
  2: 1000 * 60 * 60 * 6,
  3: 1000 * 60 * 60 * 2,
  4: 1000 * 60 * 30,
} as const;
