import { ProblemDivision, ProblemPlacement, ProblemTag } from "./types";
import { beta, normal } from "@stdlib/random/base";
import {
  likelihoodOfAppearing,
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
} from "./constants";
import { sigmoid } from "../../utils/utils";
import { sample } from "@stdlib/random/docs/types";

export class Problem {
  division: ProblemDivision;
  placement: ProblemPlacement;
  tag: ProblemTag;

  /**
   * 0-1 determining time to pen-paper solve / resolve. Counter with leveling up tag.
   */
  penPaperDifficulty: number;

  /**
   * 0-1 determining time to implement / reimplement. Counter with leveling up implementationSpeed.
   */
  implementationDifficulty: number;

  /**
   * 0-1 determining probabiblity that the pen-paper solution is correct. Harder problems have usually higher values (i. e. they are more deceptive). Counter with leveling up penPaperCare.
   */
  penPaperDeceptiveness: number;

  /**
   * 0-1 determining probabiblity that the implementation is correct. Harder problems have usually higher values (i. e. they are more deceptive). Counter with leveling up implementationCare.
   */
  implementationDeceptiveness: number;

  /**
   * 0-1 (heavily skewed towards 1) determining P(correct sol. passes) / (P(incorrect sol. passes) + P(correct sol. passes)). If far from 1, round may become unrated.
   */
  qualityPrecision: number;

  /**
   * 0-1 (very heavily skewed towards 1) determining P(correct sol. passes).
   */
  qualityRecall: number;

  /**
   * 0-1 (skewed towards 1) determining P(incorrect sol. fails pretests). If far from 1, round may become unrated.
   */
  pretestsQuality: number;

  constructor(division: ProblemDivision, placement: ProblemPlacement) {
    this.division = division;
    this.placement = placement;
    this.qualityPrecision = beta(
      PROBLEM_QUALITY_PRECISION_ALPHA,
      PROBLEM_QUALITY_PRECISION_BETA
    );
    this.qualityRecall = beta(
      PROBLEM_QUALITY_RECALL_ALPHA,
      PROBLEM_QUALITY_RECALL_BETA
    );
    this.pretestsQuality = beta(
      PROBLEM_PRETESTS_QUALITY_ALPHA,
      PROBLEM_PRETESTS_QUALITY_BETA
    );

    const combinedPlacement =
      placement.charCodeAt(0) - "A".charCodeAt(0) + (4 - division) * 2;

    this.penPaperDifficulty = sigmoid(
      normal(
        PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER *
          (combinedPlacement - PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT),
        PROBLEM_PEN_PAPER_DIFFICULTY_STDEV
      )
    );

    this.penPaperDeceptiveness = sigmoid(
      normal(
        PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER *
          (combinedPlacement - PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT),
        PROBLEM_PEN_PAPER_DECEPTIVENESS_STDEV
      )
    );

    this.implementationDifficulty = sigmoid(
      normal(
        PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER *
          (combinedPlacement - PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT),
        PROBLEM_IMPLEMENTATION_DIFFICULTY_STDEV
      )
    );

    this.implementationDeceptiveness = sigmoid(
      normal(
        PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER *
          (combinedPlacement - PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT),
        PROBLEM_IMPLEMENTATION_DECEPTIVENESS_STDEV
      )
    );

    this.tag = sample(Object.values(ProblemTag), {
      size: 1,
      probs: Object.values(ProblemTag).map((tag) =>
        likelihoodOfAppearing(
          tag as ProblemTag,
          this.penPaperDifficulty,
          this.penPaperDeceptiveness,
          this.implementationDifficulty,
          this.implementationDeceptiveness
        )
      ),
    })[0];
  }
}
