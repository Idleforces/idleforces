import { READING_TIME_SCALING_FACTOR } from "../problems/constants";
import type { Problem } from "../problems/types";
import { computeExpectancyMultiplier } from "../problems/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { User } from "../users/types";
import {
  READING_BASE_XP_GAIN,
  READING_XP_GAIN_SCALING_FACTOR,
} from "./constants";
import type { XPGain } from "./types";
import { computeExpectancyMultiplierXPFactor } from "./xp-calculation-base";

export const computeXPGainFromReading = (
  player: User,
  problem: Problem
): XPGain => {
  const readingDifficulty = problem.readingDifficulty;
  const readingHardness = USER_ATTRIBUTES_CONSTANTS["reading"].hardness;
  const expectancyMultiplier = computeExpectancyMultiplier(
    "reading",
    player.attributes.reading,
    readingDifficulty,
    READING_TIME_SCALING_FACTOR
  );

  const readingXPGain =
    READING_BASE_XP_GAIN *
    readingHardness *
    computeExpectancyMultiplierXPFactor(expectancyMultiplier) *
    Math.pow(READING_XP_GAIN_SCALING_FACTOR, readingDifficulty);

  return {
    reading: readingXPGain,
  };
};
