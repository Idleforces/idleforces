import { IMPLEMENTATION_SCALING_FACTOR } from "../problems/constants";
import type { Problem } from "../problems/types";
import { computeExpectancyMultiplier } from "../problems/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { User } from "../users/types";
import {
  IMPLEMENTATION_CARE_XP_GAIN,
  IMPLEMENTATION_CARE_XP_SCALING_FACTOR,
  IMPLEMENTATION_XP_GAIN,
  IMPLEMENTATION_XP_SCALING_FACTOR,
} from "./constants";
import type { XPGain } from "./types";
import { computeExpectancyMultiplierXPFactor } from "./xp-calculation-base";

export const computeXPGainFromImplementing = (
  player: User,
  problem: Problem,
  correct: boolean
): XPGain => {
  const implementationDifficulty = problem.implementationDifficulty;
  const implementationDeceptiveness = problem.implementationDeceptiveness;

  const implementationSpeedHardness =
    USER_ATTRIBUTES_CONSTANTS["implementationSpeed"].hardness;
  const implementationCareHardness =
    USER_ATTRIBUTES_CONSTANTS["implementationCare"].hardness;

  const expectancyMultiplier = computeExpectancyMultiplier(
    "implementationSpeed",
    player.attributes.implementationSpeed,
    implementationDifficulty,
    IMPLEMENTATION_SCALING_FACTOR
  );

  const implementationXPGain =
    IMPLEMENTATION_XP_GAIN *
    implementationSpeedHardness *
    computeExpectancyMultiplierXPFactor(expectancyMultiplier) *
    Math.pow(IMPLEMENTATION_XP_SCALING_FACTOR, implementationDifficulty);

  const implementationCareXPGain =
    IMPLEMENTATION_CARE_XP_GAIN *
    implementationCareHardness *
    computeExpectancyMultiplierXPFactor(expectancyMultiplier) *
    Math.pow(
      IMPLEMENTATION_CARE_XP_SCALING_FACTOR,
      implementationDeceptiveness
    );

  if (correct)
    return {
      implementationSpeed: 1.5 * implementationXPGain,
      implementationCare: 0.5 * implementationCareXPGain,
    };
  else
    return {
      implementationSpeed: 0.2 * implementationXPGain,
      implementationCare: implementationCareXPGain,
    };
};
