import { describe, it, assert, expect } from "vitest";
import { generateUsers, User } from "../../../src/app/users/loadUsers";
import variance from  '@stdlib/stats/base/variance';
import { normalizeLevelOfAttribute } from '../../../src/app/users/utils';
import { USER_ATTRIBUTES_CONSTANTS } from '../../../src/app/users/constants';

describe("generateUsers function", () => {
  const handle = "someUnusedHandle";
  const users = generateUsers(handle);
  it("generates an array of users", () => {
    expect(users).toBeInstanceOf(Array<User>);
  });

  it("generates a single player user with minValue attributes", () => {
    users?.forEach((user) => {
      assert.hasAnyKeys(user, ["isPlayer"]);
    });
    expect(users?.filter((user) => user["isPlayer"])).toHaveLength(1);

    Object.values(
      users?.filter((user) => user["isPlayer"])[0].attributes as Object
    ).forEach((attributeValue) =>
      assert.equal(attributeValue.value, attributeValue.MIN_VALUE)
    );
  });

  it("generates npcs with suitably distributed attributes", () => {
    const npcUsers = users?.filter((user) => !user["isPlayer"]);
    const usersWithHighDP = npcUsers?.filter(
      (user) =>
        normalizeLevelOfAttribute(user.attributes.dp as number, USER_ATTRIBUTES_CONSTANTS.dp) > 0.6
    );

    expect(usersWithHighDP?.length).toBeGreaterThan(200);
    expect(usersWithHighDP?.length).toBeLessThan(1000);

    const usersWithLowDP = npcUsers?.filter(
      (user) =>
      normalizeLevelOfAttribute(user.attributes.dp, USER_ATTRIBUTES_CONSTANTS.dp) < 0.2
    );
    
    expect(usersWithLowDP?.length).toBeGreaterThan(2000);
    expect(usersWithLowDP?.length).toBeLessThan(10000);
    
    const normalizedAttributes = npcUsers?.map(user => Object.entries(user.attributes).map(([attributeName, level]) => normalizeLevelOfAttribute(level, USER_ATTRIBUTES_CONSTANTS[attributeName])))
    const attributeVariances = normalizedAttributes?.map(normalizedUserAttributes => variance(normalizedUserAttributes?.length, 1, normalizedUserAttributes, 1));
    const usersWithHighStDev = (attributeVariances?.filter(variance => Math.sqrt(variance) > 0.15));
    
    expect(usersWithHighStDev?.length).toBeGreaterThan(100);
    expect(usersWithHighStDev?.length).toBeLessThan(500);
    
    const usersWithLowStDev = (attributeVariances?.filter(variance => Math.sqrt(variance) < 0.05));
    expect(usersWithLowStDev?.length).toBeGreaterThan(500);
    expect(usersWithLowStDev?.length).toBeLessThan(3000);
  });
});
