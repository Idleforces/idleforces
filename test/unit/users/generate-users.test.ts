import { describe, it, assert, expect } from "vitest";
import type { NPC, User } from "../../../src/app/users/types";
import stdev from "@stdlib/stats/base/stdev";
import { normalizeLevelOfAttribute } from "../../../src/app/users/utils";
import { USER_ATTRIBUTES_CONSTANTS } from "../../../src/app/users/constants";
import { problemTags } from "../../../src/app/problems/types";
import type { AttributeNames } from "../../../src/app/users/types";
import { nonTechnicalAttributeNames } from "../../../src/app/users/types";
import { generateUsers } from "../../../src/app/users/load-users";
import { assertProbabilisticCloseTo } from "../../probabilistic-assert";

describe("generateUsers function", () => {
  const users = generateUsers("tourist").users;

  it("generates an array of users", () => {
    expect(users).toBeInstanceOf(Array<User>);
  });

  it("removes the real tourist from the array of users", () => {
    const tourists = users.filter((user) => user.handle === "tourist");
    expect(tourists.length).toBe(1);
    assert(tourists[0].isPlayer);
  });

  it("generates a single player user at index 0 with minValue attributes", () => {
    users.forEach((user) => {
      assert.hasAnyKeys(user, ["isPlayer"]);
    });

    assert(users[0].isPlayer);
    const filteredUsers = users.filter((user) => user.isPlayer);
    expect(filteredUsers).toHaveLength(1);

    const player = filteredUsers[0];
    assert.equal(
      player.attributes.adHoc,
      USER_ATTRIBUTES_CONSTANTS["adHoc"].MIN_VALUE
    );
  });

  it("generates npcs with suitably distributed attributes", () => {
    const npcUsers = users.filter((user) => !user.isPlayer);
    const usersWithHighDP = npcUsers.filter(
      (user) =>
        normalizeLevelOfAttribute(
          user.attributes.dp,
          USER_ATTRIBUTES_CONSTANTS.dp
        ) > 0.6
    );

    expect(usersWithHighDP.length).toBeGreaterThan(200);
    expect(usersWithHighDP.length).toBeLessThan(1000);

    const usersWithLowDP = npcUsers.filter(
      (user) =>
        normalizeLevelOfAttribute(
          user.attributes.dp,
          USER_ATTRIBUTES_CONSTANTS.dp
        ) < 0.2
    );

    expect(usersWithLowDP.length).toBeGreaterThan(2000);
    expect(usersWithLowDP.length).toBeLessThan(10000);

    const normalizedAttributes = npcUsers.map((user) =>
      Object.entries(user.attributes).map(([attributeName, level]) =>
        normalizeLevelOfAttribute(
          level,
          USER_ATTRIBUTES_CONSTANTS[attributeName as AttributeNames]
        )
      )
    );
    const attributeStdevs = normalizedAttributes.map(
      (normalizedUserAttributes) =>
        stdev(normalizedUserAttributes.length, 1, normalizedUserAttributes, 1)
    );
    const usersWithHighStDev = attributeStdevs.filter((stdev) => stdev > 0.14);

    expect(usersWithHighStDev.length).toBeGreaterThan(100);
    expect(usersWithHighStDev.length).toBeLessThan(500);

    const usersWithLowStDev = attributeStdevs.filter((stdev) => stdev < 0.05);
    expect(usersWithLowStDev.length).toBeGreaterThan(500);
    expect(usersWithLowStDev.length).toBeLessThan(3000);
  });

  it("generates all attribute values between the corresponding minValue and maxValue", () => {
    users.forEach((user) => {
      ([...problemTags] as Array<AttributeNames>)
        .concat(nonTechnicalAttributeNames)
        .forEach((attributeName) => {
          expect(user.attributes[attributeName]).toBeGreaterThanOrEqual(
            USER_ATTRIBUTES_CONSTANTS[attributeName].MIN_VALUE
          );
          expect(user.attributes[attributeName]).toBeLessThanOrEqual(
            USER_ATTRIBUTES_CONSTANTS[attributeName].MAX_VALUE
          );
        });
    });
  });

  it("given an NPC, it generates additional attributes", () => {
    const NPCs = users.filter((user) => !user.isPlayer) as Array<NPC>;
    const NPCsLength = NPCs.length;

    const likelihoodsOfCompeting = NPCs.map(
      (NPC) => NPC.likelihoodOfCompeting
    ).sort((a, b) => a - b);

    assertProbabilisticCloseTo(
      likelihoodsOfCompeting[Math.floor(NPCsLength / 6)],
      0.18,
      0.025
    );
    assertProbabilisticCloseTo(
      likelihoodsOfCompeting[Math.floor((5 * NPCsLength) / 6)],
      0.5,
      0.035
    );

    const willingnessToTryHarderProblemsArray = NPCs.map(
      (NPC) => NPC.willingnessToTryHarderProblems
    ).sort((a, b) => a - b);

    assertProbabilisticCloseTo(
      willingnessToTryHarderProblemsArray[Math.floor(NPCsLength / 6)],
      0.04,
      0.015
    );

    assertProbabilisticCloseTo(
      willingnessToTryHarderProblemsArray[Math.floor((5 * NPCsLength) / 6)],
      0.4,
      0.035
    );

    const expectedTimeMultipliersToSwitchToADifferentProblem = NPCs.map(
      (NPC) => NPC.expectedTimeMultiplierToSwitchToADifferentProblem
    ).sort((a, b) => a - b);

    assertProbabilisticCloseTo(
      expectedTimeMultipliersToSwitchToADifferentProblem[
        Math.floor(NPCsLength / 6)
      ],
      1.7,
      0.1
    );

    assertProbabilisticCloseTo(
      expectedTimeMultipliersToSwitchToADifferentProblem[
        Math.floor((5 * NPCsLength) / 6)
      ],
      3.27,
      0.12
    );
  });
});
