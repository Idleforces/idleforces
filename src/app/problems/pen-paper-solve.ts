import logit from "@stdlib/math/base/special/logit";
import { sigmoid } from "../../utils/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { User } from "../users/types";
import { normalizeLevelOfAttribute } from "../users/utils";
import {
  PEN_PAPER_SOLVING_DISTRIBUTION_PRECISION,
  PEN_PAPER_SOLVING_SCALING_FACTOR,
  PEN_PAPER_SOLVING_TIME_BASE,
  PROBABILITY_OF_PEN_PAPER_CORRECT_SCALING_FACTOR,
} from "./constants";
import type {
  ContestSubmission,
  Problem,
  ProblemSolveStatusDuringPenPaperSolving,
} from "./types";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";

export const startPenPaperSolving = (
  user: User,
  problem: Problem,
  submissions: Array<ContestSubmission>
): ProblemSolveStatusDuringPenPaperSolving => {
  const penPaperSolvingExpectancyMultiplier = computeExpectancyMultiplier(
    problem.tag,
    user.attributes[problem.tag],
    problem.penPaperDifficulty,
    PEN_PAPER_SOLVING_SCALING_FACTOR
  );

  const increment =
    1 /
    (PEN_PAPER_SOLVING_TIME_BASE *
      penPaperSolvingExpectancyMultiplier *
      betaPrimeAltParam(1, PEN_PAPER_SOLVING_DISTRIBUTION_PRECISION));
  const progress = 0;

  return {
    phase: "during-pen-paper-solving",
    progress,
    increment,
    submissions,
  };
};

export const computeIfPenPaperCorrect = (
  user: User,
  problem: Problem,
  submissions: Array<ContestSubmission>
): boolean => {
  const probabilityOfPenPaperCorrect = sigmoid(
    PROBABILITY_OF_PEN_PAPER_CORRECT_SCALING_FACTOR *
      (logit(
        normalizeLevelOfAttribute(
          user.attributes.penPaperCare,
          USER_ATTRIBUTES_CONSTANTS.penPaperCare
        )
      ) -
        logit(problem.penPaperDeceptiveness)) +
      1.6 -
      (Math.pow(submissions.length + 1, 0.2) - 1)
  );

  return Math.random() < probabilityOfPenPaperCorrect;
};
