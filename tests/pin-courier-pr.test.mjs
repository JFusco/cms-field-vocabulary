import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import test from "node:test";

const { isPinCourierPR } = createRequire(import.meta.url)("../scripts/is-pin-courier-pr.cjs");
const repository = "JFusco/cms-field-vocabulary";
const pull = () => ({
  user: { login: "pin-courier[bot]", id: 351979519, type: "Bot" },
  head: { ref: "renovate/npm-minor-and-patch", repo: { full_name: repository } },
  base: { ref: "main", repo: { full_name: repository } }
});

test("only the installed Pin Courier App on its own Renovate branch gets a metadata exception", () => {
  assert.equal(isPinCourierPR(pull(), repository), true);
  for (const mutate of [
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

test("all metadata checks use the App guard while the package verifier remains enforced", () => {
  const lint = readFileSync(new URL("../.github/workflows/commitlint.yml", import.meta.url), "utf8");
  assert.match(lint, /run: node scripts\/is-pin-courier-pr\.cjs/);
  assert.equal(lint.match(/steps\.pin_courier\.outputs\.trusted != 'true'/g).length, 3);
  const quality = readFileSync(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");
  assert.match(quality, /run: pnpm run verify:ci/);
  assert.doesNotMatch(quality, /pin_courier|is-pin-courier/);
});
