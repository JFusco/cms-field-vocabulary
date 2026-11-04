# Graph Report - cms-renovate-131  (2026-11-04)

## Corpus Check
- 44 files · ~26,072 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 532 nodes · 1213 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dfdd8791`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- common.cjs
- on-merge-sync.cjs
- audit-plan-candidates.cjs
- catalog.mjs
- viewer.js
- routing.cjs
- validate.mjs
- source-scan.mjs
- archive-plan.cjs
- reconcile-merges.cjs
- check-release-commit.selftest.cjs
- source-review.mjs
- check-context-budget.mjs
- serve-graph.cjs
- validate_pr_body.cjs
- semantic-release-notes.cjs
- verify-packed-consumer.mjs
- readJson
- routing.js
- is-pin-courier-pr.cjs

## God Nodes (most connected - your core abstractions)
1. `repoRoot()` - 26 edges
2. `reconcile()` - 23 edges
3. `collect()` - 18 edges
4. `slash()` - 17 edges
5. `git()` - 17 edges
6. `discover()` - 15 edges
7. `validateArchiveInput()` - 14 edges
8. `classify()` - 13 edges
9. `ensureInside()` - 13 edges
10. `atomicWrite()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `validateConfigObject()` --indirect_call--> `key()`  [INFERRED]
  src/projection.ts → scripts/wiki/lib/github-refs.cjs
- `resolveBaseBranch()` --indirect_call--> `candidate()`  [INFERRED]
  scripts/wiki/audit-plan-candidates.cjs → scripts/wiki/lib/plans.cjs
- `enrichExisting()` --calls--> `json()`  [EXTRACTED]
  scripts/source-review.mjs → scripts/lib/catalog.mjs
- `observeSource()` --calls--> `sha256()`  [EXTRACTED]
  scripts/source-scan.mjs → scripts/lib/catalog.mjs
- `main()` --calls--> `readJson()`  [EXTRACTED]
  scripts/source-scan.mjs → scripts/lib/catalog.mjs

## Import Cycles
- 2-file cycle: `src/catalog.ts -> src/data.ts -> src/catalog.ts`

## Communities (22 total, 2 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (82): catalog, compactOperation(), fields, findFieldFact(), getCanonicalField(), getCanonicalProfile(), getFieldFact(), getProfile() (+74 more)

### Community 1 - "common.cjs"
Cohesion: 0.06
Nodes (60): { collect, resolveWikiLink, kind }, connections(), fs, path, { repoRoot, slash, hasSymlinkComponent, atomicWrite }, { discover }, fs, main() (+52 more)

### Community 2 - "on-merge-sync.cjs"
Cohesion: 0.07
Nodes (61): main(), fs, { key: githubRefKey }, { loadPolicy, policyProblems }, main(), path, {
  repoRoot,
  walk,
  slash,
  digest,
  hasSymlinkComponent,
}, { spawnSync } (+53 more)

### Community 3 - "audit-plan-candidates.cjs"
Cohesion: 0.12
Nodes (33): audit(), branchIssueNumbers(), classify(), distinctiveTitleWords(), { execFileSync }, extractPaths(), findPrForMergeSubject(), fmtCommit() (+25 more)

### Community 4 - "catalog.mjs"
Cohesion: 0.13
Nodes (24): catalogJson, catalogManifest, check, expected, extra, files, managed, canonicalSuffix() (+16 more)

### Community 5 - "viewer.js"
Cohesion: 0.19
Nodes (25): addMetaLink(), addMetaRow(), addRelationship(), applyView(), buildIndexes(), buildLegend(), buildModel(), buildRenderer() (+17 more)

### Community 6 - "routing.cjs"
Cohesion: 0.15
Nodes (24): adjacency(), edgeCost(), edgeKey(), edgeType(), EVIDENCE_TYPE_PRIORITY, formatBytes(), formatGithubRef(), fs (+16 more)

### Community 7 - "validate.mjs"
Cohesion: 0.09
Nodes (22): buildEvidenceLocatorIndex(), uniqueMap(), validateProfileEvidence(), agentProfiles, ajv, authorities, enumerationRoles, fieldIds (+14 more)

### Community 8 - "source-scan.mjs"
Cohesion: 0.17
Nodes (23): canonicalize(), json(), allOccurrences(), argument(), classifyObservation(), compileDiscoveryPattern(), decodeHtml(), discoverObservedTokens() (+15 more)

### Community 9 - "archive-plan.cjs"
Cohesion: 0.09
Nodes (40): { archive, validateArchiveInput, STATUSES }, fs, { inferPlanDate }, main(), parse(), path, { repoRoot }, archive() (+32 more)

### Community 10 - "reconcile-merges.cjs"
Cohesion: 0.18
Nodes (17): remoteSlug(), collectPulls(), copyWikiForDryRun(), { execFileSync }, flattenPages(), fs, githubRequest(), isWikiBotPull() (+9 more)

### Community 11 - "check-release-commit.selftest.cjs"
Cohesion: 0.20
Nodes (12): git(), readReleaseCommits(), assert, { execFileSync }, fs, os, path, {
  readReleaseCommits,
  validateReleaseCommit,
  validateReleaseCommits,
} (+4 more)

### Community 12 - "source-review.mjs"
Cohesion: 0.18
Nodes (12): all, allowManual, applicability(), byId, enrichExisting(), existing, lock, lockEntry() (+4 more)

### Community 13 - "check-context-budget.mjs"
Cohesion: 0.18
Nodes (9): budget, budgetPath, configuredNames, errors, fixtureNames, fixtures, observed, root (+1 more)

### Community 14 - "serve-graph.cjs"
Cohesion: 0.24
Nodes (9): createServer(), fs, http, listen(), main(), path, { repoRoot, ensureInside }, resolveRequest() (+1 more)

### Community 15 - "validate_pr_body.cjs"
Cohesion: 0.39
Nodes (8): fs, main(), readableText(), REQUIRED_CHECKS, REQUIRED_SECTIONS, sections(), validatePullRequestBody(), withoutComments()

### Community 16 - "semantic-release-notes.cjs"
Cohesion: 0.46
Nodes (7): classify(), clean(), compareText(), generateNotes(), GROUPS, plural(), renderEntry()

### Community 17 - "verify-packed-consumer.mjs"
Cohesion: 0.38
Nodes (5): findCanonicalId(), firstCanonicalId(), jsonFilesBelow(), PROFILES, root

### Community 18 - "readJson"
Cohesion: 0.60
Nodes (5): readJson(), argument(), main(), renderScanSummary(), shortList()

## Knowledge Gaps
- **145 isolated node(s):** `check`, `catalogJson`, `files`, `catalogManifest`, `managed` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `key()` connect `on-merge-sync.cjs` to `index.ts`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `validateConfigObject()` connect `index.ts` to `on-merge-sync.cjs`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `repoRoot()` connect `on-merge-sync.cjs` to `common.cjs`, `audit-plan-candidates.cjs`, `archive-plan.cjs`, `reconcile-merges.cjs`, `serve-graph.cjs`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `check`, `catalogJson`, `files` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06292134831460675 - nodes in this community are weakly interconnected._
- **Should `common.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05698778833107191 - nodes in this community are weakly interconnected._
- **Should `on-merge-sync.cjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07372229760289462 - nodes in this community are weakly interconnected._