import logit from "@stdlib/math/base/special/logit";
import { sigmoid } from "../../utils/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { User } from "../users/types";
import { normalizeLevelOfAttribute } from "../users/utils";
import {
  IMPLEMENTATION_DISTRIBUTION_PRECISION,
  IMPLEMENTATION_SCALING_FACTOR,
  IMPLEMENTATION_TIME_BASE,
  PROBABILITY_OF_IMPLEMENTATION_CORRECT_SCALING_FACTOR,
} from "./constants";
import type {
  ContestSubmission,
  Problem,
  ProblemSolveStatusDuringImplementing,
} from "./types";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";

export const startImplementing = (
  user: User,
  problem: Problem,
  penPaperCorrect: boolean,
  submissions: Array<ContestSubmission>
): ProblemSolveStatusDuringImplementing => {
  const implementationExpectancyMultiplier = computeExpectancyMultiplier(
    "implementationSpeed",
    user.attributes["implementationSpeed"],
    problem.implementationDifficulty,
    IMPLEMENTATION_SCALING_FACTOR
  );

  const increment =
    1 /
    (IMPLEMENTATION_TIME_BASE *
      implementationExpectancyMultiplier *
      betaPrimeAltParam(1, IMPLEMENTATION_DISTRIBUTION_PRECISION));
  const progress = 0;

  return {
    phase: "during-implementing",
    progress,
    increment,
    submissions,
    penPaperCorrect,
  };
};

export const computeIfImplementationCorrect = (
  user: User,
  problem: Problem,
  submissions: Array<ContestSubmission>
): boolean => {
  const probabilityOfImplementationCorrect = sigmoid(
    PROBABILITY_OF_IMPLEMENTATION_CORRECT_SCALING_FACTOR *
      (logit(
        normalizeLevelOfAttribute(
          user.attributes.implementationCare,
          USER_ATTRIBUTES_CONSTANTS.implementationCare
        )
      ) -
        logit(problem.implementationDeceptiveness)) +
      1.5 -
      (Math.pow(submissions.length + 1, 0.25) - 1)
  );

  return Math.random() < probabilityOfImplementationCorrect;
};
