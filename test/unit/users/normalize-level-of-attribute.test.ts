import { describe, it, expect } from "vitest";
import type { AttributeConstant } from "../../../src/app/users/types";
import { normalizeLevelOfAttribute } from "../../../src/app/users/utils";

describe("normalizeLevelOfAttribute function", () => {
  it("returns a normalized level between 0 and 1", () => {
    const mockAttributeConstant: AttributeConstant = {
      hardness: 3.14,
      MIN_VALUE: 30,
      MAX_VALUE: 50,
    };
    const level = 42;
    expect(normalizeLevelOfAttribute(level, mockAttributeConstant)).toEqual(
      0.6
    );
  });
});
