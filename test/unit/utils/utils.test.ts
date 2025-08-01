import { describe, it, expect } from "vitest";
import {
  declareRecordByInitializer,
  sample,
  zip,
} from "../../../src/utils/utils";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("sample function", () => {
  it("samples almost uniformly from array", () => {
    const array = [0, 1, 2, 3, 4, 5];
    const probs = [0, 15, 1, 4, 0, 30];

    const sampledCounts = array.map((_) => 0);
    const sampledExpectedCounts = [0, 3000, 200, 800, 0, 6000];
    const sampledDeltas = [0, 300, 50, 100, 0, 350];

    for (let _ = 0; _ < 10000; _++) {
      sampledCounts[sample(array, probs)]++;
    }

    for (const [sampledCount, sampledExpectedCount, sampledDelta] of zip(
      sampledCounts,
      sampledExpectedCounts,
      sampledDeltas
    )) {
      assertProbabilisticCloseTo(
        sampledCount,
        sampledExpectedCount,
        sampledDelta
      );
    }
  });

  it("throws on bad inputs", () => {
    const arrays = [[0], [0, 1], [0], [0, 1], []];
    const probsArray = [[1, 1], [1, -0.5], [0], [NaN, 2], []];

    for (const [array, probs] of zip(arrays, probsArray)) {
      try {
        sample(array, probs);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorAsError = error as Error;
        expect(errorAsError.message).toBe("Bad input to sample function.");
      }
    }
  });
});

describe("declareRecordByInitializer function", () => {
  it("generates a record with all properties from indexObject", () => {
    const stringLiteralConstArray = ["key1", "key2"] as const;
    type StringLiteralUnionType = typeof stringLiteralConstArray[number];

    const initializer = (stringLiteral: StringLiteralUnionType): number => {
      switch (stringLiteral) {
        case "key1":
          return 1;
        case "key2":
          return 2;
      }
    };

    expect(
      declareRecordByInitializer(stringLiteralConstArray, initializer)
    ).toMatchObject({
      key1: 1,
      key2: 2,
    });
  });
});
