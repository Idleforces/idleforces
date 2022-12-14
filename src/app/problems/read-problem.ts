import { User } from "../users/loadUsers";
import {
  READING_TIME_BASE,
  READING_TIME_DISTRIBUTION_PRECISION,
  READING_TIME_SCALING_FACTOR,
} from "./constants";
import { startPenPaperSolving } from "./pen-paper-solve";
import {
  Problem,
  ProblemSolveStatusDuringPenPaperSolving,
  ProblemSolveStatusDuringReading,
} from "./types";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";

export const startReadingProblem = (
  user: User,
  problem: Problem,
): ProblemSolveStatusDuringReading => {
  const readingTimeExpectancyMultiplier = computeExpectancyMultiplier(
    "reading",
    user.attributes.reading,
    problem.readingDifficulty,
    READING_TIME_SCALING_FACTOR
  );

  return {
    ticksToFinishReading:
      READING_TIME_BASE *
      readingTimeExpectancyMultiplier *
      betaPrimeAltParam(1, READING_TIME_DISTRIBUTION_PRECISION),
    phase: "during-reading",
  };
};

export const processReadingProblemTick = (
  user: User,
  problem: Problem,
  problemSolveStatus: ProblemSolveStatusDuringReading
): ProblemSolveStatusDuringReading | ProblemSolveStatusDuringPenPaperSolving => {
  if (problemSolveStatus.ticksToFinishReading > 1)
    return {
      ...problemSolveStatus,
      ticksToFinishReading: problemSolveStatus.ticksToFinishReading - 1,
    };

  else {
    return startPenPaperSolving(user, problem);
  }
};
