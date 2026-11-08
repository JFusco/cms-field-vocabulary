---
status: "implemented"
executed: true
evidence: ["scripts/semantic-release-analyzer.cjs", "tests/release-policy.test.mjs"]
source_tool: "repository"
source: "repository implementation checklist"
topics: ["release-operations"]
digest: "e03cb8ddea07239614e24c053a016ee3eb51bb853c3f3d147448d859f0107ecb"
---

# Harden publisher release maintenance

- Filter literal `[skip release]` from complete commit messages before official version analysis and notes generation; preserve existing release rules.
- Preserve tested revision, OIDC, preflight, provenance and packed-consumer checks.
- Give Dependabot zero routine-version PRs and marked maintenance commit metadata.
- Distinguish registry readiness, timeout and error; report partial notification delivery and support notification-only replay.
- Pin current release action versions to full SHAs; verify isolated release histories and normal release controls.
