import type { User } from "../users/types";
import type { ContestUserData, RatingPoints } from "./types";
import { sum } from "../../utils/utils";
import {
  computeContestUsersStatsSortedByRank,
  computeSeed,
} from "./contest-stats";
import { problemPlacements } from "../problems/types";

export const computeNewRatings = (
  contestUsersStats: Array<{
    handle: string;
    oldRating: number;
    rank: number;
  }>,
  contestName: string | null,
  selectedHandles?: Array<string>
): RatingPoints => {
  const opponentRatings = contestUsersStats.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.oldRating
  );

  const selectedHandlesList =
    selectedHandles ??
    contestUsersStats.map(
      (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.handle
    );

  let selectedUsersStats = contestUsersStats;
  if (selectedHandles)
    selectedUsersStats = contestUsersStats.filter((contestUserStats) =>
      selectedHandlesList.includes(contestUserStats.handle)
    );

  const selectedUserOldRatings = selectedUsersStats.map(
    (selectedUserStats) => selectedUserStats.oldRating
  );

  const ranksArray = contestUsersStats.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.rank
  );

  const ranks: Partial<Record<string, number>> = {};
  ranksArray.forEach((rank, index) => {
    ranks[contestUsersStats[index].handle] = rank;
  });

  const seeds = selectedUsersStats.map(({ oldRating }) =>
    computeSeed(oldRating, opponentRatings)
  );

  const seedRankGeomeans = seeds.map((seed, index) =>
    Math.sqrt((ranks[selectedUsersStats[index].handle] as number) * seed)
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

  const zeroMeanCorrection = selectedHandles
    ? 0
    : (sum(performancesOfUsersSeededAsGeomeans) - sum(selectedUserOldRatings)) /
      selectedUserOldRatings.length;

  const ratingPoints: RatingPoints = {};
  selectedUserOldRatings.forEach((oldRating, index) => {
    ratingPoints[selectedUsersStats[index].handle] = {
      rating:
        (oldRating +
          performancesOfUsersSeededAsGeomeans[index] -
          zeroMeanCorrection) /
        2,
      contestName,
    };
  });

  return ratingPoints;
};

export const filterUsersWithAtLeastOneSubmission = (
  contestUsersData: Array<ContestUserData>
) => {
  return contestUsersData.filter((contestUserData) =>
    problemPlacements.some(
      (placement) =>
        contestUserData.problemSolveStatuses[placement].submissions.length
    )
  );
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
  users: Array<User>,
  contestName: string
): RatingPoints => {
  const contestUsersWithAtLeastOneSubmissionData =
    filterUsersWithAtLeastOneSubmission(contestUsersData);

  const contestUsersStats = computeContestUsersStatsSortedByRank(
    contestUsersWithAtLeastOneSubmissionData,
    users,
    true,
    false,
    problemScores,
    problemScoreDecrementsPerMinute
  );

  return computeNewRatings(contestUsersStats, contestName);
};
