---
status: "partial"
executed: true
evidence: ["path:.github/workflows/vendor-doc-freshness.yml", "test:pnpm run verify:ci"]
source_tool: "codex"
source: "Codex plan: Make vendor drift alerts actionable"
topics: ["official-source-freshness"]
digest: "f5febea181032200d0f18209c6c04e924898aebc3a62a87110e064080488f80d"
---

# Make vendor drift alerts actionable

The checkout is clean. Local `main` is behind `origin/main`; update it while preserving the current branch.

- Triage all eight vendor-drift issues against scan artifacts and official sources. Propose a separate SDK 3.0 profile for the Optimizely release in issue #58; preserve SDK 2.2.0.
- Make the scan summary show official URLs, affected profiles, changed release identities, and observation fingerprints. Keep automatic GitHub issues for scanner or checkout-integrity failures.
- Run a daily Codex project task after scans. It reviews official evidence, opens focused draft pull requests for supported changes, links issues, and proposes separate profiles for evidenced major versions. Human review accepts observations before merge.
- Close no-impact issues with evidence and change-related issues after linked pull requests merge. Avoid recreating issues for previously reviewed observations.
- Verify the source scan behavior and repository quality gates, then update the context wiki in the same delivery.
