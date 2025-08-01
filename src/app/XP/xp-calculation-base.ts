import { declareRecordByInitializer } from "../../utils/utils";
import { attributeNames } from "../users/types";
import type { Player } from "../users/types";
import type { XPGain } from "./types";
import { levelToXP, XPToLevel } from "../users/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";

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
      XPToLevel(
        Math.max(
          levelToXP(
            originalAttributes[attributeName],
            USER_ATTRIBUTES_CONSTANTS[attributeName]
          ) + (XPGain[attributeName] ?? 0),
          0
        ),
        USER_ATTRIBUTES_CONSTANTS[attributeName]
      )
  );

  return {
    ...user,
    attributes: newAttributes,
  };
};
