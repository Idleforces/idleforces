import type { User } from "../users/types";
import {
  READING_TIME_BASE,
  READING_TIME_DISTRIBUTION_PRECISION,
  READING_TIME_SCALING_FACTOR,
} from "./constants";
import type { Problem, ProblemSolveStatusDuringReading } from "./types";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";

export const startReadingProblem = (
  user: User,
  problem: Problem
): ProblemSolveStatusDuringReading => {
  const readingTimeExpectancyMultiplier = computeExpectancyMultiplier(
    "reading",
    user.attributes.reading,
    problem.readingDifficulty,
    READING_TIME_SCALING_FACTOR
  );

  const progress = 0;
  const increment =
    1 /
    (READING_TIME_BASE *
      readingTimeExpectancyMultiplier *
      betaPrimeAltParam(1, READING_TIME_DISTRIBUTION_PRECISION));

  return {
    progress,
    increment,
    phase: "during-reading",
    submissions: [],
  };
};
