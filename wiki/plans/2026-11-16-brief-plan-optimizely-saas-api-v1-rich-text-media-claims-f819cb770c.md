---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/173", "tests/optimizely-saas-api.test.mjs"]
source_tool: "claude"
source: "/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-ethereal-simon.md"
topics: ["official-source-freshness"]
digest: "f819cb770c43900128c7aa85eb16598424b32427ba6afa818e0413ff68880b3b"
---

# Brief plan: Optimizely SaaS API v1 rich-text media claims

## Context
The official CMS SaaS release notes (https://docs.optimizely.com/cms-saas/release-notes#november-10, entry "Insert images and video from CMS or Optimizely DAM in rich text") now document rich-text media insertion. Scanner observations for source `optimizely-saas.release-notes-index` (locator "CMS SaaS dated release-note entry headings"): fingerprint `ad01132b…a83d` (November 10) and `63739e41…1c1d` (November 12–15). In `sources/profiles/optimizely-saas.cms-api-v1.json`, `richText` only says "Rich-text editor." / "Structured rich-text value.". The goal is a nonbreaking claim enrichment with narrow attribution. Nothing else changes: the 13 tokens, the null deliveryShape, the SDK 2/3/3.1 profiles and the routing in `profiles/consumers/cos.json` (optimizely → cms-api-v1) all stay as they are.

Baseline read 2026-11-16: origin `https://github.com/JFusco/cms-field-vocabulary.git`, clean local `main` = HEAD = `origin/main` = `cfedf7e`. Live main was earlier reported at `e4a9737`, so pull with `--ff-only` before branching.

## Official passages (re-verify from raw HTML at implementation time)
- Intro: rich-text image/video buttons insert media from CMS (SaaS) or Optimizely DAM (when DAM is configured). The image button replaces TinyMCE's image button. The video button is in the Expanded toolbar preset.
- "DAM assets in rich text": "CMS (SaaS) stores DAM assets as permanent links, like other content links, which redirect to the DAM URL."
- "Optimizely Graph and the Content Management API": "To add media through the Content Management API, put a cms://content reference in the src of an img element or of a source element inside a video element."
- "Limitations": only images and video are supported, and documents are added as links.
- Graph `html` public-URL / `json` cms://content claims: **do not import**. They are about delivery, and the profile's deliveryShape stays null.

## Changes
1. `sources/evidence-locators.json`, in the `optimizely-saas.release-notes-index` entry: register exact locators, for example
   - `November 10 > Insert images and video from CMS or Optimizely DAM in rich text`
   - `November 10 > Insert images and video from CMS or Optimizely DAM in rich text > DAM assets in rich text`
   - `November 10 > Insert images and video from CMS or Optimizely DAM in rich text > Optimizely Graph and the Content Management API`
2. `sources/profiles/optimizely-saas.cms-api-v1.json`, `richText` only:
   - `editorBehavior` → for example "Rich-text editor; image and video buttons insert CMS media or, when DAM is configured, Optimizely DAM assets. Only images and video are supported." Keep the `content-types / Property types` evidence and add locator 1.
   - `storageShape` → for example "Structured rich-text value; DAM images and videos are stored as permanent content links. Content Management API media input uses a cms://content reference in img src or video source src." Keep the existing evidence and add locators 2 and 3.
   - Do not change `valueShape`, `typicalUse`, `deliveryShape: null` or `renderingOperations: []`.
3. Regenerate with `pnpm run catalog:build`, which produces `catalog/catalog.json`, `catalog/manifest.json`, `catalog/profiles/optimizely-saas.cms-api-v1.json` and `docs/platforms/optimizely-saas.cms-api-v1.md` (the evidence column will change). Inspect the diff: it should touch only richText in cms-api-v1.
4. `tests/optimizely-saas-api.test.mjs`: add one test using the existing `profile()`/`field()` helpers. It asserts:
   - richText editorBehavior and storageShape are documented with exactly the authored evidence
   - deliveryShape is undocumented/null
   - valueShape is unchanged
   - the profile still has 13 tokens
   - richText in sdk-2, sdk-3 and sdk-3-1 cites no `optimizely-saas.release-notes-index` locator
5. Wiki: add a journal page under `wiki/journal/`, one line in `wiki/topics/official-source-freshness.md` and an entry in `wiki/connections.md`, then `node scripts/wiki/build-graph.cjs`. This follows the precedent commit b254c03.
6. `sources.lock.json`: **unchanged** in the delivered commit. Record both fingerprints in the PR body as proposed observations for maintainer approval. A `pnpm sources:review -- optimizely-saas.release-notes-index` refresh only happens if the maintainer approves it.

Guards in place: `scripts/lib/evidence.mjs` `validateProfileEvidence` requires each evidence source to be routed to the profile (release-notes-index already routes to cms-api-v1) and each locator to be registered. Context-budget fixtures use sdk-2/cms13/sitecore/contentstack, so no budget change is expected.

## Delivery (later stages only, not this stage)
Issue via github-issue-creator → `codex/<n>-saas-rich-text-media` from updated main → one commit. Suggested subject: `feat(optimizely): document SaaS rich-text media`. Confirm feat vs fix from the final diff: this adds new documented claims rather than correcting wrong ones. Then a draft PR with `Closes #<n>`.

## Focused checks
- Compare the exact Nov 10 passages against the cms-api-v1 richText claims and against the SDK 2.2.0/3.0.0/3.1.0 boundaries
- Verify source IDs, registered locators, the 13 unchanged tokens and the unchanged `profiles/consumers/cos.json`
- `pnpm run catalog:build`, then inspect the generated diff; `pnpm run catalog:check`
- `pnpm run release:preflight`; `pnpm run verify:ci` before `pnpm run test:packed`; `npm pack --dry-run --ignore-scripts`
- `node scripts/wiki/discover-plans.cjs`, `node scripts/wiki/build-graph.cjs --check`, `node scripts/wiki/check.cjs`
- `pnpm run lint:pr` before draft publication

## Unresolved questions for focused review
1. Surface fit: the profile transport is "CMS API content-type property schema", but the cms://content input statement is about content-item values sent through the Content Management API. Should it go in storageShape (as proposed) or be left out?
2. Version scoping: the release notes are continuous SaaS notes with no "API v1" qualifier, so applying them to the pinned v1 label relies on the existing source routing.
3. Anchor precision: the date heading id is `november-10`, and the entry and its subsections may have no ids of their own. Confirm the locator text against the raw HTML.
4. Release class (feat vs fix) and whether the maintainer wants the lock observation refreshed in the same PR.
