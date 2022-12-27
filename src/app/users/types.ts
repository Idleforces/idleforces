import type { ProblemTag } from "../problems/types";
import type { RatingPoint } from "./load-users";
export type AttributeValue = number;

export type AttributeConstant = {
  MAX_VALUE: number;
  MIN_VALUE: number;
  hardness: number;
};

export enum NonTechnicalAttributeNames {
  reading = "reading",
  penPaperCare = "penPaperCare",
  implementationSpeed = "implementationSpeed",
  implementationCare = "implementationCare",
}

export type AttributeNames =
  | keyof typeof ProblemTag
  | keyof typeof NonTechnicalAttributeNames;

export type AttributeValues = {
  [K in AttributeNames]: AttributeValue;
};

export type AttributeConstants = {
  [K in AttributeNames]: AttributeConstant;
};

export type UserCore = {
  handle: string;
  officialRating: number;
  country: string | null;
  ratingHistory: Array<RatingPoint>;
  attributes: AttributeValues;
};

export type Player = UserCore & {
  isPlayer: true;
};

export type NPC = UserCore & {
  isPlayer: false;
  likelihoodOfCompeting: number;
  /**
   * Value skewed towards 0 -- whenever choosing active problem, probability of i-th easiest problem being chosen is proportional to `P(Poisson(willingnessToTryHarderProblems) = i - 1)`.
   */
  willingnessToTryHarderProblems: number;
  /**
   * Expected time to switch to a different problem is computed as `expectedTimeToFullySolve * expectedTimeMultiplierToSwitchToADifferentProblem` (this does not account for bugs, wrong submissions and events).
   */
  expectedTimeMultiplierToSwitchToADifferentProblem: number;
};

export type User = Player | NPC;
