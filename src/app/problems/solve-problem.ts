import { problemBeforeImplementingStatus, problemBeforePenPaperSolvingStatus, problemBeforeReadingStatus, ProblemSolveStatus } from "./types";

export const generateInitialProblemSolveStatus = (): ProblemSolveStatus => {
    return {
        ...problemBeforeReadingStatus,
        ...problemBeforePenPaperSolvingStatus,
        ...problemBeforeImplementingStatus,
        wrongSubmissions: 0
    };
}