---
status: "implemented"
executed: true
evidence: ["wiki/journal/2026-11-18-add-saas-composition-property-type.md", "tests/optimizely-saas-api.test.mjs"]
source_tool: "claude"
source: "claude:/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-synchronous-ocean.md"
topics: ["official-source-freshness", "catalog-authority"]
digest: "4fd9b3f3ff3a9951b2d91788530e64ae2cfc25901a6a6363767cfbbd4effce62"
---

# Brief plan — add `composition` to optimizely-saas.cms-api-v1

## Context
The scheduled vendor-drift scan reported an enumeration change on `optimizely-saas.content-types` (fingerprint 53233f57da97689579e6bce58190cdc98b885cdc4cf97645c8e16b8a12c5adca). The reviewed lock (fragment af0bbf33…) and the API v1 profile both list 13 tokens. The live official enumeration lists 14 and adds `composition`. This plan delivers a draft proposal that adds only the documented claims. Accepting the source lock stays with the maintainer.

## Evidence re-verified in this stage (2026-11-18, read-only)
- Registered URL https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/content-types-saas → HTTP 200 at https://docs.optimizely.com/cms-saas/docs/content-types-saas (allowed host). Body SHA256 5e64545f…7f61. This is a raw page hash, not the scanner fingerprint.
- The registered `data-types` discovery region yields 14 tokens: string, url, boolean, integer, float, dateTime, contentReference, content, link, richText, json, component, **composition**, array.
- Properties > Data types: "composition – Represents a Visual Builder layout with the content it contains. Supported only on content types with the base type _experience. Not supported as an array item. Use the format field to set the layout type."
- Properties > format: "On a composition property, format instead names the layout type to use."
- Properties > Validation fields: allowedTypes/restrictedTypes apply to (content, contentReference, composition); restrictedTypes "has priority over allowedTypes".
- Separate built-in standard field (Standard fields > composition): "Only relevant for experience and section types. Configures the content type's built-in composition (the main Visual Builder canvas) through format, allowedTypes, and restrictedTypes." This is **not** the property data type and must not be merged into it. Its scope (experience+section) differs from the property's (_experience only).
- SDK 2/3/3.1 profiles do not contain `composition`. `compileSourceProfile` (scripts/lib/catalog.mjs:124) attaches source-token evidence per field, so their compiled fields stay unchanged.

## Changes (worktree `codex/<issue>-saas-composition-property` from current origin/main 9b3ce6c)
1. `sources/official-sources.json` → `optimizely-saas.content-types.extract.tokens`: append `composition`. Leave the discovery patterns, URL, locator and profiles unchanged.
2. `sources/evidence-locators.json` → add locator `Properties > format` under `optimizely-saas.content-types`. `Properties > Data types` and `Properties > Validation fields` already exist.
3. `sources/profiles/optimizely-saas.cms-api-v1.json` → append a field:
   - `nativeToken: "composition"` (canonical ID `optimizely-saas.cms-api-v1.composition` via `canonicalSuffix`)
   - `valueShape: null`, `storageShape: null`, `deliveryShape: null`, `renderingOperations: []`. Wire shape, nullability, delivery and rendering are undocumented.
   - `typicalUse`: Visual Builder layout with the content it contains; only on `_experience` content types; not an array item. Cite Data types.
   - `editorBehavior`: format names the layout type; allowedTypes/restrictedTypes limit content types, with restrictedTypes taking priority. Cite format, Validation fields and Data types.
4. `sources.lock.json`: proposed refresh of the `optimizely-saas.content-types` entry only, via `pnpm sources:review -- optimizely-saas.content-types` (live fetch, no `--allow-manual`). Present it in the draft PR as a proposal for maintainer approval. Diff the entry and confirm only tokens, observation hashes and timestamps change, with applicability unchanged. If validation would let the token stay out of the lock, keep the lock unchanged instead. `validate.mjs:62` requires manifest tokens to equal the lock's `requiredTokens`, so the lock delta is required.
5. Regenerate with `pnpm run catalog:build`: catalog/catalog.json (sourceLockDigest + new field), catalog/manifest.json, catalog/profiles/optimizely-saas.cms-api-v1.json, docs/platforms/optimizely-saas.cms-api-v1.md. Update the context budget only if `context:check` requires it.
6. Tests:
   - tests/catalog-contract.test.mjs:43 → add `composition` to the API v1 expected list. The SDK lists stay unchanged.
   - tests/optimizely-saas-api.test.mjs → new test. Composition has undocumented valueShape/storage/delivery and no operations; typicalUse and editorBehavior evidence match exactly; it is distinct from `content` and `component`; the editorBehavior text does not claim section scope. Add a resolver case for `.composition` with `react-nextjs`.
7. Wiki: journal entry + topic update per wiki/MECHANICS.md; archive this plan through discovery; `graph:build`.
8. Leave unchanged: profiles/consumers/cos.json routing, SDK profiles, every existing canonical ID, agent profiles.

## Checks (run on the candidate head, in order)
Independent fourteen-token reproduction + exact claim comparison; custom-property vs built-in scope review; diff proving existing canonical IDs/SDK compiled profiles/cos routing unchanged; inspection of generated catalog/manifest/docs; `node --test tests/optimizely-saas-api.test.mjs tests/catalog-contract.test.mjs tests/resolver-contract.test.mjs tests/evidence-contract.test.mjs`; `pnpm run release:preflight`; `pnpm run verify:ci`; `pnpm run test:packed` (after verify:ci); `npm pack --dry-run --ignore-scripts`; `node scripts/wiki/discover-plans.cjs`, `graph:build`/`graph:check`, `wiki:check`; `pnpm run lint:pr` before the draft PR.

## Preflight observed in this stage
`node scripts/wiki/discover-plans.cjs` at local 287cfa4 (= main minus the release commit, which only changed CHANGELOG/package.json) exits 0 with "5 candidates require repository-association review". Stdout piped to a JSON parser was cut off at about 64 KB. Rerun it on the candidate head; do not substitute verify:ci.

## Unresolved questions
1. #173's acceptance criterion says "All 13 native tokens … remain unchanged". Both deliveries touch the generated catalog and docs, and whichever merges second must rebase and regenerate. Recommendation: separate issue/PR, with a comment on #173 clarifying that its criterion covers its own diff. Owner: PM/maintainer.
2. Whether to commit the lock refresh (step 4) in the draft or present it only in the PR body. Repo validation requires it in the draft; acceptance stays with the maintainer.
3. The scanner fingerprint 53233f57… was not recomputed here. Confirm it from `sources:review` output or the latest artifact before filing.
4. The linked "Composition properties" page (cms-saas/docs/composition-properties) is unregistered. Do not cite it or infer layout-type values from it.

Release impact: additive `feat` (new canonical field), subject to the final public diff.
