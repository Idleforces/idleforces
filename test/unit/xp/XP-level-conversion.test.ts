import { describe, it, assert } from "vitest";
import { levelToXP, XPToLevel } from "../../../src/app/users/utils";
import type { AttributeConstant } from "../../../src/app/users/types";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("XPToLevelFunction and levelToXPFunction", () => {
  const mockAttributeConstant: AttributeConstant = {
    hardness: 3.14,
    MIN_VALUE: 30,
    MAX_VALUE: 50,
  };
  const mockBadHardnessAttributeConstant: AttributeConstant = {
    hardness: -3.14,
    MIN_VALUE: 30,
    MAX_VALUE: 50,
  };
  const level = 42;
  const XP = 1729;

  it("are inverses of each other", () => {
    assertProbabilisticCloseTo(
      XPToLevel(levelToXP(level, mockAttributeConstant), mockAttributeConstant),
      level,
      0.001
    );

    assertProbabilisticCloseTo(
      levelToXP(XPToLevel(XP, mockAttributeConstant), mockAttributeConstant),
      XP,
      1
    );
  });

  it("return zero when given an input outside of their domains", () => {
    const badLevel = 15;
    const badXP = -1729;

    assert.equal(levelToXP(badLevel, mockAttributeConstant), 0);
    assert.equal(levelToXP(level, mockBadHardnessAttributeConstant), 0);
    assert.equal(XPToLevel(badXP, mockAttributeConstant), 0);
    assert.equal(XPToLevel(XP, mockBadHardnessAttributeConstant), 0);
  });
});
