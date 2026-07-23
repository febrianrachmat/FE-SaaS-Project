import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computePosition } from "./kanban";

describe("computePosition", () => {
  it("returns a default midpoint when column is empty", () => {
    assert.equal(computePosition(null, null), 1000);
  });

  it("places before the first card", () => {
    assert.equal(computePosition(null, 2000), 1000);
  });

  it("places after the last card", () => {
    assert.equal(computePosition(2000, null), 3000);
  });

  it("places between two neighbors", () => {
    assert.equal(computePosition(1000, 3000), 2000);
  });
});
