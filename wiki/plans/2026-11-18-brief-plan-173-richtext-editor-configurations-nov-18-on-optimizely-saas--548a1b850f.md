---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/173", "tests/optimizely-saas-api.test.mjs"]
source_tool: "claude"
source: "claude:/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-generic-allen.md"
topics: ["official-source-freshness"]
digest: "548a1b850fdb96a23e4aac0c9a9b54ff474fde1e7b5cd1542d8c20ed238a34c0"
---

# Brief plan — #173 richText editor configurations (Nov 18) on optimizely-saas.cms-api-v1

## Context
Vendor review found a new official CMS SaaS release-note subsection, November 18 >
"Create your own rich-text editor configurations"
(https://docs.optimizely.com/cms-saas/release-notes#create-your-own-rich-text-editor-configurations,
source `optimizely-saas.release-notes-index`, reported live fingerprint
d0d9182f99b21cf0d1b9aa1bd83a5d9a433671177908b7a02eec58646647166b — not recomputed here).
Issue #173 owns the API v1 `richText` field and its candidate 911d21a (base e4a9737)
implements only the November 10 media scope. The new claims enrich `richText.editorBehavior`.

## Verified in this stage (read-only)
- Worktree `/Users/joe.fusco/Projects/cms-field-vocabulary-worktrees/173-saas-rich-text-media`,
  branch `codex/173-saas-rich-text-media`, HEAD 911d21a, clean; origin
  `JFusco/cms-field-vocabulary`; origin/main 9b3ce6c (includes discovery repair 287cfa4);
  candidate is two commits behind main.
- Live page 2026-11-18: HTTP 200, final URL unchanged, body SHA256
  3e510f8750d07aa46b6737bb7e9894b1f176e452714f1e9825fd4ef89ad8b78c. Anchor `november-18`
  contains heading id `create-your-own-rich-text-editor-configurations`. Exact text:
  "Decide which toolbar buttons, named styles, block formats, and content stylesheets each
  rich-text property offers, without code changes. Administrators create named configurations
  in Settings > Config > TinyMCE Configurations. They assign one to a property in the
  property's editor settings. The Minimal, Standard, and Expanded configurations are still
  available, and you cannot edit or delete them. You also cannot delete a configuration while
  a property uses it."
- The November 10 subsection that #173 cites is still present.
- #173 acceptance criteria limit richText changes to `editorBehavior`/`storageShape` and the
  Nov 10 locators. The Nov 18 claim goes beyond them, so the scope has to be coordinated.
- PR #175 (#174, draft, head c7d9ca0) touches the same profile, locators file, generated
  outputs and tests, and adds a 14th token. That conflicts with #173's "all 13 tokens" check
  and test `fields.length === 13`.
- Session bridge: complete and fresh, with no competing exact-issue claim.

## Steps (next writer stage; none performed here)
0. Coordination (PM/Morgan, one write): post one #173 comment, or amend the body with
   maintainer consent, that adds the Nov 18 scope and acceptance criterion (editorBehavior
   only, exact locator, no storage/value/delivery change). Read it back. Do not open a new
   issue or PR for this.
1. Integrate origin/main 9b3ce6c into the owned branch (rebase or merge, owner's choice) and
   regenerate.
2. `sources/evidence-locators.json` → under `optimizely-saas.release-notes-index` add
   `{ "locator": "November 18 > Create your own rich-text editor configurations" }`.
3. `sources/profiles/optimizely-saas.cms-api-v1.json` → `richText.editorBehavior`: append
   "Administrators can assign a named TinyMCE configuration (toolbar buttons, named styles,
   block formats, content stylesheets) per property in its editor settings; the built-in
   Minimal, Standard and Expanded configurations cannot be edited or deleted, and a
   configuration in use cannot be deleted." Add the evidence entry for the new locator to
   `claimEvidence.editorBehavior`. Leave valueShape, typicalUse, storageShape, deliveryShape:
   null, renderingOperations [] and the native tokens unchanged. Make no change to the SDK
   2/3/3.1 profiles or to `profiles/consumers/cos.json`. Make no change to `sources.lock.json`.
4. `pnpm run catalog:build` → catalog/catalog.json, catalog/manifest.json,
   catalog/profiles/optimizely-saas.cms-api-v1.json, docs/platforms/optimizely-saas.cms-api-v1.md.
5. `tests/optimizely-saas-api.test.mjs`, in the existing rich-text test: extend the
   editorBehavior evidence deepEqual with the Nov 18 locator and add an
   `assert.match(/TinyMCE configuration/)`. Keep the SDK non-citation loop. Keep
   `fields.length === 13` while main has 13 tokens. If #175 merges first, the rebase changes
   it to 14.
6. Wiki: journal entry, topic line in `wiki/topics/official-source-freshness.md`, archive
   this plan via `node scripts/wiki/discover-plans.cjs` (do not archive it directly), then
   `node scripts/wiki/build-graph.cjs` and `node scripts/wiki/check.cjs`.
7. Commit: `feat(optimizely): document SaaS rich-text configs`, Refs #173.

## Checks (candidate head)
`node --test tests/optimizely-saas-api.test.mjs tests/catalog-contract.test.mjs`;
`pnpm run release:preflight`; `pnpm run verify:ci`, then `pnpm run test:packed`;
`npm pack --dry-run --ignore-scripts`; a successful discover-plans receipt with selected
coverage (lesson e20ce6e8), plus graph and check; `pnpm run lint:pr` before the draft.
Review: diff the generated outputs to confirm the only change is the richText
editorBehavior text and evidence, and that SDK profiles and routing are byte-identical.

## Unresolved
(a) Whether the maintainer accepts expanding #173's acceptance criteria. If not, file a
    separate issue for the Nov 18 claim, sequenced after #173.
(b) Merge order with #175: whichever merges second rebases, regenerates and updates the
    token-count assertion.
(c) Recompute fingerprint d0d9182f… from the scan artifact. It remains a proposal and is
    not accepted.
(d) Out of scope: the Nov 18 bug fix CMS-58191 (string min-length / Min Length field) is a
    separate `string` editor claim that needs its own disposition.
(e) The release notes carry no explicit "API v1" qualifier, so applicability relies on the
    existing source routing (same caveat as #173).
