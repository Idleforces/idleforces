import { ProblemTag } from "../problems/types";
export type AttributeValue = number;

export type AttributeConstant = {
  MAX_VALUE: number;
  MIN_VALUE: number;
  hardness: number;
};

export enum NonTechnicalAttributeNames {
  penPaperCare = "penPaperCare",
  implementationSpeed = "implementationSpeed",
  implementationCare = "implementationCare",
}

export type AttributeNames =
  | ProblemTag | NonTechnicalAttributeNames;

export type AttributeValues = {
  [K in AttributeNames]: AttributeValue;
};

export type AttributeConstants = {
  [K in AttributeNames]: AttributeConstant;
};
