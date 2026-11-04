---
status: "partial"
executed: true
evidence: ["renovate.json; scripts/is-pin-courier-pr.cjs; tests/pin-courier-pr.test.mjs; connected bot-PR proof pending"]
source_tool: "repository"
source: "/private/tmp/cms-renovate-131/.cache/renovate-migration-plan.md"
topics: ["release-operations"]
digest: "e0f20c8f55fb85fc195abb88953b6bce2375fd34b6483cf6a4406db3c1b402b7"
---

# CMS-first Renovate dependency maintenance

Deliver CMS issue #131 after the shared opt-in maintenance preset is merged.

1. Add the independent shared preset, preserving existing first-party consumers.
2. Add CMS's Monday npm and GitHub Actions policy with exact pins, grouped minor/patch updates, separate majors and no Renovate automerge.
3. Replace scheduled Dependabot configuration in the same cutover and preserve existing security settings.
4. Grant generated PR metadata exceptions only to the installed Pin Courier App on same-repository Renovate branches targeting main. Keep all source/package checks.
5. Run strict Renovate validation and read-only extraction, bot guard tests, release preflight, verify:ci, packed-consumer tests, package dry run and wiki checks.
6. Merge after reviewed checks pass, then verify central runner discovery and report the first eligible real PR as a separate operational gate. Do not accept field-profile or source-lock changes as part of this migration.

The central runner checks every six hours, so the Monday window covers the full Eastern day. At preflight, vulnerability alerts and Dependabot security-update PRs were already disabled; this migration does not change those settings.
