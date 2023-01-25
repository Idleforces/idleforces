import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import { startReadingProblem } from "../../../src/app/problems/read-problem";
import type { ProblemSolveStatusDuringReading } from "../../../src/app/problems/types";
import { generateNPC } from "../../../src/app/users/load-users";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("startReadingProblem function", () => {
  it("returns reasonable increments", () => {
    const problemSolveStatuses: Array<ProblemSolveStatusDuringReading> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateNPC("someUser", 1000, null);
      const problem = generateProblem(2, "B");
      problemSolveStatuses.push(startReadingProblem(user, problem));
    }

    const increments = problemSolveStatuses
      .map((problemSolveStatus) => problemSolveStatus.increment)
      .sort((a, b) => b - a);

    assertProbabilisticCloseTo(increments[500], 1 / 390, 1 / 2000);
    assertProbabilisticCloseTo(increments[100], 1 / 150, 1 / 1000);
    assertProbabilisticCloseTo(increments[900], 1 / 870, 1 / 5000);
  });
});
