import assert from "node:assert";
import { advanceKnockoutBracket, THIRD_PLACE_ROUND } from "../lib/tournamentSimulator/knockout.js";

const bracket = {
  matches: {
    "Round of 32": [],
  },
};

const result = advanceKnockoutBracket(bracket, {});

assert.ok(Array.isArray(result.matches[THIRD_PLACE_ROUND]), `${THIRD_PLACE_ROUND} round must exist as an array`);
assert.strictEqual(result.matches[THIRD_PLACE_ROUND].length, 0, "Empty or incomplete semifinals should produce no third place match");

console.log("✅ Knockout third-place regression test passed.");
