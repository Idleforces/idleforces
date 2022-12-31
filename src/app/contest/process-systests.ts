import { declareRecordByInitializer } from "../../utils/utils";
import type {
  Problem,
  ProblemSolveStatusAfterFailingSystests,
  ProblemSolveStatusAfterPassingSystests,
} from "../problems/types";
import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { ContestUserData } from "./types";

export const processSystests = (
  problems: Array<Problem>,
  contestUsersData: Array<ContestUserData>
): Array<ContestUserData> => {
  return contestUsersData.map((contestUserData) => {
    const problemSolveStatuses = contestUserData.problemSolveStatuses;

    return {
      ...contestUserData,
      problemSolveStatuses: declareRecordByInitializer(
        problemPlacements,
        (placement) => {
          const problemPosition =
            computeProblemPositionFromProblemPlacement(placement);
          const problemPretestsQuality =
            problems[problemPosition].pretestsQuality;
          const problemSolveStatus = problemSolveStatuses[placement];
          const submissions = problemSolveStatus.submissions;
          submissions.reverse();
          const lastPassingSubmissionIndex = submissions.findIndex(
            (submission) => submission.verdict === "Pretests passed"
          );

          if (
            problemSolveStatus.phase === "after-passing-pretests" &&
            Math.random() < problemPretestsQuality
          ) {
            submissions[lastPassingSubmissionIndex].verdict = "Systests passed";
            submissions.reverse();

            return {
              phase: "after-passing-systests",
              submissions,
            } satisfies ProblemSolveStatusAfterPassingSystests;
          } else if (problemSolveStatus.phase === "after-passing-pretests") {
            submissions[lastPassingSubmissionIndex].verdict = "Systests failed";
            submissions.reverse();
            return {
              phase: "after-failing-systests",
              submissions: problemSolveStatus.submissions,
            } satisfies ProblemSolveStatusAfterFailingSystests;
          } else {
            submissions.reverse();
            return problemSolveStatus;
          }
        }
      ),
    };
  });
};
