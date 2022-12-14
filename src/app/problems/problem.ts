import { ProblemDivision, ProblemPlacement, ProblemTag } from "./types";
import { beta, normal } from "@stdlib/random/base";
import {
  PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT,
  PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER,
  PROBLEM_IMPLEMENTATION_DECEPTIVENESS_STDEV,
  PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT,
  PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER,
  PROBLEM_IMPLEMENTATION_DIFFICULTY_STDEV,
  PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT,
  PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER,
  PROBLEM_PEN_PAPER_DECEPTIVENESS_STDEV,
  PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT,
  PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER,
  PROBLEM_PEN_PAPER_DIFFICULTY_STDEV,
  PROBLEM_PRETESTS_QUALITY_ALPHA,
  PROBLEM_PRETESTS_QUALITY_BETA,
  PROBLEM_QUALITY_PRECISION_ALPHA,
  PROBLEM_QUALITY_PRECISION_BETA,
  PROBLEM_QUALITY_RECALL_ALPHA,
  PROBLEM_QUALITY_RECALL_BETA,
  PROBLEM_READING_DIFFICULTY_MIDPOINT,
  PROBLEM_READING_DIFFICULTY_MULTIPLIER,
  PROBLEM_READING_DIFFICULTY_STDEV,
} from "./constants";
import { normalizeArray, sigmoid, sum } from "../../utils/utils";
import { sample } from "@stdlib/random";
import { likelihoodOfAppearing } from "./generate-tag";

export const generateProblem = (
  division: ProblemDivision,
  placement: ProblemPlacement
) => {
  /**
   * 0-1 (heavily skewed towards 1) determining 1 - P(incorrect sol. passes). If far from 1, round may become unrated.
   */
  const qualityPrecision = beta(
    PROBLEM_QUALITY_PRECISION_ALPHA,
    PROBLEM_QUALITY_PRECISION_BETA
  );

  /**
   * 0-1 (very heavily skewed towards 1) determining P(correct sol. passes).
   */
  const qualityRecall = beta(
    PROBLEM_QUALITY_RECALL_ALPHA,
    PROBLEM_QUALITY_RECALL_BETA
  );

  /**
   * 0-1 (skewed towards 1) determining P(incorrect sol. fails pretests). If far from 1, round may become unrated.
   */
  const pretestsQuality = beta(
    PROBLEM_PRETESTS_QUALITY_ALPHA,
    PROBLEM_PRETESTS_QUALITY_BETA
  );

  const combinedPlacement =
    placement.charCodeAt(0) - "A".charCodeAt(0) + (4 - division) * 2;

  /**
   * 0-1 determining the time to read. Counter with leveling up reading.
   */
  const readingDifficulty = sigmoid(
    normal(
      PROBLEM_READING_DIFFICULTY_MULTIPLIER *
        (combinedPlacement - PROBLEM_READING_DIFFICULTY_MIDPOINT),
      PROBLEM_READING_DIFFICULTY_STDEV
    )
  );
  /**
   * 0-1 determining time to pen-paper solve / resolve. Counter with leveling up tag.
   */
  const penPaperDifficulty = sigmoid(
    normal(
      PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER *
        (combinedPlacement - PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT),
      PROBLEM_PEN_PAPER_DIFFICULTY_STDEV
    )
  );

  /**
   * 0-1 determining probabiblity that the pen-paper solution is correct. Harder problems have usually higher values (i. e. they are more deceptive). Counter with leveling up penPaperCare.
   */
  const penPaperDeceptiveness = sigmoid(
    normal(
      PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER *
        (combinedPlacement - PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT),
      PROBLEM_PEN_PAPER_DECEPTIVENESS_STDEV
    )
  );

  /**
   * 0-1 determining time to implement / reimplement. Counter with leveling up implementationSpeed.
   */
  const implementationDifficulty = sigmoid(
    normal(
      PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER *
        (combinedPlacement - PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT),
      PROBLEM_IMPLEMENTATION_DIFFICULTY_STDEV
    )
  );

  /**
   * 0-1 determining probabiblity that the implementation is correct. Harder problems have usually higher values (i. e. they are more deceptive). Counter with leveling up implementationCare.
   */
  const implementationDeceptiveness = sigmoid(
    normal(
      PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER *
        (combinedPlacement - PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT),
      PROBLEM_IMPLEMENTATION_DECEPTIVENESS_STDEV
    )
  );

  const unnormalizedLikelihoodOfAppearing = Object.values(ProblemTag).map(
    (tag) =>
      likelihoodOfAppearing(
        tag as ProblemTag,
        penPaperDifficulty,
        penPaperDeceptiveness,
        implementationDifficulty,
        implementationDeceptiveness
      )
  );

  const tag = sample(Object.values(ProblemTag), {
    size: 1,
    probs: normalizeArray(unnormalizedLikelihoodOfAppearing),
  })[0] as ProblemTag;

  return {
    division,
    placement,
    qualityPrecision,
    readingDifficulty,
    penPaperDifficulty,
    penPaperDeceptiveness,
    implementationDifficulty,
    implementationDeceptiveness,
    qualityRecall,
    pretestsQuality,
    tag,
  };
};
