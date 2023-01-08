import { describe, it, assert, expect } from "vitest";
import { CONTEST_LENGTH } from "../../../src/app/contest/constants";
import { computeProblemScoreDecrementsPerMinute } from "../../../src/app/contest/problem-scores";
import {
  computeSubmissionsStats,
  computeNewRatingsSlice,
  computeSeed,
} from "../../../src/app/contest/recalculate-ratings";
import type { ProblemSolveStatuses } from "../../../src/app/contest/types";
import { sum } from "../../../src/utils/utils";
import { computeMockSubmission } from "../../mocks/mock-submission";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("computeSeed function", () => {
  it("computes reasonable seeds", () => {
    let opponentRatings = [500, 1200, 1500, 2500];
    assert.equal(computeSeed(500, opponentRatings), 3.9793655994219055);
    assert.equal(computeSeed(1200, opponentRatings), 2.8659305090083578);
    assert.equal(computeSeed(1500, opponentRatings), 2.1509795572113233);
    assert.equal(computeSeed(2500, opponentRatings), 1.0037243343584135);

    opponentRatings = [0, 500, 1400, 2500, 3700];
    assert.equal(computeSeed(0, opponentRatings), 4.946443094096997);
    assert.equal(computeSeed(500, opponentRatings), 4.047638237993187);
    assert.equal(computeSeed(1400, opponentRatings), 3.004131194084407);
    assert.equal(computeSeed(2500, opponentRatings), 2.000786683987819);
    assert.equal(computeSeed(3700, opponentRatings), 1.0010007898375899);
  });
});

describe("computeContestScoresAndNumberOfWrongSubmissions function", () => {
  const problemScores = [500, 750, 1250, 1750, 2500, 3500];
  const problemScoreDecrementsPerMinute =
    computeProblemScoreDecrementsPerMinute(problemScores);

  const problemSolveStatuses: ProblemSolveStatuses = {
    A: {
      phase: "after-failing-systests",
      submissions: [computeMockSubmission(false, true)],
    },

    B: {
      phase: "after-passing-pretests",
      submissions: Array(4)
        .fill(0)
        .map((_) => computeMockSubmission(true))
        .concat([
          computeMockSubmission(false, true, false, CONTEST_LENGTH / 2),
        ]),
    },

    C: {
      phase: "during-pen-paper-solving",
      submissions: Array(3)
        .fill(0)
        .map((_) => computeMockSubmission(true)),
      progress: 0.5,
      increment: 0.001,
    },

    D: {
      phase: "after-passing-systests",
      submissions: Array(3)
        .fill(0)
        .map((_) => computeMockSubmission(true))
        .concat([computeMockSubmission(false, false, true, 1000)]),
    },

    E: {
      phase: "before-reading",
      submissions: [],
    },

    F: {
      phase: "after-passing-systests",
      submissions: Array(10)
        .fill(0)
        .map((_) => computeMockSubmission(true))
        .concat([computeMockSubmission(false, false, true, CONTEST_LENGTH)]),
    },
  };

  it("computes correct scores and wrong submission counts and submission ticksSinceBeginnings after systests", () => {
    const { scores, wrongSubmissionCounts, correctSubmissionTimestamps } =
      computeSubmissionsStats(
        problemScores,
        problemScoreDecrementsPerMinute,
        problemSolveStatuses,
        true
      );

    assert.deepEqual(scores, [0, 0, 0, 1429.861111111111, 0, 700]);
    assert.deepEqual(wrongSubmissionCounts, [1, 5, 3, 3, 0, 10]);
    assert.deepEqual(correctSubmissionTimestamps, [
      null,
      null,
      null,
      1000,
      null,
      CONTEST_LENGTH,
    ]);
  });

  it("computes correct scores and wrong submission counts and submission ticksSinceBeginnings after pretests", () => {
    const { scores, wrongSubmissionCounts, correctSubmissionTimestamps } =
      computeSubmissionsStats(
        problemScores,
        problemScoreDecrementsPerMinute,
        problemSolveStatuses,
        false
      );

    assert.deepEqual(scores, [0, 287.5, 0, 0, 0, 0]);
    assert.deepEqual(wrongSubmissionCounts, [1, 4, 3, 4, 0, 11]);
    assert.deepEqual(correctSubmissionTimestamps, [
      null,
      CONTEST_LENGTH / 2,
      null,
      null,
      null,
      null,
    ]);
  });
});

describe("computeNewRatingsSlice function", () => {
  const contestUsersStatsArray = [
    [
      { handle: "tourist", oldRating: 3700, rank: 1 },
      { handle: "fourist", oldRating: 0, rank: 2 },
    ],

    [
      { handle: "chad", oldRating: 2500, rank: 1 },
      { handle: "tourist", oldRating: 3700, rank: 2 },
      { handle: "normalHandle", oldRating: 1400, rank: 3 },
      { handle: "virgin", oldRating: 500, rank: 4 },
      { handle: "fourist", oldRating: 0, rank: 5 },
    ],
  ];

  it("computes new ratings", () => {
    let newRatings = computeNewRatingsSlice(contestUsersStatsArray[0]);
    assertProbabilisticCloseTo(newRatings.tourist.rating, 3700, 1);
    assertProbabilisticCloseTo(newRatings.fourist.rating, 0, 1);

    newRatings = computeNewRatingsSlice(contestUsersStatsArray[1]);
    assert.equal(newRatings.chad.rating, 2862.668145751953);
    assert.equal(newRatings.tourist.rating, 3462.2105346679687);
    assert.equal(newRatings.normalHandle.rating, 1359.1896911621093);
    assert.equal(newRatings.virgin.rating, 465.2154174804688);
    assert.equal(newRatings.fourist.rating, -49.2837890625);
  });

  it("produces zero-mean rating differences", () => {
    const newRatings = computeNewRatingsSlice(contestUsersStatsArray[1]);
    assert.equal(
      sum(Object.values(newRatings).map((ratingPoint) => ratingPoint.rating)),
      sum(
        Object.values(contestUsersStatsArray[1]).map(
          (contestUserStats) => contestUserStats.oldRating
        )
      )
    );
  });

  it("ignores zero-mean correction if given a slice", () => {
    const newRatings = computeNewRatingsSlice(contestUsersStatsArray[1], 0, 5);
    assert.notEqual(
      sum(Object.values(newRatings).map((ratingPoint) => ratingPoint.rating)),
      sum(
        Object.values(contestUsersStatsArray[1]).map(
          (contestUserStats) => contestUserStats.oldRating
        )
      )
    );
  });

  it("produces similar results whether given a slice or not which only differ by zero-mean correction", () => {
    const minIndex = 1;
    const maxIndex = 3;

    const newRatingsFull = computeNewRatingsSlice(contestUsersStatsArray[1]);
    const newRatingsSlice = computeNewRatingsSlice(
      contestUsersStatsArray[1],
      minIndex,
      maxIndex
    );

    const ratingDiff =
      newRatingsFull["tourist"].rating - newRatingsSlice["tourist"].rating;
    expect(ratingDiff).toBe(-41.5784210205079);
    expect(
      newRatingsFull["normalHandle"].rating -
        newRatingsSlice["normalHandle"].rating
    ).toBe(ratingDiff);
  });
});
