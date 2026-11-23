---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/197; sources/profiles/optimizely-paas.cms13-model.json; tests/optimizely-paas-cms13.test.mjs"]
source_tool: "repository"
source: "/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-effervescent-steele.md"
topics: ["official-source-freshness"]
digest: "4a8b8a1be6f9dfe8e6fabce74d004c86e44c78de3d47b08f1ffa774c31ee84b3"
---

# Brief plan: qualify CMS 13 model `XhtmlString` editor media (13.7.0)

## Context
The `optimizely-paas.cms13-model` profile says `XhtmlString` editorBehavior is "TinyMCE HTML editor." EPiServer.CMS.Core 13.7.0 adds CMS/DAM image and video buttons to rich-text editors and uploads dragged or pasted images to CMS. The proposal adds that claim to this profile, qualified to 13.7.0 onward. It is a separate surface from the admin-profile proposal in PR #196 / issue #195.

Base: origin https://github.com/JFusco/cms-field-vocabulary.git, live main = origin/main = 7b68dec9aa9026a69d53f825f0b396bbcae5d8d7. The primary checkout (HEAD 287cfa4, six dirty graphify-out files) is untouched.

## Evidence (re-read live 2026-11-23)
- `optimizely-paas.cms13-release-notes-index`, https://docs.optimizely.com/cms-13/release-notes (HTTP 200). h2 `cms-coreepiservercmscore` "CMS Core—EPiServer.CMS.Core" > h3 `november-181370` "November 18—13.7.0" > Enhancements, item 1: "Added image and video buttons to rich-text editors, so you can insert media from CMS or Optimizely Digital Asset Management (DAM) without leaving the editor. Images that you drag or paste into the editor now upload to CMS before they are inserted, so rich text no longer stores them as embedded data." The registry routes this source to both cms13-admin and cms13-model. The proposed fingerprint 3041b3ee83f2e42dfb29dd5b9d9ea2a61f8d6fbf4b1965162f81faf1dfa73c48 is not accepted, and sources.lock.json stays unchanged.
- `optimizely-paas.cms13-builtins`, registered URL https://docs.developers.optimizely.com/content-management-system/v13.0.0-CMS/docs/built-in-property-types. It returns 301 to the allowed host https://docs.optimizely.com/cms-13/docs/built-in-property-types (200). Under Common property types, the "HTML" row maps `XHtmlString` to "A TinyMCE HTML editor".
- Applicability: the release note says "rich-text editors" in general. Applying it to `XhtmlString` is an inference from that row's TinyMCE mapping, and the PR body must say so.

## Edits (codex/<issue>-qualify-cms13-model-xhtml-media, from fresh main)
1. `sources/evidence-locators.json`: register `CMS Core > November 18—13.7.0 > Enhancements` under `optimizely-paas.cms13-release-notes-index`. `assertEvidence` in `scripts/lib/evidence.mjs` rejects unregistered locators. The entry must match #196 byte for byte so the two PRs merge cleanly.
2. `sources/profiles/optimizely-paas.cms13-model.json`, field `XhtmlString` only:
   - `editorBehavior`: "TinyMCE HTML editor. From EPiServer.CMS.Core 13.7.0, image and video buttons insert media from CMS or Optimizely DAM, and dragged or pasted images upload to CMS before insertion instead of being stored as embedded data."
   - `claimEvidence.editorBehavior`: keep the builtins `Common property types` entry and add the release-notes locator.
   - Preserved: nativeToken spelling, `evidence`, valueShape `{rich-text, nullable}`, typicalUse, null storageShape/deliveryShape, the pass-through rendering operation (`nullHandling: preserve`, `coerce-rich-text-to-plain-string`), profile notes.
3. Regenerate with `pnpm run catalog:build`. Expect changes in `catalog/catalog.json`, `catalog/manifest.json` (digests only; fieldCount unchanged), `catalog/profiles/optimizely-paas.cms13-model.json` and `docs/platforms/optimizely-paas.cms13-model.md` (evidence list row 26).
4. `tests/optimizely-paas-cms13.test.mjs`: add one test using the existing `profile()` / `field()` helpers. It checks:
   - the 13.7.0 qualified wording
   - the exact two-entry editorBehavior evidence
   - the unchanged valueShape, storage/delivery `undocumented` and the rendering operation
   - the field list is unchanged (already covered)
5. Wiki: add a journal entry, a line in `wiki/topics/official-source-freshness.md`, and the archived plan per `wiki/MECHANICS.md`, then rebuild the graph and connections.

Excluded: the admin profile (#196), SaaS profiles, REST link-fragment and SaaS media payload representations, the CLR/delivery transport, other 13.7.0 items (Graph refresh/sync, CMS-52808 etc.), official-sources.json, sources.lock.json and routing.

## Coupling with PR #196 (head bc8800c4)
- #196 adds `assert.doesNotMatch(model.claims.editorBehavior.value, /13\.7\.0/)` to the same test file. That assertion contradicts this proposal.
- If #196 merges first: rebase, replace that line with a positive assertion, and drop the duplicate locator.
- If this PR merges first: #196 must drop the line.
- Either way, the second PR regenerates catalog.json, manifest.json and the wiki graph, and its checks and review are renewed.
- Also record the shared-output overlap with #194 (8cab9165).

## Checks (save under checks/<issue>-<sha>/; do not reuse #194/#195 paths)
- Recheck both passages at their registered locators, and the 13.7.0 qualification, before implementing.
- Run `node scripts/wiki/discover-plans.cjs` before implementing and again at the head (lesson e20ce6e8).
- Compare catalog records by canonical ID (lesson ed61ded2): only `optimizely-paas.cms13-model.XhtmlString` editorBehavior and its evidence change; field IDs, other profiles and sourceLockDigest stay unchanged.
- `pnpm run release:preflight`
- `pnpm run verify:ci`, then `pnpm run test:packed`
- `npm pack --dry-run --ignore-scripts`
- `node scripts/wiki/build-graph.cjs` (then `--check`) and `node scripts/wiki/check.cjs`
- `pnpm run lint:pr` at the PR stage.

## Unresolved questions
- Which of #196 and this PR merges first, which decides the test-line resolution above.
- Maintainer acceptance of observation 3041b3ee… stays separate (lesson 0bae0bcc).
- Expected release impact: nonbreaking `feat`. No new major profile.
