import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { generateNotes } = require("../scripts/semantic-release-notes.cjs");

const commits = [
  { message: "docs: update guide", hash: "dddddddd" },
  { message: "fix(api): correct output", hash: "bbbbbbbb" },
  { message: "feat(core)!: replace schema", hash: "cccccccc", notes: [{ title: "BREAKING CHANGE", text: "schema" }] },
  { message: "feat(ui): add search", hash: "aaaaaaaa" },
];

test("release notes use the fixed deterministic structure", async () => {
  const notes = await generateNotes({}, { commits, nextRelease: { version: "2.3.0" } });
  assert.equal(notes, "# Release 2.3.0\n\n## Summary\n\nThis release contains 1 breaking change, 1 feature, 1 fix, and 1 other change.\n\n## Breaking changes\n\n- **core:** replace schema (`ccccccc`)\n\n## Features\n\n- **ui:** add search (`aaaaaaa`)\n\n## Fixes\n\n- **api:** correct output (`bbbbbbb`)\n\n## Other changes\n\n- update guide (`ddddddd`)\n");
});
test("empty sections remain explicit", async () => {
  const notes = await generateNotes({}, { commits: [], nextRelease: { version: "1.0.0" } });
  assert.equal((notes.match(/- None\./g) || []).length, 4);
});
