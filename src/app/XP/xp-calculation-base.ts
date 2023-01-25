import { declareRecordByInitializer } from "../../utils/utils";
import { attributeNames } from "../users/types";
import type { Player } from "../users/types";
import type { XPGain } from "./types";

export const computeExpectancyMultiplierXPFactor = (
  expectancyMultiplier: number
) => {
  return Math.min(
    Math.pow(expectancyMultiplier, 0.5),
    Math.pow(expectancyMultiplier, 1.5)
  );
};

export const modifyAttributesAccordingToXPGain = (
  user: Player,
  XPGain: XPGain
): Player => {
  const originalAttributes = user.attributes;
  const newAttributes = declareRecordByInitializer(
    attributeNames,
    (attributeName) =>
      originalAttributes[attributeName] + (XPGain[attributeName] ?? 0)
  );

  return {
    ...user,
    attributes: newAttributes,
  };
};
