import { describe, it } from "vitest";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import type {
  ProblemDivision,
  ProblemPlacement,
} from "../../../src/app/problems/types";
import { generateUser } from "../../../src/app/users/load-users";
import { computeTimeToSwitchToAnotherProblem } from "../../../src/app/problems/utils";
import type { NPC } from "../../../src/app/users/types";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("computeTimeToSwitchToAnotherProblem function", () => {
  it("", () => {
    const timesToSwitchHighRatedZeroSubmissions: Array<number> = [];

    for (let _ = 0; _ < 10000; _++) {
      const placement: ProblemPlacement = "B";
      const division: ProblemDivision = 1;
      const highRatedUser = generateUser("chad", 2500, "Chad", false) as NPC;
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
      5000,
      250
    );
    assertProbabilisticCloseTo(
      timesToSwitchHighRatedZeroSubmissions[1000],
      2100,
      100
    );
    assertProbabilisticCloseTo(
      timesToSwitchHighRatedZeroSubmissions[9000],
      12800,
      1000
    );
  });
});
