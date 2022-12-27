import normal from "@stdlib/random/base/normal/";
import { sigmoid } from "../../utils/utils";
import type { Problem } from "../problems/types";
import {
  computeCombinedPlacementBetweenDivisions,
  computeExpectedLogitOfImplementationDeceptiveness,
  computeExpectedLogitOfImplementationDifficulty,
  computeExpectedLogitOfPenPaperDeceptiveness,
  computeExpectedLogitOfPenPaperDifficulty,
  computeExpectedLogitOfReadingDifficulty,
  computeProblemPositionFromProblemPlacement,
} from "../problems/utils";
import {
  CONTEST_LENGTH,
  EXPECTED_PROBLEM_SCORE,
  PROBLEM_SCORE_SCALING_FACTOR,
  PROBLEM_SCORE_STDEV_AT_PLACEMENT_A,
} from "./constants";

export const estimateProblemDifficulty = (problem: Problem) => {
  return (
    0.05 * problem.readingDifficulty +
    0.3 * problem.penPaperDifficulty +
    0.2 * problem.penPaperDeceptiveness +
    0.25 * problem.implementationDifficulty +
    0.2 * problem.implementationDeceptiveness
  );
};

const estimateExpectedProblemDifficulty = (combinedPlacement: number) => {
  return (
    0.05 * sigmoid(computeExpectedLogitOfReadingDifficulty(combinedPlacement)) +
    0.3 * sigmoid(computeExpectedLogitOfPenPaperDifficulty(combinedPlacement)) +
    0.2 *
      sigmoid(computeExpectedLogitOfPenPaperDeceptiveness(combinedPlacement)) +
    0.25 *
      sigmoid(
        computeExpectedLogitOfImplementationDifficulty(combinedPlacement)
      ) +
    0.2 *
      sigmoid(
        computeExpectedLogitOfImplementationDeceptiveness(combinedPlacement)
      )
  );
};

export const computeProblemScore = (problem: Problem): number => {
  const combinedPlacement = computeCombinedPlacementBetweenDivisions(
    problem.placement,
    problem.division
  );

  const difficulty = estimateProblemDifficulty(problem);
  const expectedDifficulty =
    estimateExpectedProblemDifficulty(combinedPlacement);

  const problemPosition = computeProblemPositionFromProblemPlacement(
    problem.placement
  );

  return (
    250 *
    Math.round(
      (EXPECTED_PROBLEM_SCORE(problem.placement) +
        (PROBLEM_SCORE_SCALING_FACTOR *
          (5 + problemPosition) *
          normal(
            difficulty - expectedDifficulty,
            PROBLEM_SCORE_STDEV_AT_PLACEMENT_A / PROBLEM_SCORE_SCALING_FACTOR
          )) /
          5) /
        250
    )
  );
};

export const computeContestProblemScores = (
  contestProblems: Array<Problem>
): Array<number> => {
  let problemScores: Array<number> = [];
  let maxProblemScore = 500;

  for (const contestProblem of contestProblems) {
    const nextProblemScore = Math.max(
      maxProblemScore,
      computeProblemScore(contestProblem)
    );
    problemScores = problemScores.concat([nextProblemScore]);
    maxProblemScore = nextProblemScore;
  }

  return problemScores;
};

export const computeProblemScoreDecrementsPerMinute = (
  problemScores: Array<number>
) => {
  return problemScores.map(
    (problemScore) => problemScore * (60 / CONTEST_LENGTH) * 0.7
  );
};
