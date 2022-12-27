import type { ProblemSolvingPhases } from "../events/types";
import type { generateProblem } from "./generate-problem";
/*
export type ProblemPlacement = "A" | "B" | "C" | "D" | "E" | "F";
export const problemPlacements: Readonly<Array<ProblemPlacement>> = Object.freeze(["A", "B", "C", "D", "E", "F"]);
*/

export enum ProblemPlacements {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
}
export type ProblemPlacement = keyof typeof ProblemPlacements;

export type ProblemDivision = 1 | 2 | 3 | 4;
export const problemDivisions: Readonly<Array<ProblemDivision>> = Object.freeze(
  [1, 2, 3, 4]
);

export enum ProblemTag {
  dp = "dp",
  greedy = "greedy",
  math = "math",
  graphs = "graphs",
  adHoc = "adHoc",
  trees = "trees",
}

export type ContestSubmissionVerdict =
  | "Wrong answer"
  | "Runtime error"
  | "Time limit exceeded"
  | "Memory limit exceeded"
  | "Pretests passed"
  | "Systests passed"
  | "Systests failed";

export type ContestSubmission = {
  penPaperCorrect: boolean;
  implementationCorrect: boolean;
  verdict: ContestSubmissionVerdict;
  timestamp: number;
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
  return (
    [
      "during-reading",
      "during-pen-paper-solving",
      "during-implementing",
      "during-searching-for-mistake",
    ] as Array<ProblemSolvingPhases>
  ).includes(problemSolveStatus.phase);
}
