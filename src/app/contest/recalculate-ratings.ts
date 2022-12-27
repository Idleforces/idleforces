import { ProblemPlacements } from "../problems/types";
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

export const computeContestScoresAndNumberOfWrongSubmissions = (
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues,
  problemSolveStatuses: ProblemSolveStatuses,
  useScoresAfterSystests: boolean
): {
  scores: Array<number>;
  wrongSubmissionCounts: Array<number>;
} => {
  const scores: Array<number> = [];
  const wrongSubmissionCounts: Array<number> = [];

  Object.values(ProblemPlacements).forEach((placement) => {
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
          (problemScoreDecrementPerMinute * submission.timestamp) / 60;
        submissionFound = true;
      } else wrongSubmissionCount++;
    }

    // Reverse submissions back to original direction
    submissions.reverse();

    if (submissionFound)
      score = Math.max(score, problemScore * MIN_RATIO_OF_MAX_SCORE);

    scores.push(score);
    wrongSubmissionCounts.push(wrongSubmissionCount);
  });

  return { scores, wrongSubmissionCounts };
};

export const computeContestUsersStatsSortedByRank = (
  contestUsersData: Array<ContestUserData>,
  users: Array<User>,
  useScoresAfterSystests: boolean,
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues
): Array<ContestUserStats> => {
  let userContestIndex = 0;
  return contestUsersData
    .map((contestUserData) => {
      const handle = contestUserData.handle;
      while (users[userContestIndex].handle !== handle) userContestIndex++;
      const oldRating =
        users[userContestIndex].ratingHistory.slice(-1)[0].rating;
      const country = users[userContestIndex].country;

      const { scores, wrongSubmissionCounts } =
        computeContestScoresAndNumberOfWrongSubmissions(
          problemScores,
          problemScoreDecrementsPerMinute,
          contestUserData.problemSolveStatuses,
          useScoresAfterSystests
        );

      return {
        handle,
        scores,
        oldRating,
        wrongSubmissionCounts,
        country,
      };
    })
    .sort((a, b) => sum(b.scores) - sum(a.scores));
};

export const computeNewRatings = (
  contestUsersStatsSortedByRank: Array<{ handle: string; oldRating: number }>
): RatingPoints => {
  const oldRatings = contestUsersStatsSortedByRank.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.oldRating
  );
  const handles = contestUsersStatsSortedByRank.map(
    (contestUserStatsSortedByRank) => contestUserStatsSortedByRank.handle
  );
  const seeds = oldRatings.map((rating) => computeSeed(rating, oldRatings));

  const seedRankGeomeans = seeds.map((_, index) =>
    Math.sqrt((index + 1) * seeds[index])
  );

  const performancesOfUsersSeededAsGeomeans = seedRankGeomeans.map(
    (seedRankGeomean) => {
      let PERFORMANCE_LOWER_BOUND = -999;
      let PERFORMANCE_UPPER_BOUND = 4999;

      for (let _ = 0; _ < 30; _++) {
        const PERFORMANCE_MIDPOINT =
          (PERFORMANCE_LOWER_BOUND + PERFORMANCE_UPPER_BOUND) / 2;
        const seedAtMidpoint = computeSeed(PERFORMANCE_MIDPOINT, oldRatings);
        if (seedAtMidpoint < seedRankGeomean)
          PERFORMANCE_UPPER_BOUND = PERFORMANCE_MIDPOINT;
        else PERFORMANCE_LOWER_BOUND = PERFORMANCE_MIDPOINT;
      }

      return (PERFORMANCE_LOWER_BOUND + PERFORMANCE_UPPER_BOUND) / 2;
    }
  );

  const zeroMeanCorrection =
    (sum(performancesOfUsersSeededAsGeomeans) - sum(oldRatings)) /
    oldRatings.length;

  const ratingPoints: RatingPoints = {};
  const now = Date.now();
  oldRatings.forEach((oldRating, index) => {
    ratingPoints[handles[index]] = {
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
  const contestUsersStatsSortedByRank = computeContestUsersStatsSortedByRank(
    contestUsersData,
    users,
    true,
    problemScores,
    problemScoreDecrementsPerMinute
  );

  return computeNewRatings(contestUsersStatsSortedByRank);
};
