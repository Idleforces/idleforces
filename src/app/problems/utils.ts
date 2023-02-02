import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { AttributeNames, NPC } from "../users/types";
import { normalizeLevelOfAttribute } from "../users/utils";
import logit from "@stdlib/math/base/special/logit";
import { betaprime } from "@stdlib/random/base";
import type { ProblemDivision, ProblemPlacement, ProblemTag } from "./types";
import { problemPlacements } from "./types";
import type { User } from "../users/types";
import {
  computeCombinedPlacementDivisionFactor,
  computeCombinedPlacementPlacementFactor,
  IMPLEMENTATION_SCALING_FACTOR,
  IMPLEMENTATION_TIME_BASE,
  PEN_PAPER_SOLVING_SCALING_FACTOR,
  PEN_PAPER_SOLVING_TIME_BASE,
  PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT,
  PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER,
  PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT,
  PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER,
  PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT,
  PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER,
  PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT,
  PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER,
  PROBLEM_READING_DIFFICULTY_MIDPOINT,
  PROBLEM_READING_DIFFICULTY_MULTIPLIER,
  READING_TIME_BASE,
  READING_TIME_SCALING_FACTOR,
  TIME_TO_SWITCH_TO_ANOTHER_PROBLEM_DISTRIBUTION_PRECISION,
} from "./constants";
import { sigmoid } from "../../utils/utils";

/**
 *
 * @param exp The expectation of the desired distribution.
 * @param v The precision of the desired distribution. Converges in distribution to constant mean as v -> \infty.
 * @link https://en.wikipedia.org/wiki/Beta_prime_distribution
 * @returns Sample from betaPrime distribution.
 */
export const betaPrimeAltParam = (exp: number, v: number): number => {
  if (Number.isNaN(exp) || Number.isNaN(v) || exp <= 0 || v <= 0) {
    console.warn("Bad input was passed to betaPrimeAltParam function.");
    return 0;
  }

  return betaprime(exp * (1 + v), 2 + v);
};

export const computeExpectancyMultiplier = (
  userAttributeName: AttributeNames,
  userAttributeLevel: number,
  problemAttributeValue: number,
  scalingFactor: number
): number => {
  const normalizedUserAttributeValue = normalizeLevelOfAttribute(
    userAttributeLevel,
    USER_ATTRIBUTES_CONSTANTS[userAttributeName]
  );

  return Math.pow(
    scalingFactor,
    logit(problemAttributeValue) - logit(normalizedUserAttributeValue)
  );
};

export const computeCombinedPlacementBetweenDivisions = (
  placement: ProblemPlacement,
  division: ProblemDivision
): number => {
  return (
    computeCombinedPlacementDivisionFactor(division) +
    computeCombinedPlacementPlacementFactor(placement)
  );
};

/**
 *
 * @param placement `placement` of the problem.
 * @returns 0-indexed position of the problem in contest.
 */
export const computeProblemPositionFromProblemPlacement = (
  placement: ProblemPlacement
): number => {
  return placement.charCodeAt(0) - "A".charCodeAt(0);
};

/**
 *
 * @param position 0-indexed position of the problem in contest.
 * @returns `placement` of the problem. Returns "A" and warns if the input is invalid.
 */
export const computeProblemPlacementFromProblemPosition = (
  position: number
): ProblemPlacement => {
  let problemPlacement: ProblemPlacement = "A";
  problemPlacements.forEach((placement) => {
    if (computeProblemPositionFromProblemPlacement(placement) === position) {
      problemPlacement = placement;
      return;
    }
  });
  return problemPlacement;
};

export const computeExpectedLogitOfReadingDifficulty = (
  combinedPlacement: number
): number => {
  return (
    PROBLEM_READING_DIFFICULTY_MULTIPLIER *
    (combinedPlacement - PROBLEM_READING_DIFFICULTY_MIDPOINT)
  );
};

export const computeExpectedLogitOfPenPaperDifficulty = (
  combinedPlacement: number
): number => {
  return (
    PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER *
    (combinedPlacement - PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT)
  );
};

export const computeExpectedLogitOfImplementationDifficulty = (
  combinedPlacement: number
): number => {
  return (
    PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER *
    (combinedPlacement - PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT)
  );
};

export const computeExpectedLogitOfPenPaperDeceptiveness = (
  combinedPlacement: number
): number => {
  return (
    PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER *
    (combinedPlacement - PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT)
  );
};

export const computeExpectedLogitOfImplementationDeceptiveness = (
  combinedPlacement: number
): number => {
  return (
    PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER *
    (combinedPlacement - PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT)
  );
};

const computeExpectedTimeToFullySolve = (
  user: User,
  placement: ProblemPlacement,
  division: ProblemDivision,
  tag: ProblemTag
): number => {
  const combinedPlacement = computeCombinedPlacementBetweenDivisions(
    placement,
    division
  );

  return (
    READING_TIME_BASE *
      computeExpectancyMultiplier(
        "reading",
        user.attributes.reading,
        sigmoid(computeExpectedLogitOfReadingDifficulty(combinedPlacement)),
        READING_TIME_SCALING_FACTOR
      ) +
    PEN_PAPER_SOLVING_TIME_BASE *
      computeExpectancyMultiplier(
        tag,
        user.attributes[tag],
        sigmoid(computeExpectedLogitOfPenPaperDifficulty(combinedPlacement)),
        PEN_PAPER_SOLVING_SCALING_FACTOR
      ) +
    IMPLEMENTATION_TIME_BASE *
      computeExpectancyMultiplier(
        "implementationSpeed",
        user.attributes.implementationSpeed,
        sigmoid(
          computeExpectedLogitOfImplementationDifficulty(combinedPlacement)
        ),
        IMPLEMENTATION_SCALING_FACTOR
      )
  );
};

export const computeTimeToSwitchToAnotherProblem = (
  NPC: NPC,
  placement: ProblemPlacement,
  division: ProblemDivision,
  tag: ProblemTag,
  numberOfTimesSwitched: number
): number => {
  return (
    (NPC.expectedTimeMultiplierToSwitchToADifferentProblem *
      computeExpectedTimeToFullySolve(NPC, placement, division, tag) *
      betaPrimeAltParam(
        1,
        TIME_TO_SWITCH_TO_ANOTHER_PROBLEM_DISTRIBUTION_PRECISION
      )) /
    Math.pow(numberOfTimesSwitched + 1, 0.6)
  );
};
