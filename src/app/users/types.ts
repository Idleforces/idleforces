import { ProblemTag } from "../problems/types";
export type AttributeValue = number;

export type AttributeConstant = {
  MAX_VALUE: number;
  MIN_VALUE: number;
  hardness: number;
};

export type AttributeNames =
  | ProblemTag
  | "penPaperCare"
  | "implementationSpeed"
  | "implementationCare";

export type AttributeValues = {
  [K in AttributeNames]: AttributeValue;
};

export type AttributeConstants = {
  [K in AttributeNames]: AttributeConstant;
};
