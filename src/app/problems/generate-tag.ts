import { ProblemTag } from "./types";

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
        console.warn(
          "Likelihood of appearing has not been implemented for the tag " +
            tag +
            "."
        );
        return 0;
    }
  };