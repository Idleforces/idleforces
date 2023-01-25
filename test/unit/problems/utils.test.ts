import { describe, expect, it, assert } from "vitest";
import type { ProblemPlacement } from "../../../src/app/problems/types";
import {
  computeCombinedPlacementBetweenDivisions,
  computeProblemPlacementFromProblemPosition,
  computeProblemPositionFromProblemPlacement,
} from "../../../src/app/problems/utils";

describe("computeCombinedPlacementBetweenDivisions function", () => {
  it("computes combined placement as a roughly single-digit number", () => {
    assert.closeTo(computeCombinedPlacementBetweenDivisions("B", 4), 0.6, 1e-6);
    assert.closeTo(computeCombinedPlacementBetweenDivisions("C", 3), 3.2, 1e-6);
    assert.closeTo(computeCombinedPlacementBetweenDivisions("F", 1), 12, 1e-6);
  });
});

describe("computeProblemPositionFromProblemPlacement and computeProblemPlacementFromProblemPosition functions", () => {
  it("are inverses of each other", () => {
    const problemPlacement: ProblemPlacement = "D";
    const problemPosition = 4;

    expect(
      computeProblemPositionFromProblemPlacement(
        computeProblemPlacementFromProblemPosition(problemPosition)
      )
    ).toBe(problemPosition);

    expect(
      computeProblemPlacementFromProblemPosition(
        computeProblemPositionFromProblemPlacement(problemPlacement)
      )
    ).toBe(problemPlacement);
  });

  it("compute appropriate values", () => {
    expect(computeProblemPlacementFromProblemPosition(2)).toBe("C");
  });
});
