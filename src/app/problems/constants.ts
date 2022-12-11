import { ProblemTag } from "./types";

export const PROBLEM_QUALITY_PRECISION_ALPHA = 10;
export const PROBLEM_QUALITY_PRECISION_BETA = 0.1;

export const PROBLEM_QUALITY_RECALL_ALPHA = 15;
export const PROBLEM_QUALITY_RECALL_BETA = 0.03;

export const PROBLEM_PRETESTS_QUALITY_ALPHA = 5;
export const PROBLEM_PRETESTS_QUALITY_BETA = 0.3;

export const PROBLEM_PEN_PAPER_DIFFICULTY_MIDPOINT = 5.5;
export const PROBLEM_PEN_PAPER_DIFFICULTY_MULTIPLIER = 0.2;
export const PROBLEM_PEN_PAPER_DIFFICULTY_STDEV = 0.1;

export const PROBLEM_IMPLEMENTATION_DIFFICULTY_MIDPOINT = 5.5;
export const PROBLEM_IMPLEMENTATION_DIFFICULTY_MULTIPLIER = 0.2;
export const PROBLEM_IMPLEMENTATION_DIFFICULTY_STDEV = 0.1;

export const PROBLEM_PEN_PAPER_DECEPTIVENESS_MIDPOINT = 5.5;
export const PROBLEM_PEN_PAPER_DECEPTIVENESS_MULTIPLIER = 0.2;
export const PROBLEM_PEN_PAPER_DECEPTIVENESS_STDEV = 0.5;

export const PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MIDPOINT = 5.5;
export const PROBLEM_IMPLEMENTATION_DECEPTIVENESS_MULTIPLIER = 0.2;
export const PROBLEM_IMPLEMENTATION_DECEPTIVENESS_STDEV = 0.5;

export const likelihoodOfAppearing = (
  tag: ProblemTag,
  penPaperDifficulty: number,
  penPaperDeceptiveness: number,
  implementationDifficulty: number,
  implementationDeceptiveness: number
): number => {
  switch (tag) {
    case ProblemTag.dp:
      return (
        5 + (penPaperDifficulty - 0.5) + 2 * (implementationDeceptiveness - 0.5)
      );
    case ProblemTag.greedy:
      return (
        5 -
        3 * (penPaperDifficulty - 0.5) +
        0.5 * (penPaperDeceptiveness - 0.5) -
        (implementationDifficulty - 0.5)
      );
    case ProblemTag.math:
      return (
        5 +
        (penPaperDifficulty - 0.5) +
        (penPaperDeceptiveness - 0.5) -
        (implementationDifficulty - 0.5) -
        (implementationDeceptiveness - 0.5)
      );
    case ProblemTag.graphs:
      return (
        5 +
        2 * (penPaperDifficulty - 0.5) -
        (penPaperDeceptiveness - 0.5) -
        2 * (implementationDeceptiveness - 0.5)
      );
    case ProblemTag.adHoc:
      return (
        5 + (penPaperDifficulty - 0.5) - 2 * (implementationDifficulty - 0.5)
      );
    case ProblemTag.trees:
      return (
        5 +
        (penPaperDifficulty - 0.5) -
        (penPaperDeceptiveness - 0.5) -
        2 * (implementationDeceptiveness - 0.5)
      );
    default:
      console.log(
        "Likelihood of appearing has not been implemented for the tag " +
          tag +
          "."
      );
      return 0;
  }
};
