import { describe, it, assert, expect } from "vitest";
import usersJSON from "../../../src/app/users/trimmedUsers.json" assert { type: "json" };

describe("trimmedUsers.json file", () => {
  it("has status OK", () => {
    assert.hasAnyKeys(usersJSON, ["status"]);
    assert.equal(usersJSON.status, "OK");
  });

  it("contains between 5000 and 25000 users", () => {
    assert.hasAnyKeys(usersJSON, ["result"]);
    expect(usersJSON["result"]).toBeInstanceOf(Array);
    expect(usersJSON["result"].length).toBeGreaterThan(5000);
    expect(usersJSON["result"].length).toBeLessThan(25000);
  });

  it("contains users with officialRating, country, handle properties", () => {
    usersJSON["result"].forEach((user) => {
      assert.hasAllKeys(user, ["officialRating", "country", "handle"]);
      assert.typeOf(user["officialRating"], "number");
    });
  });
});
