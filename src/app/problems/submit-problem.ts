import type {
  ContestSubmission,
  ContestSubmissionWrongVerdict,
  Problem,
  ProblemProgressIncrement,
  ProblemSolveStatusAfterPassingPretests,
  ProblemSolveStatusDuringSearchingForMistake,
} from "./types";
import { contestSubmissionWrongVerdicts } from "./types";
import {
  IMPLEMENTATION_SEARCHING_FOR_MISTAKE_DISTRIBUTION_PRECISION,
  IMPLEMENTATION_SEARCHING_FOR_MISTAKE_SCALING_FACTOR,
  IMPLEMENTATION_SEARCHING_FOR_MISTAKE_TIME_BASE,
  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
  PEN_PAPER_SEARCHING_FOR_MISTAKE_DISTRIBUTION_PRECISION,
  PEN_PAPER_SEARCHING_FOR_MISTAKE_SCALING_FACTOR,
  PEN_PAPER_SEARCHING_FOR_MISTAKE_TIME_BASE,
  RUNTIME_ERROR_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  RUNTIME_ERROR_PROBABILITY_IF_PEN_PAPER_WRONG,
  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  TIME_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
  WRONG_ANSWER_PROBABILITY_IF_IMPLEMENTATION_WRONG,
  WRONG_ANSWER_PROBABILITY_IF_PEN_PAPER_WRONG,
} from "./constants";
import { sample } from "../../utils/utils";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";
import type { User } from "../users/types";
import { addEvent } from "../events/events-slice";
import type { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import type { MockDispatch } from "../types";
import type { RootState } from "../store";

export const submitProblem = (
  user: User,
  problem: Problem,
  submissions: Array<ContestSubmission>,
  penPaperCorrect: boolean,
  implementationCorrect: boolean,
  ticksSinceBeginning: number,
  dispatch: ThunkDispatch<RootState, void, AnyAction> | MockDispatch
):
  | ProblemSolveStatusAfterPassingPretests
  | ProblemSolveStatusDuringSearchingForMistake => {
  const correct = penPaperCorrect && implementationCorrect;
  const isSuccess = correct
    ? Math.random() < problem.qualityRecall
    : Math.random() > problem.qualityPrecision * problem.pretestsQuality;

  if (isSuccess) {
    if (user.isPlayer)
      dispatch(
        addEvent({
          ticksSinceBeginning,
          message: `Your submission for the problem ${problem.placement} was accepted.`,
          sentiment: "positive",
          problemPlacement: problem.placement,
        })
      );

    return {
      phase: "after-passing-pretests",
      submissions: [
        ...submissions,
        {
          penPaperCorrect,
          implementationCorrect,
          verdict: "Pretests passed",
          ticksSinceBeginning: ticksSinceBeginning,
        },
      ],
    };
  }

  let verdict: ContestSubmissionWrongVerdict;
  if (!implementationCorrect)
    verdict = sample(
      [...contestSubmissionWrongVerdicts],
      [
        WRONG_ANSWER_PROBABILITY_IF_IMPLEMENTATION_WRONG,
        RUNTIME_ERROR_PROBABILITY_IF_IMPLEMENTATION_WRONG,
        TIME_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
        MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_IMPLEMENTATION_WRONG,
      ]
    );
  else if (!penPaperCorrect)
    verdict = sample(
      [...contestSubmissionWrongVerdicts],
      [
        WRONG_ANSWER_PROBABILITY_IF_PEN_PAPER_WRONG,
        RUNTIME_ERROR_PROBABILITY_IF_PEN_PAPER_WRONG,
        TIME_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
        MEMORY_LIMIT_EXCEEDED_PROBABILITY_IF_PEN_PAPER_WRONG,
      ]
    );
  else verdict = sample([...contestSubmissionWrongVerdicts], null);

  if (user.isPlayer)
    dispatch(
      addEvent({
        ticksSinceBeginning,
        message: `Your submission for the problem ${problem.placement} was rejected (verdict = "${verdict}").`,
        sentiment: "negative",
        problemPlacement: problem.placement,
      })
    );

  const penPaperSearchForMistakeExpectancyMultiplier =
    computeExpectancyMultiplier(
      "penPaperCare",
      user.attributes.penPaperCare,
      problem.penPaperDeceptiveness,
      PEN_PAPER_SEARCHING_FOR_MISTAKE_SCALING_FACTOR
    );

  const penPaperProgressIncrement: ProblemProgressIncrement = penPaperCorrect
    ? {
        progress: 0,
        increment: 0,
      }
    : {
        progress: 0,
        increment:
          (1 /
            (PEN_PAPER_SEARCHING_FOR_MISTAKE_TIME_BASE *
              penPaperSearchForMistakeExpectancyMultiplier)) *
          betaPrimeAltParam(
            1,
            PEN_PAPER_SEARCHING_FOR_MISTAKE_DISTRIBUTION_PRECISION
          ),
      };

  const implementationSearchForMistakeExpectancyMultiplier =
    computeExpectancyMultiplier(
      "implementationCare",
      user.attributes.implementationCare,
      problem.implementationDeceptiveness,
      IMPLEMENTATION_SEARCHING_FOR_MISTAKE_SCALING_FACTOR
    );

  const implementationProgressIncrement: ProblemProgressIncrement =
    implementationCorrect
      ? {
          progress: 0,
          increment: 0,
        }
      : {
          progress: 0,
          increment:
            (1 /
              (IMPLEMENTATION_SEARCHING_FOR_MISTAKE_TIME_BASE *
                implementationSearchForMistakeExpectancyMultiplier)) *
            betaPrimeAltParam(
              1,
              IMPLEMENTATION_SEARCHING_FOR_MISTAKE_DISTRIBUTION_PRECISION
            ),
        };

  return {
    phase: "during-searching-for-mistake",
    submissions: [
      ...submissions,
      {
        penPaperCorrect,
        implementationCorrect,
        verdict: `${verdict} on pretests`,
        ticksSinceBeginning: ticksSinceBeginning,
      },
    ],
    penPaperProgressIncrement,
    implementationProgressIncrement,
    penPaperCorrect,
  };
};

export const didSubmissionPass = (submission: ContestSubmission) => {
  switch (submission.verdict) {
    case "Pretests passed":
      return true;
    case "Systests passed":
      return true;
    default:
      return false;
  }
};
