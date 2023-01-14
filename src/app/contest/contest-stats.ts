import { sum } from "lodash";
import { isSubmissionCorrect } from "../problems/submit-problem";
import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { User } from "../users/types";
import { MIN_RATIO_OF_MAX_SCORE, WRONG_SUBMISSION_PENALTY } from "./constants";
import { computeContestRanksConsideringTies } from "./recalculate-ratings";
import type {
  ContestProblemNumberValues,
  ContestUserData,
  ContestUserStats,
  ProblemSolveStatuses,
} from "./types";

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
            (submission) => isSubmissionCorrect(submission)
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
