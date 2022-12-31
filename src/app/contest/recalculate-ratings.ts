import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { User } from "../users/types";
import type {
  ContestProblemNumberValues,
  ContestUserData,
  ContestUserStats,
  ProblemSolveStatuses,
  RatingPoints,
} from "./types";
import { MIN_RATIO_OF_MAX_SCORE, WRONG_SUBMISSION_PENALTY } from "./constants";
import { sum } from "../../utils/utils";

const computeProbabilityRatingABeastRatingB = (
  ratingA: number,
  ratingB: number
) => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 *
 * @param userRating User rating.
 * @param opponentRatings Rating of opponents **including** the user themselves.
 * @returns Seed corresponding to the rating.
 */
export const computeSeed = (
  userRating: number,
  opponentRatings: Array<number>
) => {
  return (
    0.5 +
    sum(
      opponentRatings.map((opponentRating) =>
        computeProbabilityRatingABeastRatingB(opponentRating, userRating)
      )
    )
  );
};

export const computeSubmissionsStats = (
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues,
  problemSolveStatuses: ProblemSolveStatuses,
  useScoresAfterSystests: boolean
): {
  scores: Array<number>;
  wrongSubmissionCounts: Array<number>;
  correctSubmissionTimestamps: Array<number | null>;
} => {
  const scores: Array<number> = [];
  const wrongSubmissionCounts: Array<number> = [];
  const correctSubmissionTimestamps: Array<number | null> = [];

  problemPlacements.forEach((placement) => {
    const problemPosition =
      computeProblemPositionFromProblemPlacement(placement);
    const problemScore = problemScores[problemPosition];
    const problemScoreDecrementPerMinute =
      problemScoreDecrementsPerMinute[problemPosition];
    const problemSolveStatus = problemSolveStatuses[placement];
    const submissions = problemSolveStatus.submissions;
    let submissionFound = false;
    let score = 0;
    let wrongSubmissionCount = 0;

    for (const submission of submissions.reverse()) {
      if (submissionFound) {
        score -= WRONG_SUBMISSION_PENALTY;
      }

      if (
        (useScoresAfterSystests &&
          submission.verdict === "Systests passed" &&
          problemSolveStatus.phase === "after-passing-systests") ||
        (!useScoresAfterSystests &&
          submission.verdict === "Pretests passed" &&
          problemSolveStatus.phase === "after-passing-pretests")
      ) {
        score =
          problemScore -
          (problemScoreDecrementPerMinute * submission.ticksSinceBeginning) /
            60;
        correctSubmissionTimestamps.push(submission.ticksSinceBeginning);
        submissionFound = true;
      } else wrongSubmissionCount++;
    }

    // Reverse submissions back to original direction
    submissions.reverse();

    if (submissionFound)
      score = Math.max(score, problemScore * MIN_RATIO_OF_MAX_SCORE);

    scores.push(score);
    wrongSubmissionCounts.push(wrongSubmissionCount);
    if (!submissionFound) correctSubmissionTimestamps.push(null);
  });

  return { scores, wrongSubmissionCounts, correctSubmissionTimestamps };
};

export const computeContestUsersStatsSortedByRank = (
  contestUsersData: Array<ContestUserData>,
  users: Array<User>,
  useScoresAfterSystests: boolean,
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues
): Array<ContestUserStats> => {
  let userContestIndex = 0;
  return computeUserRanksConsideringTies(
    contestUsersData
      .map((contestUserData) => {
        const handle = contestUserData.handle;
        while (users[userContestIndex].handle !== handle) userContestIndex++;
        const oldRating =
          users[userContestIndex].ratingHistory.slice(-1)[0].rating;
        const country = users[userContestIndex].country;

        const { scores, wrongSubmissionCounts, correctSubmissionTimestamps } =
          computeSubmissionsStats(
            problemScores,
            problemScoreDecrementsPerMinute,
            contestUserData.problemSolveStatuses,
            useScoresAfterSystests
          );

        return {
          handle,
          scores,
          oldRating,
          failedAtSystests: problemPlacements.map(
            (placement) =>
              contestUserData.problemSolveStatuses[placement].phase ===
              "after-failing-systests"
          ),
          submissions: problemPlacements.map(
            (placement) =>
              contestUserData.problemSolveStatuses[placement].submissions
          ),
          correctSubmissionTimestamps,
          wrongSubmissionCounts,
          country,
        };
      })
      .sort((a, b) => sum(b.scores) - sum(a.scores))
  );
};

export const computeUserRanksConsideringTies = <
  T extends { scores: Array<number> }
>(
  contestUsersStats: Array<T>
): Array<T & { rank: number }> => {
  let curRank = 1;
  let lastScore = 999999;

  return contestUsersStats.map((contestUserStats, index) => {
    if (Math.floor(lastScore) !== Math.floor(sum(contestUserStats.scores))) {
      curRank = index + 1;
      lastScore = Math.floor(sum(contestUserStats.scores));
    }

    return {
      ...contestUserStats,
      rank: curRank,
    };
  });
};

export const computeNewRatingsSlice = (
  contestUsersStats: Array<{
    handle: string;
    oldRating: number;
    rank: number;
  }>,
  min?: number,
  max?: number
): RatingPoints => {
  const opponentRatings = contestUsersStats.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.oldRating
  );

  const userRatings = contestUsersStats
    .slice(min, max)
    .map(
      (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.oldRating
    );

  const handles = contestUsersStats.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.handle
  );
  const ranks = contestUsersStats.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.rank
  );
  const seeds = userRatings.map((rating) =>
    computeSeed(rating, opponentRatings)
  );

  const seedRankGeomeans = seeds.map((seed, index) =>
    Math.sqrt(ranks[index] * seed)
  );

  const performancesOfUsersSeededAsGeomeans = seedRankGeomeans.map(
    (seedRankGeomean) => {
      let PERFORMANCE_LOWER_BOUND = -999;
      let PERFORMANCE_UPPER_BOUND = 4999;

      for (let _ = 0; _ < 30; _++) {
        const PERFORMANCE_MIDPOINT =
          (PERFORMANCE_LOWER_BOUND + PERFORMANCE_UPPER_BOUND) / 2;
        const seedAtMidpoint = computeSeed(
          PERFORMANCE_MIDPOINT,
          opponentRatings
        );
        if (seedAtMidpoint < seedRankGeomean)
          PERFORMANCE_UPPER_BOUND = PERFORMANCE_MIDPOINT;
        else PERFORMANCE_LOWER_BOUND = PERFORMANCE_MIDPOINT;
      }

      return (PERFORMANCE_LOWER_BOUND + PERFORMANCE_UPPER_BOUND) / 2;
    }
  );

  const zeroMeanCorrection =
    min !== undefined || max !== undefined
      ? 0
      : (sum(performancesOfUsersSeededAsGeomeans) - sum(userRatings)) /
        userRatings.length;

  const ratingPoints: RatingPoints = {};
  const now = Date.now();
  userRatings.forEach((oldRating, index) => {
    ratingPoints[handles[min !== undefined ? min + index : index]] = {
      rating:
        (oldRating +
          performancesOfUsersSeededAsGeomeans[index] -
          zeroMeanCorrection) /
        2,
      timestamp: now,
    };
  });

  return ratingPoints;
};

/**
 *
 * @param contestUsersData User data relating to the contest coming from `contestSlice`.
 * @param problemScores Base scores of contest problems.
 * @param problemScoreDecrementsPerMinute Decrements of scores of contest problems per minute.
 * @link https://codeforces.com/blog/entry/20762
 */
export const recalculateRatings = (
  contestUsersData: Array<ContestUserData>,
  problemScores: Array<number>,
  problemScoreDecrementsPerMinute: Array<number>,
  users: Array<User>
): RatingPoints => {
  const contestUsersStats = computeContestUsersStatsSortedByRank(
    contestUsersData,
    users,
    true,
    problemScores,
    problemScoreDecrementsPerMinute
  );

  return computeNewRatingsSlice(contestUsersStats);
};
