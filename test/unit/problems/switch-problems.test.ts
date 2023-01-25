import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import type {
  ProblemDivision,
  ProblemPlacement,
} from "../../../src/app/problems/types";
import { generateNPC } from "../../../src/app/users/load-users";
import { computeTimeToSwitchToAnotherProblem } from "../../../src/app/problems/utils";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("computeTimeToSwitchToAnotherProblem function", () => {
  it("computes reasonable time to switch to another problem", () => {
    const timesToSwitchHighRatedZeroSubmissions: Array<number> = [];

    for (let _ = 0; _ < 10000; _++) {
      const placement: ProblemPlacement = "B";
      const division: ProblemDivision = 1;
      const highRatedUser = generateNPC("chad", 2500, "Chad");
      const problem = generateProblem(division, placement);
      timesToSwitchHighRatedZeroSubmissions.push(
        computeTimeToSwitchToAnotherProblem(
          highRatedUser,
          placement,
          division,
          problem.tag,
          0
        )
      );
    }

    timesToSwitchHighRatedZeroSubmissions.sort((a, b) => a - b);
    assertProbabilisticCloseTo(
      timesToSwitchHighRatedZeroSubmissions[5000],
      3550,
      150
    );
    assertProbabilisticCloseTo(
      timesToSwitchHighRatedZeroSubmissions[1000],
      1370,
      100
    );
    assertProbabilisticCloseTo(
      timesToSwitchHighRatedZeroSubmissions[9000],
      9800,
      400
    );
  });
});
