import { User } from "../users/loadUsers";
import { processReadingProblemTick, startReadingProblem } from "./read-problem";
import { Problem } from "./types";
import {
  ProblemSolveStatus,
} from "./types";

export const generateInitialProblemSolveStatus = (): ProblemSolveStatus => {
  return {
    phase: "before-reading",
  };
};

export const processTickOfProblemSolving = (
  user: User,
  problem: Problem,
  problemSolveStatus: ProblemSolveStatus
): ProblemSolveStatus => {
  switch (problemSolveStatus.phase) {
    case "before-reading":
        return startReadingProblem(user, problem);
    case "during-reading":
        return processReadingProblemTick(user, problem, problemSolveStatus);
    default:
        return problemSolveStatus;
  }
};
