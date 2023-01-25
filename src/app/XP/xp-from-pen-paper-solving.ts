import { PEN_PAPER_SOLVING_SCALING_FACTOR } from "../problems/constants";
import type { Problem } from "../problems/types";
import { computeExpectancyMultiplier } from "../problems/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../users/constants";
import type { User } from "../users/types";
import {
  PEN_PAPER_CARE_BASE_XP_GAIN,
  PEN_PAPER_CARE_XP_GAIN_SCALING_FACTOR,
  PEN_PAPER_SOLVING_BASE_XP_GAIN,
  PEN_PAPER_SOLVING_XP_GAIN_SCALING_FACTOR,
} from "./constants";
import type { XPGain } from "./types";
import { computeExpectancyMultiplierXPFactor } from "./xp-calculation-base";

export const computeXPGainFromPenPaperSolving = (
  player: User,
  problem: Problem,
  correct: boolean
): XPGain => {
  const tag = problem.tag;

  const penPaperDifficulty = problem.penPaperDifficulty;
  const penPaperDeceptiveness = problem.penPaperDeceptiveness;

  const tagHardness = USER_ATTRIBUTES_CONSTANTS[tag].hardness;
  const penPaperCareHardness =
    USER_ATTRIBUTES_CONSTANTS["penPaperCare"].hardness;

  const expectancyMultiplier = computeExpectancyMultiplier(
    tag,
    player.attributes[tag],
    penPaperDifficulty,
    PEN_PAPER_SOLVING_SCALING_FACTOR
  );

  const attributeXPGain =
    PEN_PAPER_SOLVING_BASE_XP_GAIN *
    tagHardness *
    computeExpectancyMultiplierXPFactor(expectancyMultiplier) *
    Math.pow(PEN_PAPER_SOLVING_XP_GAIN_SCALING_FACTOR, penPaperDifficulty);

  const penPaperCareXPGain =
    PEN_PAPER_CARE_BASE_XP_GAIN *
    penPaperCareHardness *
    computeExpectancyMultiplierXPFactor(expectancyMultiplier) *
    Math.pow(PEN_PAPER_CARE_XP_GAIN_SCALING_FACTOR, penPaperDeceptiveness);

  if (correct)
    return {
      [tag]: 1.5 * attributeXPGain,
      penPaperCare: 0.7 * penPaperCareXPGain,
    };
  else
    return {
      [tag]: 0.2 * attributeXPGain,
      penPaperCare: penPaperCareXPGain,
    };
};
