import { User } from "../users/loadUsers";
import {
  PEN_PAPER_SOLVING_DISTRIBUTION_PRECISION,
  PEN_PAPER_SOLVING_SCALING_FACTOR,
  PEN_PAPER_SOLVING_TIME_BASE,
} from "./constants";
import { Problem, ProblemSolveStatusDuringPenPaperSolving } from "./types";
import { betaPrimeAltParam, computeExpectancyMultiplier } from "./utils";

export const startPenPaperSolving = (
  user: User,
  problem: Problem
): ProblemSolveStatusDuringPenPaperSolving => {
  const penPaperSolvingExpectancyMultiplier = computeExpectancyMultiplier(
    problem.tag,
    user.attributes[problem.tag],
    problem.penPaperDifficulty,
    PEN_PAPER_SOLVING_SCALING_FACTOR
  );

  const penPaperSolvingIncrement = 1 / (
    PEN_PAPER_SOLVING_TIME_BASE *
    penPaperSolvingExpectancyMultiplier *
    betaPrimeAltParam(1, PEN_PAPER_SOLVING_DISTRIBUTION_PRECISION));

  const penPaperSolvingProgress = 0;
  const ticksToPenPaperSolve = Math.ceil(1 / penPaperSolvingIncrement);

  return {
    phase: "during-pen-paper-solving",
    penPaperSolvingProgress,
    penPaperSolvingIncrement,
    ticksToPenPaperSolve
  };
};
