import type { User } from "../users/types";
import type { ContestUserData, RatingPoints } from "./types";
import { sum } from "../../utils/utils";
import { computeContestUsersStatsSortedByRank } from "./contest-stats";

const probabilitiesOfWinningByRatingDiff = Array(10000)
  .fill(0)
  .map((_, index) => 1 / (1 + Math.pow(10, (index - 5000) / 400)));

const computeProbabilityRatingABeastRatingB = (
  ratingA: number,
  ratingB: number
) => {
  return probabilitiesOfWinningByRatingDiff[
    5000 + Math.round(ratingB - ratingA)
  ];
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

export const computeRanksConsideringTies = (
  criterion: Array<number>
): Array<number> => {
  let curRank = 1;
  let lastScore = 999999;

  return criterion.map((criterionValue, index) => {
    if (Math.floor(lastScore) !== Math.floor(criterionValue)) {
      curRank = index + 1;
      lastScore = Math.floor(criterionValue);
    }

    return curRank;
  });
};

export const computeContestRanksConsideringTies = <
  T extends { scores: Array<number> }
>(
  contestUsersStats: Array<T>
): Array<T & { rank: number }> => {
  const ranks = computeRanksConsideringTies(
    contestUsersStats.map((contestUserStats) => sum(contestUserStats.scores))
  );

  return contestUsersStats.map((contestUserStats, index) => {
    return {
      ...contestUserStats,
      rank: ranks[index],
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
    Math.sqrt(ranks[index + (min !== undefined ? min : 0)] * seed)
  );

  const performancesOfUsersSeededAsGeomeans = seedRankGeomeans.map(
    (seedRankGeomean) => {
      let PERFORMANCE_LOWER_BOUND = -999;
      let PERFORMANCE_UPPER_BOUND = 4999;

      for (let _ = 0; _ < 15; _++) {
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
