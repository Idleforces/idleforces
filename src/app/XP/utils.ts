import { declareRecordByInitializer } from "../../utils/utils";
import { attributeNames } from "../users/types";
import type { XPGain } from "./types";

export const addXPGains = (a: XPGain, b: XPGain) => {
  return declareRecordByInitializer(
    attributeNames,
    (attributeName) => (a[attributeName] ?? 0) + (b[attributeName] ?? 0)
  );
};

export const multiplyXPGainByScalar = (a: XPGain, r: number) => {
  return declareRecordByInitializer(
    attributeNames,
    (attributeName) => (a[attributeName] ?? 0) * r
  );
};
