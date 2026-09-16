---
status: "implemented"
executed: true
evidence: ["issues:JFusco/cms-field-vocabulary#34,#35,#39", "path:sources.lock.json", "path:commitlint.config.cjs", "test:pnpm run verify:ci", "test:pnpm run test:packed", "scan:index exit 0"]
source_tool: "codex"
source: "/private/tmp/cms-field-vocabulary-september-16-maintenance-plan.md"
topics: ["official-source-freshness", "release-operations"]
digest: "ec96a10600470cfa9fcb3924ec2ea6a23d377bacfcdc04441b572accaf426d5d"
---

# Review September vendor drift and clear dependency PRs

## Goal

Resolve the open vendor-documentation freshness issues and merge the repository's open dependency pull requests without weakening the field-vocabulary authority boundary.

## Work

1. Inspect every open pull request, its changed files, mergeability, and required checks; repair metadata-only failures and merge the validated updates.
2. Download the latest freshness evidence, compare release-index identities, run a full live official-source scan, and review the changed vendor releases against the affected profiles.
3. Update only reviewed source-lock observations when field enumerations and claim pages remain unchanged, then rebuild generated catalog digests.
4. Correct any repository automation defect discovered during triage and validate the exact previously failing case.
5. Run the complete quality, packed-consumer, freshness, and wiki checks and record the reviewed disposition in the repository wiki.

## Boundaries

- Do not widen a pinned SDK profile for a prerelease.
- Do not edit generated catalog files by hand.
- Do not change native field facts unless official claim or enumeration evidence requires it.
- Preserve Conventional Commit type and scope validation while accommodating legitimate automated dependency titles.
