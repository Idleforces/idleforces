import { describe, expect, it } from "vitest";
import type { ProblemPlacement } from "../../../src/app/problems/types";
import {
  computeCombinedPlacementBetweenDivisions,
  computeProblemPlacementFromProblemPosition,
  computeProblemPositionFromProblemPlacement,
} from "../../../src/app/problems/utils";

describe("computeCombinedPlacementBetweenDivisions function", () => {
  it("computes combined placement as a roughly single-digit number", () => {
    expect(computeCombinedPlacementBetweenDivisions("B", 4)).toBe(1.1);
    expect(computeCombinedPlacementBetweenDivisions("C", 3)).toBe(3.95);
    expect(computeCombinedPlacementBetweenDivisions("F", 1)).toBe(10.75);
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
