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

export const problemBeforeReadingStatus = {
  startedReading: false,
  finishedReading: false,
  ticksToFinishReading: null,
};

export type ProblemDuringReadingStatus = {
  startedReading: true;
  finishedReading: false;
  ticksToFinishReading: number;
};

export const problemAfterReadingStatus = {
  startedReading: true,
  finishedReading: true,
  ticksToFinishReading: null,
};

export type ProblemReadingStatus =
  | ProblemDuringReadingStatus
  | typeof problemBeforeReadingStatus
  | typeof problemAfterReadingStatus;

export const problemBeforePenPaperSolvingStatus = {
  startedPenPaperSolving: false,
  finishedPenPaperSolving: false,
  penPaperSolvingProgress: null,
  penPaperSolvingIncrement: null,
  ticksToPenPaperSolve: null,
  isPenPaperCorrect: null,
};

export type ProblemDuringPenPaperSolvingStatus = {
  startedPenPaperSolving: true;
  finishedPenPaperSolving: false;
  penPaperSolvingProgress: number;
  penPaperSolvingIncrement: number;
  ticksToPenPaperSolve: number;
  isPenPaperCorrect: null;
};

export type ProblemAfterPenPaperSolvingStatus = {
  startedPenPaperSolving: true;
  finishedPenPaperSolving: true;
  penPaperSolvingProgress: null;
  penPaperSolvingIncrement: null;
  ticksToPenPaperSolve: null;
  isPenPaperCorrect: boolean;
};

export type ProblemPenPaperStatus =
  | ProblemDuringPenPaperSolvingStatus
  | typeof problemBeforePenPaperSolvingStatus
  | ProblemAfterPenPaperSolvingStatus;

export const problemBeforeImplementingStatus = {
  startedImplementing: false,
  finishedImplementing: false,
  implementingProgress: null,
  implementingIncrement: null,
  TicksToImplement: null,
  isImplementationCorrect: null,
};

export type ProblemDuringImplementingStatus = {
  startedImplementing: true;
  finishedImplementing: false;
  implementingProgress: number;
  implementingIncrement: number;
  TicksToImplement: number;
  isImplementationCorrect: null;
};

export type ProblemAfterImplementingStatus = {
  startedImplementing: true;
  finishedImplementing: true;
  implementingProgress: null;
  implementingIncrement: null;
  TicksToImplement: null;
  isImplementationCorrect: boolean;
};

export type ProblemImplementationStatus =
  | ProblemDuringImplementingStatus
  | typeof problemBeforeImplementingStatus
  | ProblemAfterImplementingStatus;

export type ProblemSolveStatus = (
  | (typeof problemBeforeReadingStatus &
      typeof problemBeforePenPaperSolvingStatus &
      typeof problemBeforeImplementingStatus)
  | (ProblemDuringReadingStatus &
      typeof problemBeforePenPaperSolvingStatus &
      typeof problemBeforeImplementingStatus)
  | (typeof problemAfterReadingStatus &
    ProblemPenPaperStatus &
    ProblemImplementationStatus)
) & {
  wrongSubmissions: number;
};
