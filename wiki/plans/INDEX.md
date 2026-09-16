# Plan ledger

Executed-plan bodies are archived beside this file. Every historical candidate remains represented here after audit, including candidates that were not implemented or were outside this repository.

| Date | Plan | Status | Evidence | Topics |
| --- | --- | --- | --- | --- |
| 2026-09-01 | [Phase 1 — Deterministic `cms-field-vocabulary@1.0.0`](./2026-09-01-phase-1-deterministic-cms-field-vocabulary-1-0-0-2353c85cd0.md) | implemented | commit:d16ab568514c80e9904c5923303f399912b42805; workflow:33627334843; npm:cms-field-vocabulary@1.0.0; github-release:v1.0.0 | catalog-authority, structured-rendering-operations, deterministic-consumer-projection, official-source-freshness, release-operations <!-- plan:2353c85cd0edfc24f992d312e15775bef12cf0194128db2d62bc3ce8f00e883d --> |
| 2026-09-16 | [Review September vendor drift and clear dependency PRs](./2026-09-16-review-september-vendor-drift-and-clear-dependency-prs-ec96a10600.md) | implemented | issues:JFusco/cms-field-vocabulary#34,#35,#39; path:sources.lock.json; path:commitlint.config.cjs; test:pnpm run verify:ci; test:pnpm run test:packed; scan:index exit 0 | official-source-freshness, release-operations <!-- plan:ec96a10600470cfa9fcb3924ec2ea6a23d377bacfcdc04441b572accaf426d5d --> |
| 2026-09-16 | Canonicalize and Harden GitHub Issue Creator | out-of-scope | Plan explicitly targets JFusco/qa-team and /Users/joe.fusco/Projects/qa-team; shared wiki script names caused a false repository association | — <!-- plan:f56df740b6e76c21f9842b11677ce462511dd02b439b9389962e24c121f561f3 --> |
| 2026-09-16 | [Remove wiki-sync read:org dependency](./2026-09-16-remove-wiki-sync-read-org-dependency-c033b010ae.md) | implemented | workflow:35106364356; workflow:35106595007; workflow:35106800553; workflow:35107038819; path:.github/workflows/wiki-sync.yml | release-operations <!-- plan:c033b010aef93bcc40176e88751036983fadc9ca11ba11cd89826f5023025815 --> |
| 2026-09-16 | [Suppress package releases for wiki-only reconciliation](./2026-09-16-suppress-package-releases-for-wiki-only-reconciliation-51f3eae0c0.md) | implemented | path:.github/workflows/wiki-sync.yml | release-operations <!-- plan:51f3eae0c076e0393bc6a8620243a6da496cc3d5559f6acd1e30e936dd3a2967 --> |
<!-- wiki-plan-rows -->
