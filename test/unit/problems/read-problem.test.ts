import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import { startReadingProblem } from "../../../src/app/problems/read-problem";
import type { ProblemSolveStatusDuringReading } from "../../../src/app/problems/types";
import { generateUser } from "../../../src/app/users/load-users";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("startReadingProblem function", () => {
  it("returns reasonable increments", () => {
    const problemSolveStatuses: Array<ProblemSolveStatusDuringReading> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateUser("someUser", 1000, null, false);
      const problem = generateProblem(2, "B");
      problemSolveStatuses.push(startReadingProblem(user, problem));
    }

    const increments = problemSolveStatuses
      .map((problemSolveStatus) => problemSolveStatus.increment)
      .sort((a, b) => b - a);

    assertProbabilisticCloseTo(increments[500], 1 / 280, 1 / 1200);
    assertProbabilisticCloseTo(increments[100], 1 / 150, 1 / 800);
    assertProbabilisticCloseTo(increments[900], 1 / 600, 1 / 2000);
  });
});
