import { CONTEST_LENGTH } from "../../src/app/contest/constants";
import type { ContestSubmission } from "../../src/app/problems/types";

export const computeMockSubmission = (
  generateWrong = false,
  generatePretestPassing = false,
  generateSystestsPassing = false,
  ticksSinceBeginning: number | null = null
): ContestSubmission => {
  const randomNumber = Math.random();
  const penPaperCorrect =
    generatePretestPassing || generateSystestsPassing
      ? true
      : generateWrong
      ? randomNumber < 0.3
      : randomNumber < 0.7 && randomNumber > 0.2;
  const implementationCorrect =
    generatePretestPassing || generateSystestsPassing
      ? true
      : randomNumber > 0.59;

  return {
    penPaperCorrect,
    implementationCorrect,
    verdict: generateSystestsPassing
      ? "Systests passed"
      : generatePretestPassing
      ? "Pretests passed"
      : Math.random() < 0.5
      ? "Wrong answer on pretests"
      : Math.random() < 0.5
      ? "Time limit exceeded on pretests"
      : Math.random() < 0.5
      ? "Runtime error on pretests"
      : "Memory limit exceeded on pretests",
    ticksSinceBeginning:
      ticksSinceBeginning ?? Math.floor(Math.random() * CONTEST_LENGTH),
  };
};
