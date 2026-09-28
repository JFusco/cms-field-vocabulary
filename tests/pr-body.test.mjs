import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { REQUIRED_CHECKS, validatePullRequestBody } = require("../scripts/validate_pr_body.cjs");

function validBody() {
  return `## Summary

Standardize deterministic Git delivery for review.

## Linked issue

Closes #75

## Changes

- Add the canonical pull request contract.

## Verification

- pnpm run verify:ci passed locally.

## Risk and rollback

- Risk: Existing pull requests must adopt the required structure.
- Rollback: Revert the delivery-tooling commit.

## Checklist

${REQUIRED_CHECKS.map((item) => `- [x] ${item}`).join("\n")}
`;
}

test("the canonical pull request body passes", () => {
  assert.deepEqual(validatePullRequestBody(validBody()), []);
});
test("incomplete pull request bodies fail", () => {
  const errors = validatePullRequestBody(validBody().replace("Closes #75", "Related #75"));
  assert.ok(errors.some((error) => error.startsWith("Linked issue must")));
});

test("the actual pull request template requires completion and matches the validator", () => {
  const template = readFileSync(new URL("../.github/pull_request_template.md", import.meta.url), "utf8");
  assert.notDeepEqual(validatePullRequestBody(template), []);

  const answers = [
    "Standardize deterministic Git delivery for review.",
    "Closes #75",
    "- Add the canonical pull request contract.",
    "- pnpm run verify:ci passed locally.",
    "Existing pull requests must adopt the required structure.",
    "Revert the delivery-tooling commit.",
  ];
  let index = 0;
  const completed = template
    .replace(/<!--[\s\S]*?-->/g, () => answers[index++])
    .replaceAll("- [ ]", "- [x]");
  assert.equal(index, answers.length);
  assert.deepEqual(validatePullRequestBody(completed), []);
});
