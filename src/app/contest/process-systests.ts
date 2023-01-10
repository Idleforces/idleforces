import { declareRecordByInitializer, sample } from "../../utils/utils";
import type {
  ContestSubmissionWrongVerdict,
  Problem,
  ProblemSolveStatusAfterFailingSystests,
  ProblemSolveStatusAfterPassingSystests,
} from "../problems/types";
import { contestSubmissionWrongVerdicts } from "../problems/types";
import { problemPlacements } from "../problems/types";
import { computeProblemPositionFromProblemPlacement } from "../problems/utils";
import type { ContestUserData } from "./types";
import { cloneDeep } from "lodash";
import {
  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
  RUNTIME_ERROR_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  RUNTIME_ERROR_PROBABILITY_IF_PEN_PAPER_WRONG,
  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
  WRONG_ANSWER_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  WRONG_ANSWER_PROBABILITY_IF_PEN_PAPER_WRONG,
} from "../problems/constants";

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

          const passingSubmission =
            lastPassingSubmissionIndex !== -1
              ? newSubmissions[lastPassingSubmissionIndex]
              : null;

          const penPaperCorrect = passingSubmission?.penPaperCorrect ?? false;
          const implementationCorrect =
            passingSubmission?.implementationCorrect ?? false;

          if (
            problemSolveStatus.phase === "after-passing-pretests" &&
            ((penPaperCorrect && implementationCorrect) ||
              Math.random() < problemPretestsQuality)
          ) {
            newSubmissions[lastPassingSubmissionIndex].verdict =
              "Systests passed";
            newSubmissions.reverse();

            return {
              phase: "after-passing-systests",
              submissions: newSubmissions,
            } satisfies ProblemSolveStatusAfterPassingSystests;
          } else if (problemSolveStatus.phase === "after-passing-pretests") {
            let wrongVerdict: ContestSubmissionWrongVerdict;
            if (!implementationCorrect)
              wrongVerdict = sample(
                [...contestSubmissionWrongVerdicts],
                [
                  WRONG_ANSWER_PROBABILITY_IF_IMPLEMENTATION_WRONG,
                  RUNTIME_ERROR_PROBABILITY_IF_IMPLEMENTATION_WRONG,
                  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
                  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
                ]
              );
            else if (!penPaperCorrect)
              wrongVerdict = sample(
                [...contestSubmissionWrongVerdicts],
                [
                  WRONG_ANSWER_PROBABILITY_IF_PEN_PAPER_WRONG,
                  RUNTIME_ERROR_PROBABILITY_IF_PEN_PAPER_WRONG,
                  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
                  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
                ]
              );
            else wrongVerdict = "Wrong answer";

            newSubmissions.reverse();
            newSubmissions[
              lastPassingSubmissionIndex
            ].verdict = `${wrongVerdict} on systests`;

            return {
              phase: "after-failing-systests",
              submissions: newSubmissions,
            } satisfies ProblemSolveStatusAfterFailingSystests;
          } else {
            return problemSolveStatus;
          }
        }
      ),
    };
  });
};
