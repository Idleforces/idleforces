import { describe, it, assert } from "vitest";
import { computeActiveProblemPosition } from "../../../src/app/contest/active-problem";
import { generateUser } from "../../../src/app/users/load-users";
import type { NPC } from "../../../src/app/users/types";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("computeActiveProblemPosition function", () => {
  it("returns null whenever there is no active position", () => {
    assert.isNull(computeActiveProblemPosition([false], 3));
    assert.isNull(computeActiveProblemPosition([], 0));
  });

  const canBecomeActiveArray = [true, false, false, true, false, true];
  const possibleActivePositions = [0, 3, 5];
  const activeProblemPositions: Array<number | null> = [];
  for (let _ = 0; _ < 1000; _++) {
    const NPC = generateUser("someUser", 1200, null, false) as NPC;
    activeProblemPositions.push(
      computeActiveProblemPosition(
        canBecomeActiveArray,
        NPC.willingnessToTryHarderProblems
      )
    );
  }

  it("always returns a possible active position which is not null", () => {
    activeProblemPositions.forEach((activeProblemPosition) => {
      assert.include(possibleActivePositions, activeProblemPosition);
    });
  });

  it("returns easier problems more often", () => {
    assertProbabilisticCloseTo(
      activeProblemPositions.filter((x) => x === 0).length,
      825,
      35
    );

    assertProbabilisticCloseTo(
      activeProblemPositions.filter((x) => x === 3).length,
      145,
      30
    );

    assertProbabilisticCloseTo(
      activeProblemPositions.filter((x) => x === 5).length,
      30,
      12
    );
  });
});
