import { describe, it, assert } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import {
  computeIfImplementationCorrect,
  startImplementing,
} from "../../../src/app/problems/implement";
import type { ProblemSolveStatusDuringImplementing } from "../../../src/app/problems/types";
import { generateUser } from "../../../src/app/users/load-users";

describe("startImplementing function", () => {
  it("returns reasonable increments", () => {
    const problemSolveStatuses: Array<ProblemSolveStatusDuringImplementing> =
      [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateUser("someHandle", 1300, null, false);
      const problem = generateProblem(2, "B");
      problemSolveStatuses.push(startImplementing(user, problem, true, []));
    }

    const increments = problemSolveStatuses
      .map((problemSolveStatus) => problemSolveStatus.increment)
      .sort((a, b) => b - a);

    assert.closeTo(increments[500], 1 / 1700, 1 / 10000);
    assert.closeTo(increments[100], 1 / 500, 1 / 2000);
    assert.closeTo(increments[900], 1 / 5000, 1 / 30000);
  });
});

describe("computeIfImplementationCorrect function", () => {
  it("returns probability depending on hardness of the problem", () => {
    const areImplementationCorrectNoSubmissions: Array<boolean> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateUser("someHandle", 1800, null, false);
      const problem = generateProblem(4, "B");
      areImplementationCorrectNoSubmissions.push(
        computeIfImplementationCorrect(user, problem, [])
      );
    }

    const areImplementationCorrectWithSubmissions: Array<boolean> = [];
    for (let _ = 0; _ < 1000; _++) {
      const user = generateUser("someHandle", 1800, null, false);
      const problem = generateProblem(1, "C");
      areImplementationCorrectWithSubmissions.push(
        computeIfImplementationCorrect(user, problem, [])
      );
    }

    assert.closeTo(
      areImplementationCorrectNoSubmissions.filter((x) => x).length,
      900,
      20
    );

    assert.closeTo(
      areImplementationCorrectWithSubmissions.filter((x) => x).length,
      660,
      45
    );
  });
});
