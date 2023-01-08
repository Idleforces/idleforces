import { declareRecordByInitializer } from "../../utils/utils";
import type {
  Problem,
  ProblemSolveStatusAfterFailingSystests,
  ProblemSolveStatusAfterPassingSystests,
} from "../problems/types";
import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { ContestUserData } from "./types";
import { cloneDeep } from "lodash";

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
          const newSubmissions = cloneDeep(problemSolveStatus.submissions);
          newSubmissions.reverse();

          const lastPassingSubmissionIndex = newSubmissions.findIndex(
            (submission) => submission.verdict === "Pretests passed"
          );

          if (
            problemSolveStatus.phase === "after-passing-pretests" &&
            Math.random() < problemPretestsQuality
          ) {
            newSubmissions[lastPassingSubmissionIndex].verdict =
              "Systests passed";
            newSubmissions.reverse();

            return {
              phase: "after-passing-systests",
              submissions: newSubmissions,
            } satisfies ProblemSolveStatusAfterPassingSystests;
          } else if (problemSolveStatus.phase === "after-passing-pretests") {
            newSubmissions[lastPassingSubmissionIndex].verdict =
              "Systests failed";
            newSubmissions.reverse();
            return {
              phase: "after-failing-systests",
              submissions: newSubmissions,
            } satisfies ProblemSolveStatusAfterFailingSystests;
          } else {
            newSubmissions.reverse();
            return problemSolveStatus;
          }
        }
      ),
    };
  });
};
