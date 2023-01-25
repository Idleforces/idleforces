import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import {
  computeIfPenPaperCorrect,
  startPenPaperSolving,
} from "../../../src/app/problems/pen-paper-solve";
import type { ProblemSolveStatusDuringPenPaperSolving } from "../../../src/app/problems/types";
import { generateNPC } from "../../../src/app/users/load-users";
import { computeMockSubmission } from "../../mocks/mock-submission";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("startPenPaperSolving function", () => {
  it("returns reasonable increments", () => {
    const problemSolveStatuses: Array<ProblemSolveStatusDuringPenPaperSolving> =
      [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateNPC("someUser", 800, null);
      const problem = generateProblem(4, "C");
      problemSolveStatuses.push(startPenPaperSolving(user, problem, []));
    }

    const increments = problemSolveStatuses
      .map((problemSolveStatus) => problemSolveStatus.increment)
      .sort((a, b) => b - a);

    assertProbabilisticCloseTo(increments[500], 1 / 1050, 1 / 9000);
    assertProbabilisticCloseTo(increments[100], 1 / 190, 1 / 1300);
    assertProbabilisticCloseTo(increments[900], 1 / 5000, 1 / 25000);
  });
});

describe("computeIfPenPaperCorrect function", () => {
  it("returns probability depending on number of submissions", () => {
    const arePenPaperCorrectNoSubmissions: Array<boolean> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateNPC("someHandle", 1800, null);
      const problem = generateProblem(2, "C");
      arePenPaperCorrectNoSubmissions.push(
        computeIfPenPaperCorrect(user, problem, [])
      );
    }

    const arePenPaperCorrectWithSubmissions: Array<boolean> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateNPC("someHandle", 1800, null);
      const problem = generateProblem(2, "C");
      arePenPaperCorrectWithSubmissions.push(
        computeIfPenPaperCorrect(
          user,
          problem,

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Array(3)
            .fill(0)
            .map((_) => computeMockSubmission())
        )
      );
    }

    assertProbabilisticCloseTo(
      arePenPaperCorrectNoSubmissions.filter((x) => x).length,
      650,
      40
    );

    assertProbabilisticCloseTo(
      arePenPaperCorrectWithSubmissions.filter((x) => x).length,
      590,
      40
    );
  });
});
