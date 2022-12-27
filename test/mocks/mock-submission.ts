import { CONTEST_LENGTH } from "../../src/app/contest/constants";
import type { ContestSubmission } from "../../src/app/problems/types";

export const computeMockSubmission = (
  generateWrong = false,
  generatePretestPassing = false,
  generateSystestsPassing = false,
  timestamp: number | null = null
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
      ? "Wrong answer"
      : Math.random() < 0.5
      ? "Time limit exceeded"
      : Math.random() < 0.5
      ? "Runtime error"
      : "Memory limit exceeded",
    timestamp: timestamp ?? Math.floor(Math.random() * CONTEST_LENGTH),
  };
};
