---
status: "implemented"
executed: true
evidence: ["path:sources/profiles/sitecore-ai.authoring.current.json", "path:sources.lock.json", "test:node --test tests/catalog-contract.test.mjs"]
source_tool: "codex"
source: "issue-56-triage-2026-09-26"
topics: ["catalog-authority", "official-source-freshness"]
digest: "119fff380e3fb895317dfb16728565112c9ef37d3c8274db75e889e2db795a6d"
---

# Complete the SitecoreAI authoring list-field vocabulary

1. Confirm the exact labels for the four missing list fields in Sitecore's current authoring documentation.
2. Add those labels to `sitecore-ai.authoring.current`, register exact source tokens, and review the official source observation.
3. Regenerate the catalog, verify the profile and source lock, and open a focused PR tied to issue 56.
