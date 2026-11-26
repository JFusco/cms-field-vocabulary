---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/195; sources/profiles/optimizely-paas.cms13-admin.json; tests/optimizely-paas-cms13.test.mjs"]
source_tool: "repository"
source: "/Users/joe.fusco/.claude/plans/cms-maintenance-proposal-plan-parsed-brooks.md"
topics: ["official-source-freshness"]
digest: "09fc8db63ea85616e269bb5cf1246938f47b03ee33bee65d0843cc64c269cee4"
---

# Brief plan — qualify CMS 13 admin `XHTML string (>255)` editor claim with CMS Core 13.7.0 media behavior

## Context
Vendor review found that Optimizely's CMS 13 release notes (EPiServer.CMS.Core 13.7.0, November 18) add rich-text
image/video buttons (CMS or DAM media) and upload dragged/pasted images to CMS instead of storing them as embedded
data. The `optimizely-paas.cms13-admin` profile currently describes `XHTML string (>255)` only as
"XHTML rich-text editor." This is a focused, nonbreaking editor-claim enrichment for that single authoring surface,
explicitly qualified to 13.7.0 onward. The CMS13 model (`XhtmlString`) surface is a separate candidate/PR.

Base verified 2026-11-23: origin `https://github.com/JFusco/cms-field-vocabulary.git`, live `refs/heads/main` =
`origin/main` = `7b68dec9aa9026a69d53f825f0b396bbcae5d8d7`. Primary checkout (HEAD 287cfa4, six dirty Graphify files)
must not be touched; implement in a new worktree from fresh main.

## Evidence (re-read live 2026-11-23, allowed hosts, no auto-redirects)
1. `optimizely-paas.cms13-release-notes-index` — https://docs.optimizely.com/cms-13/release-notes (HTTP 200).
   h2 "CMS Core—EPiServer.CMS.Core" > h3 id `november-181370` "November 18—13.7.0" > Enhancements, first item:
   "Added image and video buttons to rich-text editors, so you can insert media from CMS or Optimizely Digital Asset
   Management (DAM) without leaving the editor. Images that you drag or paste into the editor now upload to CMS before
   they are inserted, so rich text no longer stores them as embedded data."
   Lock entry is still `normalizedSha256 aed259c7…b4d2` (observed 2026-10-31); proposed observation
   `3041b3ee83f2e42dfb29dd5b9d9ea2a61f8d6fbf4b1965162f81faf1dfa73c48` stays a proposal (not applied).
2. `optimizely-paas.cms13-text-property` — registered URL
   https://docs.developers.optimizely.com/content-management-system/v13.0.0-CMS/docs/text-property returns 301 to
   allowed host https://docs.optimizely.com/cms-13/docs/text-property (HTTP 200). Text Type > "XHTML string (>255) –
   Select for formatted text … WYSIWYG editor (see TinyMCE Toolbar options) … built-in validation to ensure the stored
   XHTML is well-formed." This maps the admin label to the rich-text (TinyMCE) editor the release note changes.

## Edits (exact files)
1. `sources/evidence-locators.json` — under sourceId `optimizely-paas.cms13-release-notes-index`, register locator
   `CMS Core > November 18—13.7.0 > Enhancements` (needed: `assertEvidence` in `scripts/lib/evidence.mjs` rejects
   unregistered locators; source already routes `optimizely-paas.cms13-admin` and is already in the profile's
   `sourceIds`, so no `official-sources.json` change).
2. `sources/profiles/optimizely-paas.cms13-admin.json`, field `XHTML string (>255)` only:
   - `editorBehavior` → e.g. "XHTML rich-text (TinyMCE) editor. From EPiServer.CMS.Core 13.7.0, image and video
     buttons insert media from CMS or Optimizely DAM, and dragged or pasted images upload to CMS before insertion
     instead of being stored as embedded data." (Final wording must keep the 13.7.0 qualifier; no claim for earlier
     CMS 13 releases.)
   - `claimEvidence.editorBehavior` → keep existing text-property locator, append the new release-notes locator.
   - Unchanged: `nativeToken`, `canonicalSuffix`, `evidence`, `valueShape` (rich-text, nullable), `typicalUse`,
     `storageShape: null`, `deliveryShape: null`, `renderingOperations`, other claimEvidence, other 21 fields, profile
     notes/version/routing. No storage/delivery claim from "no longer stores embedded data" (editor behavior only).
3. Regenerate with `pnpm run catalog:build`: `catalog/catalog.json`, `catalog/manifest.json` (digests only; fieldCount
   unchanged), `catalog/profiles/optimizely-paas.cms13-admin.json`, `docs/platforms/optimizely-paas.cms13-admin.md`.
4. Test: add a focused case in `tests/catalog-contract.test.mjs` (where `cms13Admin` is already loaded) or a small
   new `tests/optimizely-paas-cms13-admin.test.mjs` using `compileCatalog()` from `scripts/lib/catalog.mjs`
   (pattern in `tests/optimizely-paas-cms13.test.mjs`): assert the XHTML editorBehavior contains "13.7.0", cites the
   new locator, and that valueShape/storageShape/deliveryShape are unchanged and the model profile is untouched.
5. Wiki: journal entry + topic update, archive this plan per `wiki/MECHANICS.md`, rebuild graph/connections.

## Exclusions (boundaries for focused review)
- No `optimizely-paas.cms13-model` change (separate candidate), no SaaS profile change, no CLR/REST transport claims.
- Same 13.7.0 entry also lists CMS-58191 (REST string min-length), CMS-58884 (REST link #fragment in `extra`) and
  CMS-59042 (DAM links in rich text): transport/bug-fix items, out of scope; not imported.
- No `sources.lock.json` or `sources/official-sources.json` change; no consumer routing change.

## Checks (selected approach: plan=brief, review=focused, validation=developer-checks)
- Preflight `node scripts/wiki/discover-plans.cjs` before implementation (lesson e20ce6e8) and again at head.
- Re-verify both official passages at the registered locators; confirm 13.7.0 qualification and admin-label mapping.
- Canonical-ID comparison of catalog records vs base: only the XHTML string (>255) editorBehavior changes.
- `pnpm run release:preflight`, `pnpm run verify:ci`, then `pnpm run test:packed` (after verify:ci, lesson),
  `npm pack --dry-run --ignore-scripts`, `node scripts/wiki/build-graph.cjs` + `node scripts/wiki/check.cjs`.
- `pnpm run lint:pr` at the PR stage.

## Delivery identity / impact
Issue via github-issue-creator (canonical labels), branch `codex/<issue>-<slug>` from fresh main, conventional
`feat(optimizely): …` commit → nonbreaking minor. Duplicates: none (issue/PR searches for "13.7.0" and "XHTML" empty;
open PRs only #192, #194, neither touches cms13-admin). Session bridge fresh/complete, no competing claim.

## Unresolved questions
- Scanner reproduction of fingerprint 3041b3ee… was reported by vendor-review; this stage computed only raw page /
  segment hashes (page 4d4a08ae…, 13.7.0 h3 segment 2c8b670d…). Implementation should reproduce via the repo scanner
  read-only or record that the fingerprint is cited from vendor-review.
- The release note says "rich-text editors" generically; applicability to the XHTML string label relies on the
  text-property mapping (WYSIWYG/TinyMCE). State this inference explicitly in the PR.
- Generated catalog files overlap with open draft PR #194; if #194 merges first, rebase and regenerate (never
  hand-merge generated output).
- Observation acceptance remains a separate explicit maintainer/readiness decision (lesson 0bae0bcc).
