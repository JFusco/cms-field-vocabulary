import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// The documented consumer floor. Raising it is a breaking change for
// consumers; change it here, in package.json and in both documents together.
const SUPPORTED_NODE_FLOOR = "24.14.0";
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("published engines.node keeps the documented consumer range", () => {
  const { engines } = JSON.parse(read("package.json"));
  assert.equal(engines?.node, `>=${SUPPORTED_NODE_FLOOR}`,
    "engines.node changed; dependency updates must not narrow the supported Node.js range");
});

test("README and CONTRIBUTING document the same Node.js floor", () => {
  for (const file of ["README.md", "CONTRIBUTING.md"]) {
    const floors = [...read(file).matchAll(/Node\.js (\d+\.\d+\.\d+) or newer/g)].map(m => m[1]);
    assert.deepEqual(floors, [SUPPORTED_NODE_FLOOR], `${file} must state Node.js ${SUPPORTED_NODE_FLOOR} or newer exactly once`);
  }
});
