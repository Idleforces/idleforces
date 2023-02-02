import type { ProblemSolvingPhase } from "../../../app/events/types";

export const formatProblemSolvingPhase = (phase: ProblemSolvingPhase) => {
  switch (phase) {
    case "before-reading":
      return "Not read yet";
    case "during-reading":
      return "Reading";
    case "during-pen-paper-solving":
      return "Pen paper solving";
    case "during-implementing":
      return "Implementing";
    case "during-searching-for-mistake":
      return "Searching for mistake";
    case "after-passing-pretests":
      return "Pretests passed";
    case "after-passing-systests":
      return "Systests passed";
    case "after-failing-systests":
      return "Systests failed";
  }
};
