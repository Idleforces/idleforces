import { sum } from "lodash";
import { didSubmissionPass } from "../problems/submit-problem";
import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { User } from "../users/types";
import { MIN_RATIO_OF_MAX_SCORE, WRONG_SUBMISSION_PENALTY } from "./constants";
import type {
  ContestProblemNumberValues,
  ContestUserData,
  ContestUserStats,
  ProblemSolveStatuses,
} from "./types";

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
    if (Math.round(lastScore) !== Math.round(criterionValue)) {
      curRank = index + 1;
      lastScore = Math.round(criterionValue);
    }

    return curRank;
  });
};

const computeContestRanksConsideringTies = <
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

export const computeSubmissionsStats = (
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues,
  problemSolveStatuses: ProblemSolveStatuses,
  contestFinished: boolean
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

    for (const submission of [...submissions].reverse()) {
      if (submissionFound) {
        score -= WRONG_SUBMISSION_PENALTY;
      }

      if (
        (contestFinished &&
          submission.verdict === "Systests passed" &&
          problemSolveStatus.phase === "after-passing-systests") ||
        (!contestFinished &&
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
  contestFinished: boolean,
  ratingChangesApplied: boolean,
  problemScores: ContestProblemNumberValues,
  problemScoreDecrementsPerMinute: ContestProblemNumberValues
): Array<ContestUserStats> => {
  let userContestIndex = 0;
  return computeContestRanksConsideringTies(
    contestUsersData
      .map((contestUserData) => {
        const handle = contestUserData.handle;
        while (users[userContestIndex].handle !== handle) userContestIndex++;
        const oldRating = ratingChangesApplied
          ? users[userContestIndex].ratingHistory.slice(-2)[0].rating
          : users[userContestIndex].ratingHistory.slice(-1)[0].rating;
        const country = users[userContestIndex].country;

        const { scores, wrongSubmissionCounts, correctSubmissionTimestamps } =
          computeSubmissionsStats(
            problemScores,
            problemScoreDecrementsPerMinute,
            contestUserData.problemSolveStatuses,
            contestFinished
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

export const computeAccepted = (contestUsersData: Array<ContestUserData>) => {
  return contestUsersData
    .map(
      (contestUserData) =>
        problemPlacements.map((placement) =>
          contestUserData.problemSolveStatuses[placement].submissions.some(
            (submission) => didSubmissionPass(submission)
          )
            ? 1
            : 0
        ) as Array<number>
    )
    .reduce((acceptedAccumulator, accepted) =>
      acceptedAccumulator.map(
        (numAcceptedAtIndex, index) => numAcceptedAtIndex + accepted[index]
      )
    );
};

export const computeTried = (contestUsersData: Array<ContestUserData>) => {
  return contestUsersData
    .map(
      (contestUserData) =>
        problemPlacements.map((placement) =>
          contestUserData.problemSolveStatuses[placement].submissions.length
            ? 1
            : 0
        ) as Array<number>
    )
    .reduce((acceptedAccumulator, accepted) =>
      acceptedAccumulator.map(
        (numAcceptedAtIndex, index) => numAcceptedAtIndex + accepted[index]
      )
    );
};
