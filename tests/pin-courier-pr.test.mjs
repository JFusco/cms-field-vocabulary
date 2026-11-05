import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";

const { isPinCourierPR } = createRequire(import.meta.url)("../scripts/is-pin-courier-pr.cjs");
const repository = "JFusco/cms-field-vocabulary";
const pull = () => ({
  draft: false,
  user: { login: "pin-courier[bot]", id: 351979519, type: "Bot" },
  head: { ref: "renovate/npm-minor-and-patch", repo: { full_name: repository } },
  base: { ref: "main", repo: { full_name: repository } }
});

test("only the installed Pin Courier App on its own ready Renovate branch gets a metadata exception", () => {
  assert.equal(isPinCourierPR(pull(), repository), true);
  for (const mutate of [
    p => { p.draft = true; },
    p => { p.user.login = "other[bot]"; },
    p => { p.user.id = 1; },
    p => { p.user.type = "User"; },
    p => { p.head.repo.full_name = "someone/fork"; },
    p => { p.head.ref = "codex/131-migration"; },
    p => { p.base.ref = "other"; },
    p => { p.base.repo.full_name = "someone/fork"; }
  ]) {
    const p = pull(); mutate(p);
    assert.equal(isPinCourierPR(p, repository), false);
  }
  assert.equal(isPinCourierPR(undefined, repository), false);
  assert.equal(isPinCourierPR(pull(), ""), false);
});

test("each metadata check carries the exact App guard after the guard step while the package verifier remains enforced", () => {
  const lint = readFileSync(new URL("../.github/workflows/commitlint.yml", import.meta.url), "utf8");
  const guard = "      - name: Identify trusted Pin Courier PR\n        id: pin_courier\n        run: node scripts/is-pin-courier-pr.cjs\n";
  assert.ok(lint.includes(guard));
  const steps = [
    ["Validate PR body", "${{ !startsWith(github.event.pull_request.head.ref, 'bot/wiki-') && !startsWith(github.event.pull_request.head.ref, 'dependabot/') && steps.pin_courier.outputs.trusted != 'true' }}"],
    ["Lint PR title", "${{ !startsWith(github.event.pull_request.head.ref, 'dependabot/') && steps.pin_courier.outputs.trusted != 'true' }}"],
    ["Lint commit messages", "${{ !startsWith(github.event.pull_request.head.ref, 'dependabot/') && steps.pin_courier.outputs.trusted != 'true' }}"]
  ];
  for (const [name, condition] of steps) {
    const step = `      - name: ${name}\n        if: ${condition}\n`;
    assert.ok(lint.includes(step), `${name} must carry its exact condition`);
    assert.ok(lint.indexOf(guard) < lint.indexOf(step), `${name} must follow the guard step`);
  }
  assert.equal(lint.match(/steps\.pin_courier\.outputs\.trusted != 'true'/g).length, steps.length);
  assert.match(lint, /types: \[opened, synchronize, reopened, edited, ready_for_review\]/);
  const quality = readFileSync(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");
  assert.match(quality, /run: pnpm run verify:ci/);
  assert.doesNotMatch(quality, /pin_courier|is-pin-courier/);
});
