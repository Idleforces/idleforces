import type { ProblemTag } from "./types";

export const likelihoodOfAppearing = (
  tag: ProblemTag,
  penPaperDifficulty: number,
  penPaperDeceptiveness: number,
  implementationDifficulty: number,
  implementationDeceptiveness: number
): number => {
  switch (tag) {
    case "dp":
      return (
        5 + (penPaperDifficulty - 0.5) + 2 * (implementationDeceptiveness - 0.5)
      );
    case "greedy":
      return (
        5 -
        3 * (penPaperDifficulty - 0.5) +
        0.5 * (penPaperDeceptiveness - 0.5) -
        (implementationDifficulty - 0.5)
      );
    case "math":
      return (
        5 +
        (penPaperDifficulty - 0.5) +
        (penPaperDeceptiveness - 0.5) -
        (implementationDifficulty - 0.5) -
        (implementationDeceptiveness - 0.5)
      );
    case "graphs":
      return (
        5 +
        2 * (penPaperDifficulty - 0.5) -
        (penPaperDeceptiveness - 0.5) -
        2 * (implementationDeceptiveness - 0.5)
      );
    case "adHoc":
      return (
        5 + (penPaperDifficulty - 0.5) - 2 * (implementationDifficulty - 0.5)
      );
    case "trees":
      return (
        5 +
        (penPaperDifficulty - 0.5) -
        (penPaperDeceptiveness - 0.5) -
        2 * (implementationDeceptiveness - 0.5)
      );
  }
};
