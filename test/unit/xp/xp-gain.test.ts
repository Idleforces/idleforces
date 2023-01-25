import { describe, it, assert } from "vitest";
import type { Problem } from "../../../src/app/problems/types";
import { USER_ATTRIBUTES_CONSTANTS } from "../../../src/app/users/constants";
import { generatePlayer } from "../../../src/app/users/load-users";
import { attributeNames } from "../../../src/app/users/types";
import type { Player } from "../../../src/app/users/types";
import { XPToLevel } from "../../../src/app/users/utils";
import { computeXPGainFromReading } from "../../../src/app/XP/xp-from-reading";
import { declareRecordByInitializer } from "../../../src/utils/utils";
import { modifyAttributesAccordingToXPGain } from "../../../src/app/XP/xp-calculation-base";
import { computeIfPenPaperCorrect } from "../../../src/app/problems/pen-paper-solve";
import { computeXPGainFromPenPaperSolving } from "../../../src/app/XP/xp-from-pen-paper-solving";
import { computeIfImplementationCorrect } from "../../../src/app/problems/implement";
import { computeXPGainFromImplementing } from "../../../src/app/XP/xp-from-implementing";
import { generateProblem } from "../../../src/app/problems/generate-problem";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

const solveProblem = (player: Player, problem: Problem) => {
  const XPGainFromReading = computeXPGainFromReading(player, problem);
  let newPlayer = modifyAttributesAccordingToXPGain(player, XPGainFromReading);

  const penPaperCorrect = computeIfPenPaperCorrect(player, problem, []);
  const XPGainFromPenPaperSolving = computeXPGainFromPenPaperSolving(
    player,
    problem,
    penPaperCorrect
  );
  newPlayer = modifyAttributesAccordingToXPGain(
    newPlayer,
    XPGainFromPenPaperSolving
  );

  const implementationCorrect = computeIfImplementationCorrect(
    player,
    problem,
    []
  );
  const XPGainFromImplementing = computeXPGainFromImplementing(
    player,
    problem,
    implementationCorrect
  );
  newPlayer = modifyAttributesAccordingToXPGain(
    newPlayer,
    XPGainFromImplementing
  );

  return newPlayer;
};

describe("XP gain code", () => {
  let player = generatePlayer("someHandle", 1400, null);
  const baseXP = 10000;
  player.attributes = declareRecordByInitializer(
    attributeNames,
    (attributeName) =>
      XPToLevel(baseXP, USER_ATTRIBUTES_CONSTANTS[attributeName])
  );

  it("starting from low non-zero level", () => {
    assert.equal(player.attributes.adHoc, 6.614793076739836);
    assert.equal(player.attributes.penPaperCare, 6.614793076739836);
    assert.equal(player.attributes.implementationSpeed, 6.614793076739836);
    assert.equal(player.attributes.reading, 6.614793076739836);
  });

  it("levels up player reasonably after 100 Div4A problems", () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(4, "A");
      player = solveProblem(player, problem);
    }

    assertProbabilisticCloseTo(player.attributes.adHoc, 12.2, 1.2);
    assertProbabilisticCloseTo(player.attributes.penPaperCare, 10.7, 1);
    assertProbabilisticCloseTo(player.attributes.reading, 14.2, 1.2);
    assertProbabilisticCloseTo(
      player.attributes.implementationSpeed,
      12.2,
      1.2
    );
  });

  it("levels up player reasonably after 100 Div3C problems", () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(3, "C");
      player = solveProblem(player, problem);
    }

    assertProbabilisticCloseTo(player.attributes.adHoc, 19.2, 1.8);
    assertProbabilisticCloseTo(player.attributes.penPaperCare, 17.2, 1.2);
    assertProbabilisticCloseTo(player.attributes.reading, 19, 1.2);
    assertProbabilisticCloseTo(
      player.attributes.implementationSpeed,
      19.2,
      1.8
    );
  });

  it("levels up player reasonably after 500 Div2C problems", () => {
    for (let i = 0; i < 500; i++) {
      const problem = generateProblem(2, "C");
      player = solveProblem(player, problem);
    }
    assertProbabilisticCloseTo(player.attributes.adHoc, 31.2, 1.4);
    assertProbabilisticCloseTo(player.attributes.penPaperCare, 28.5, 1.2);
    assertProbabilisticCloseTo(player.attributes.reading, 29.6, 1.2);
    assertProbabilisticCloseTo(
      player.attributes.implementationSpeed,
      31.8,
      1.4
    );
  });

  it("does not level up much after solving 1000 Div4A problems", () => {
    const oldAttributes = player.attributes;
    for (let i = 0; i < 1000; i++) {
      const problem = generateProblem(4, "A");
      player = solveProblem(player, problem);
    }

    assertProbabilisticCloseTo(player.attributes.adHoc, oldAttributes.adHoc, 1);
    assertProbabilisticCloseTo(
      player.attributes.penPaperCare,
      oldAttributes.penPaperCare,
      1
    );
    assertProbabilisticCloseTo(
      player.attributes.implementationSpeed,
      oldAttributes.implementationSpeed,
      1
    );
    assertProbabilisticCloseTo(
      player.attributes.reading,
      oldAttributes.reading,
      3
    );
  });
});
