import type { ProblemSolvingPhases } from "../events/types";
import type { generateProblem } from "./generate-problem";

export const problemPlacements = ["A", "B", "C", "D", "E", "F"] as const;
export type ProblemPlacement = typeof problemPlacements[number];

export const problemDivisions = [1, 2, 3, 4] as const;
export type ProblemDivision = typeof problemDivisions[number];

export const problemTags = [
  "dp",
  "greedy",
  "math",
  "graphs",
  "adHoc",
  "trees",
] as const;
export type ProblemTag = typeof problemTags[number];

export const contestSubmissionWrongVerdicts = [
  "Wrong answer",
  "Runtime error",
  "Time limit exceeded",
  "Memory limit exceeded",
] as const;

export type ContestSubmissionWrongVerdict =
  typeof contestSubmissionWrongVerdicts[number];

export type ContestSubmissionVerdict =
  | `${ContestSubmissionWrongVerdict} on pretests`
  | `${ContestSubmissionWrongVerdict} on systests`
  | "Pretests passed"
  | "Systests passed";

export type ContestSubmission = {
  penPaperCorrect: boolean;
  implementationCorrect: boolean;
  verdict: ContestSubmissionVerdict;
  ticksSinceBeginning: number;
};

export type Problem = ReturnType<typeof generateProblem>;

export type ProblemProgressIncrement = {
  progress: number;
  increment: number;
};

export type ProblemSolveStatusBeforeReading = {
  phase: "before-reading";
  submissions: [];
};

export type ProblemSolveStatusDuringReading = {
  phase: "during-reading";
  submissions: [];
} & ProblemProgressIncrement;

export type ProblemSolveStatusDuringPenPaperSolving = {
  phase: "during-pen-paper-solving";
  submissions: Array<ContestSubmission>;
} & ProblemProgressIncrement;

export type ProblemSolveStatusDuringImplementing = {
  phase: "during-implementing";
  penPaperCorrect: boolean;
  submissions: Array<ContestSubmission>;
} & ProblemProgressIncrement;

export type ProblemSolveStatusDuringSearchingForMistake = {
  phase: "during-searching-for-mistake";
  submissions: Exclude<Array<ContestSubmission>, []>;
  penPaperProgressIncrement: ProblemProgressIncrement;
  implementationProgressIncrement: ProblemProgressIncrement;
  penPaperCorrect: boolean;
};

export type ProblemSolveStatusAfterPassingPretests = {
  phase: "after-passing-pretests";
  submissions: Exclude<Array<ContestSubmission>, []>;
};

export type ProblemSolveStatusAfterPassingSystests = {
  phase: "after-passing-systests";
  submissions: Exclude<Array<ContestSubmission>, []>;
};

export type ProblemSolveStatusAfterFailingSystests = {
  phase: "after-failing-systests";
  submissions: Exclude<Array<ContestSubmission>, []>;
};

export type ProblemSolveStatusWhileActive =
  | ProblemSolveStatusDuringReading
  | ProblemSolveStatusDuringPenPaperSolving
  | ProblemSolveStatusDuringImplementing
  | ProblemSolveStatusDuringSearchingForMistake;

export type ProblemSolveStatus =
  | ProblemSolveStatusBeforeReading
  | ProblemSolveStatusWhileActive
  | ProblemSolveStatusAfterPassingPretests
  | ProblemSolveStatusAfterPassingSystests
  | ProblemSolveStatusAfterFailingSystests;

export function isActiveProblemSolveStatus(
  problemSolveStatus: ProblemSolveStatus
): problemSolveStatus is ProblemSolveStatusWhileActive {
  const activeProblemSolvingPhases: Array<ProblemSolvingPhases> = [
    "during-reading",
    "during-pen-paper-solving",
    "during-implementing",
    "during-searching-for-mistake",
  ];

  return activeProblemSolvingPhases.includes(problemSolveStatus.phase);
}
