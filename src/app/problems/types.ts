import { generateProblem } from "./problem";

export type ProblemPlacement = "A" | "B" | "C" | "D" | "E" | "F";
export type ProblemDivision = 1 | 2 | 3 | 4;
export enum ProblemTag {
  dp = "dp",
  greedy = "greedy",
  math = "math",
  graphs = "graphs",
  adHoc = "adHoc",
  trees = "trees",
}

export type Problem = ReturnType<typeof generateProblem>;

export type ProblemDuringReadingStatus = {
  ticksToFinishReading: number;
};

export type ProblemDuringPenPaperSolvingStatus = {
  penPaperSolvingProgress: number;
  penPaperSolvingIncrement: number;
  ticksToPenPaperSolve: number;
};

export type ProblemDuringImplementingStatus = {
  implementingProgress: number;
  implementingIncrement: number;
  ticksToImplement: number;
};

export type ProblemSolveStatusBeforeReading = {
  phase: "before-reading";
};

export type ProblemSolveStatusDuringReading = ProblemDuringReadingStatus & {
  phase: "during-reading";
};

export type ProblemSolveStatusDuringPenPaperSolving =
  ProblemDuringPenPaperSolvingStatus & {
    phase: "during-pen-paper-solving";
  };

export type ProblemSolveStatusDuringImplementing =
  ProblemDuringImplementingStatus & {
    phase: "during-implementing";
  };

export type ProblemSolveStatusDuringResolving =
  ProblemDuringPenPaperSolvingStatus &
    ProblemDuringImplementingStatus & {
      submissionTimestamps: Array<number>;
      phase: "during-resolving";
      lastSubmissionPenPaperCorrect: boolean;
      lastSubmissionImplementationCorrect: boolean;
    };

export type ProblemSolveStatusAfterPassingPretests = {
  submissionTimestamps: Array<number>;
  phase: "after-passing-pretests";
  lastSubmissionPenPaperCorrect: boolean;
  lastSubmissionImplementationCorrect: boolean;
};

export type ProblemSolveStatusAfterPassingSystests = {
  submissionTimestamps: Array<number>;
  phase: "after-passing-systests";
};

export type ProblemSolveStatusAfterFailingSystests = {
  submissionTimestamps: Array<number>;
  phase: "after-failing-systests";
};

export type ProblemSolveStatus =
  | ProblemSolveStatusBeforeReading
  | ProblemSolveStatusDuringReading
  | ProblemSolveStatusDuringPenPaperSolving
  | ProblemSolveStatusDuringImplementing
  | ProblemSolveStatusDuringResolving
  | ProblemSolveStatusAfterPassingPretests
  | ProblemSolveStatusAfterPassingSystests
  | ProblemSolveStatusAfterFailingSystests;