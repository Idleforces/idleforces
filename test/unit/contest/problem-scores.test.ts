import stdev from "@stdlib/stats/base/stdev";
import { describe, it, assert } from "vitest";
import { EXPECTED_PROBLEM_SCORE } from "../../../src/app/contest/constants";
import {
  computeProblemScore,
  estimateProblemDifficulty,
} from "../../../src/app/contest/problem-scores";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import type { Problem } from "../../../src/app/problems/types";
import { sum, zip } from "../../../src/utils/utils";
import pcorr from "@stdlib/stats/incr/pcorr";

describe("computeProblemScores function", () => {
  const problemScoresPlacementA: Array<number> = [];
  const problemScoresPlacementF: Array<number> = [];
  const problemsA: Array<Problem> = [];
  const problemsF: Array<Problem> = [];

  for (let _ = 0; _ < 5000; _++) {
    problemsA.push(generateProblem(2, "A"));
    problemScoresPlacementA.push(computeProblemScore(problemsA.slice(-1)[0]));
    problemsF.push(generateProblem(2, "F"));
    problemScoresPlacementF.push(computeProblemScore(problemsF.slice(-1)[0]));
  }

  it("computes problem scores with expectation close to respective base score", () => {
    assert.closeTo(
      sum(problemScoresPlacementA) / problemScoresPlacementA.length,
      EXPECTED_PROBLEM_SCORE("A"),
      20
    );
  });

  it("computes higher variance scores for higher placed problems", () => {
    assert.closeTo(
      stdev(problemScoresPlacementF.length, 1, problemScoresPlacementF, 1) /
        stdev(problemScoresPlacementA.length, 1, problemScoresPlacementA, 1),
      1.9,
      0.1
    );
  });

  it("places higher scores on relatively harder problems", () => {
    const problemDifficulties = problemsA.map((problem) => {
      return estimateProblemDifficulty(problem);
    });

    const accumulator = pcorr();
    let difficultiesScoresCorr = 0;

    for (const [problemDifficulty, problemScorePlacementA] of zip(
      problemDifficulties,
      problemScoresPlacementA
    )) {
      difficultiesScoresCorr = accumulator(
        problemDifficulty,
        problemScorePlacementA
      ) as number;
    }

    assert.closeTo(difficultiesScoresCorr, 0.19, 0.03);
  });
});
