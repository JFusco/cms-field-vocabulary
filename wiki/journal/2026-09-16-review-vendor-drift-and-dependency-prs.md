---
topics: [official-source-freshness, release-operations]
plans: [2026-09-16-review-september-vendor-drift-and-clear-dependency-prs-ec96a10600.md]
---
# Review vendor drift and dependency pull requests

Issues [JFusco/cms-field-vocabulary#34](https://github.com/JFusco/cms-field-vocabulary/issues/34), [#35](https://github.com/JFusco/cms-field-vocabulary/issues/35), and [#39](https://github.com/JFusco/cms-field-vocabulary/issues/39) reported version-changing release-index windows for SitecoreAI, Contentstack, and the Optimizely SaaS SDK. The latest workflow evidence showed a clean checkout, and a fresh full scan found no claim-changing or enumeration-changing source. All non-index sources were unchanged or cosmetic-only.

The release entries were reviewed against the affected profiles. Contentstack's query-limit, identity-provider, CLI, and bulk-action changes do not alter its management field vocabulary. Sitecore Content SDK 2.4 adds search, `llms.txt`, and generated metadata features without changing the catalogued field identities or rendering shapes. Optimizely published `@optimizely/cms-sdk@3.0.0-beta.0` with behavior changes, but the catalog profile is deliberately pinned to stable SDK 2.2.0; the prerelease therefore does not widen or migrate that profile.

Only the three reviewed release-index observations in `sources.lock.json` were refreshed. `catalog/catalog.json` and `catalog/manifest.json` were regenerated from source so their digests bind the new reviewed lock. No source profile, schema, native field fact, or test expectation changed.

Dependency pull requests [#37](https://github.com/JFusco/cms-field-vocabulary/pull/37), [#38](https://github.com/JFusco/cms-field-vocabulary/pull/38), and [#36](https://github.com/JFusco/cms-field-vocabulary/pull/36) were merged. PR #36 exposed a mismatch between Dependabot's valid grouped-update subject and the inherited 50-character subject limit. `commitlint.config.cjs` now preserves the shared rules while allowing 100-character subjects under the existing 120-character header limit; the exact previously failing Dependabot title passes.

Verification evidence: `pnpm run verify:ci`, `pnpm run test:packed`, and a post-review live index scan all passed. The index scan reported only unchanged or cosmetic observations, so the three attention issues can close after this review change merges.
