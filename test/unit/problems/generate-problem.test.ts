import { describe, it } from "vitest";
import type {
  ProblemDivision,
  ProblemPlacement,
} from "../../../src/app/problems/types";
import { problemTags } from "../../../src/app/problems/types";
import { zip } from "../../../src/utils/utils";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import stdev from "@stdlib/stats/base/stdev";
import mean from "@stdlib/stats/base/mean";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

const GENERATED_PROBLEMS_LENGTH = 2000;

describe("generateProblem function", () => {
  it("generates problems with diverse attribute values", () => {
    const placements: Array<ProblemPlacement> = ["A", "B", "D", "F"];
    const divisions: Array<ProblemDivision> = [4, 3, 2, 1];

    const penPaperDifficultyExpectedMeans = [0.16, 0.3, 0.55, 0.84];
    const penPaperDifficultyExpectedStdevs = [0.03, 0.04, 0.05, 0.03];

    const implementationDifficultyExpectedMeans = [0.16, 0.3, 0.55, 0.84];
    const implementationDifficultyExpectedStdevs = [0.04, 0.06, 0.07, 0.04];

    const deceptivenessExpectedMeans = [0.16, 0.3, 0.55, 0.84];
    const deceptivenessExpectedStdevs = [0.12, 0.15, 0.16, 0.12];

    const readingDifficultyExpectedMeans = [0.25, 0.35, 0.6, 0.75];
    const readingDifficultyExpectedStdevs = [0.1, 0.11, 0.11, 0.1];

    const qualityPrecisionLowerBound = {
      bound: 0.8,
      expectedProbToBeLessThan: 0.01,
    };
    const qualityPrecisionUpperBound = {
      bound: 0.99,
      expectedProbToBeLessThan: 0.175,
    };

    const qualityRecallLowerBound = {
      bound: 0.1,
      expectedProbToBeLessThan: 0.001,
    };
    const qualityRecallUpperBound = {
      bound: 0.9,
      expectedProbToBeLessThan: 0.005,
    };

    const pretestsQualityLowerBound = {
      bound: 0.8,
      expectedProbToBeLessThan: 0.05,
    };
    const pretestsQualityUpperBound = {
      bound: 0.99,
      expectedProbToBeLessThan: 0.42,
    };

    for (const [
      placement,
      division,
      penPaperDifficultyExpectedMean,
      penPaperDifficultyExpectedStdev,
      implementationDifficultyExpectedMean,
      implementationDifficultyExpectedStdev,
      deceptivenessExpectedMean,
      deceptivenessExpectedStdev,
      readingDifficultyExpectedMean,
      readingDifficultyExpectedStdev,
    ] of zip(
      placements,
      divisions,
      penPaperDifficultyExpectedMeans,
      penPaperDifficultyExpectedStdevs,
      implementationDifficultyExpectedMeans,
      implementationDifficultyExpectedStdevs,
      deceptivenessExpectedMeans,
      deceptivenessExpectedStdevs,
      readingDifficultyExpectedMeans,
      readingDifficultyExpectedStdevs
    )) {
      const problems = Array(GENERATED_PROBLEMS_LENGTH)
        .fill(0)
        .map((_) => generateProblem(division, placement));

      const penPaperDifficultyStDev = stdev(
        problems.length,
        1,
        problems.map((problem) => problem.penPaperDifficulty),
        1
      );
      const penPaperDifficultyMean = mean(
        problems.length,
        problems.map((problem) => problem.penPaperDifficulty),
        1
      );

      assertProbabilisticCloseTo(
        penPaperDifficultyStDev,
        penPaperDifficultyExpectedStdev,
        0.01
      );
      assertProbabilisticCloseTo(
        penPaperDifficultyMean,
        penPaperDifficultyExpectedMean,
        0.05
      );

      const implementationDifficultyStDev = stdev(
        problems.length,
        1,
        problems.map((problem) => problem.implementationDifficulty),
        1
      );
      const implementationDifficultyMean = mean(
        problems.length,
        problems.map((problem) => problem.implementationDifficulty),
        1
      );

      assertProbabilisticCloseTo(
        implementationDifficultyStDev,
        implementationDifficultyExpectedStdev,
        0.01
      );
      assertProbabilisticCloseTo(
        implementationDifficultyMean,
        implementationDifficultyExpectedMean,
        0.05
      );

      const penPaperDeceptivenessStDev = stdev(
        problems.length,
        1,
        problems.map((problem) => problem.penPaperDeceptiveness),
        1
      );
      const penPaperDeceptivenessMean = mean(
        problems.length,
        problems.map((problem) => problem.penPaperDeceptiveness),
        1
      );
      assertProbabilisticCloseTo(
        penPaperDeceptivenessStDev,
        deceptivenessExpectedStdev,
        0.02
      );
      assertProbabilisticCloseTo(
        penPaperDeceptivenessMean,
        deceptivenessExpectedMean,
        0.05
      );

      const implementationDeceptivenessStDev = stdev(
        problems.length,
        1,
        problems.map((problem) => problem.implementationDeceptiveness),
        1
      );
      const implementationDeceptivenessMean = mean(
        problems.length,
        problems.map((problem) => problem.implementationDeceptiveness),
        1
      );
      assertProbabilisticCloseTo(
        implementationDeceptivenessStDev,
        deceptivenessExpectedStdev,
        0.02
      );
      assertProbabilisticCloseTo(
        implementationDeceptivenessMean,
        deceptivenessExpectedMean,
        0.05
      );

      const readingDifficultyStDev = stdev(
        problems.length,
        1,
        problems.map((problem) => problem.readingDifficulty),
        1
      );
      const readingDifficultyMean = mean(
        problems.length,
        problems.map((problem) => problem.readingDifficulty),
        1
      );

      assertProbabilisticCloseTo(
        readingDifficultyStDev,
        readingDifficultyExpectedStdev,
        0.015
      );
      assertProbabilisticCloseTo(
        readingDifficultyMean,
        readingDifficultyExpectedMean,
        0.05
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) =>
            problem.qualityPrecision < qualityPrecisionLowerBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        qualityPrecisionLowerBound.expectedProbToBeLessThan,
        0.01
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) =>
            problem.qualityPrecision < qualityPrecisionUpperBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        qualityPrecisionUpperBound.expectedProbToBeLessThan,
        0.04
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) => problem.qualityRecall < qualityRecallLowerBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        qualityRecallLowerBound.expectedProbToBeLessThan,
        0.001
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) => problem.qualityRecall < qualityRecallUpperBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        qualityRecallUpperBound.expectedProbToBeLessThan,
        0.005
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) => problem.pretestsQuality < pretestsQualityLowerBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        pretestsQualityLowerBound.expectedProbToBeLessThan,
        0.02
      );

      assertProbabilisticCloseTo(
        problems.filter(
          (problem) => problem.pretestsQuality < pretestsQualityUpperBound.bound
        ).length / GENERATED_PROBLEMS_LENGTH,
        pretestsQualityUpperBound.expectedProbToBeLessThan,
        0.05
      );

      problemTags.forEach((problemTag) => {
        assertProbabilisticCloseTo(
          GENERATED_PROBLEMS_LENGTH /
            problems.filter((problem) => problem.tag === problemTag).length,
          problemTags.length,
          0.5 * problemTags.length
        );
      });
    }
  });

  it("generates problems with all numeric values between 0-1", () => {
    const division = 3;
    const placement = "E";
    const GENERATED_PROBLEMS_LENGTH = 100;
    const problems = Array(GENERATED_PROBLEMS_LENGTH)
      .fill(0)
      .map(() => generateProblem(division, placement));

    problems.forEach((problem) => {
      Object.entries(problem).forEach(([attributeName, attributeValue]) => {
        if (
          typeof attributeValue === "number" &&
          attributeName !== "division"
        ) {
          assertProbabilisticCloseTo(attributeValue, 0.5, 0.5);
        }
      });
    });
  });
});
