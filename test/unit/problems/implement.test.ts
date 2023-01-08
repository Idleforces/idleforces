import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import {
  computeIfImplementationCorrect,
  startImplementing,
} from "../../../src/app/problems/implement";
import type { ProblemSolveStatusDuringImplementing } from "../../../src/app/problems/types";
import { generateUser } from "../../../src/app/users/load-users";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

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

    assertProbabilisticCloseTo(increments[500], 1 / 630, 1 / 5000);
    assertProbabilisticCloseTo(increments[100], 1 / 230, 1 / 1800);
    assertProbabilisticCloseTo(increments[900], 1 / 1660, 1 / 15000);
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

    assertProbabilisticCloseTo(
      areImplementationCorrectNoSubmissions.filter((x) => x).length,
      830,
      40
    );

    assertProbabilisticCloseTo(
      areImplementationCorrectWithSubmissions.filter((x) => x).length,
      560,
      50
    );
  });
});
