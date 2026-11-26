---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/193; sources/profiles/optimizely-saas.cms-api-v1.json; tests/optimizely-saas-api.test.mjs"]
source_tool: "repository"
source: "/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-reactive-willow.md"
topics: ["official-source-freshness"]
digest: "38e768b9535e8918024326768e7ef6b20c408c9c6d1574de20cc944ed192cadf"
---

# Brief plan — optimizely-saas.cms-api-v1 string validation and nesting limits

## Context
Current main 7b68dec9aa9026a69d53f825f0b396bbcae5d8d7 (origin JFusco/cms-field-vocabulary, verified live) omits two officially documented
claim sets from `sources/profiles/optimizely-saas.cms-api-v1.json`:
1. String validation. `string.editorBehavior` is only "Text editor refined by format and constraints." Re-read 2026-11-23:
   - content-types "Validation fields": maxLength (string, array), minLength (string), pattern (string).
   - release notes `november-18` > Bug fixes > CMS-58191: the editor capped a string with a minimum and no maximum at 255 characters; such properties now accept text of any length, property settings have a Min Length field, and an admin-UI save no longer removes a REST-set minimum.
2. Nesting limits (content-types h2 "Nesting limits", Updated 20 Nov 2026, re-read 2026-11-23): inline blocks in content areas, component and content properties, arrays of components and Visual Builder sections are limited to 8 levels; Visual Builder layouts (section, rows, columns, elements) to 4; json values to 8 (Data types also says "Values can be nested up to eight levels"). A shared block or section counts as 1 level and is checked when it is saved. The whole item is validated on every save, so an unrelated edit can be blocked. A REST request over a limit returns 400 Bad Request with the field path. REST request bodies are limited to 64 levels; that is a transport limit, not a field claim, so leave it out.

Expected impact: nonbreaking enrichment of descriptive claims (`feat(optimizely): …` or `fix(optimizely): …`, chosen at commit). No source-lock change. Observation d0d9182f… and content-types fingerprint 53233f57… stay proposals.

## Files and changes
- `sources/evidence-locators.json`: register `optimizely-saas.content-types` → `Nesting limits` and `optimizely-saas.release-notes-index` → `November 18 > Bug fixes`. Locators are checked by `assertEvidence` in `scripts/lib/evidence.mjs`, so unregistered locators fail `validate`.
- `sources/profiles/optimizely-saas.cms-api-v1.json`, editorBehavior text and claimEvidence only:
  - `string`: minLength/maxLength character bounds and pattern regex. Since November 18, a minimum with no maximum accepts any length, settings expose Min Length, and an admin save keeps a REST-set minimum. Evidence: Property types, Properties > Validation fields, release notes November 18 > Bug fixes.
  - `json`: add the 8-level value nesting. Evidence: Properties > Data types, Nesting limits.
  - `content`, `component`: 8-level nesting; shared content counts as 1 level; the whole item is validated on save; REST returns 400 with the field path. Keep the existing allowedTypes/restrictedTypes text. Evidence: existing + Nesting limits.
  - `array`: the 8-level limit applies to arrays of components only; state that qualifier. Evidence: existing + Nesting limits.
  - `composition`: layout nodes are limited to 4 levels. Evidence: existing + Nesting limits.
  - Leave unchanged: the 14 tokens; valueShape, storageShape and deliveryShape; renderingOperations; defaultEvidence; SDK 2/3/3.1 profiles; routing; `sources.lock.json`; `sources/official-sources.json`. Do not repeat the richText (#176) or composition-field (#175) work.
- Regenerate with `pnpm run catalog:build`: `catalog/catalog.json`, `catalog/manifest.json`, `catalog/profiles/optimizely-saas.cms-api-v1.json`, `docs/platforms/optimizely-saas.cms-api-v1.md`. Run `context:check`; update only if the budget legitimately changes.
- `tests/optimizely-saas-api.test.mjs`: add NESTING_LIMITS and BUG_FIXES constants. Assert string, json, content, component, array and composition editorBehavior text and evidence; assert valueShape/storageShape/deliveryShape are unchanged and there are still 14 fields.
- Wiki: journal entry, topic update and archived plan per `wiki/MECHANICS.md`; regenerate the graph.

## Delivery (later stages only)
Issue through the github-issue-creator workflow, read back, then a `codex/<n>-…` branch from the updated main, then the PR template with `Closes #n`. Nothing is created in this stage.

## Checks
1. Before editing, re-read both passages at the registered locators within allowedHosts. Search for duplicate open/closed issues and PRs (current: only #150, #189, PR #192 open; #173 explicitly excluded CMS-58191).
2. Diff generated records by canonical ID; all unrelated fields and profiles must be byte-identical.
3. `pnpm run release:preflight`, `pnpm run verify:ci`, then `pnpm run test:packed`, `npm pack --dry-run --ignore-scripts`.
4. Run `node scripts/wiki/discover-plans.cjs` before implementing (lesson e20ce6e8) and again at the candidate head; then `node scripts/wiki/build-graph.cjs`, `node scripts/wiki/check.cjs`, and `pnpm run lint:pr`.

## Unresolved questions (for focused review)
- Should json's 8-level limit go in `storageShape` instead of `editorBehavior`? Plan: editorBehavior, matching the Validation-fields precedent.
- Should content/component also cite the general rules (shared content, whole-item save, 400), or only the numeric limit? Plan: cite them once per affected field, briefly.
- The live raw SHA256 differs between retrievals (page build chunks); passage text matches. Record a fresh retrieval hash at implementation; it is not a fingerprint.
