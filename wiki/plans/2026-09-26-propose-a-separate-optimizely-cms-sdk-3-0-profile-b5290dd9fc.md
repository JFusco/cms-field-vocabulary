---
status: "implemented"
executed: true
evidence: ["path:sources/profiles/optimizely-saas.sdk-3.json", "test:pnpm run verify:ci"]
source_tool: "codex"
source: "Codex follow-up plan for issue JFusco/cms-field-vocabulary#58"
topics: ["catalog-authority", "official-source-freshness"]
digest: "b5290dd9fc84622eeb76394b552d22fd13e5dc49f2f30e453d3af5b45e5a9895"
---

# Propose a separate Optimizely CMS SDK 3.0 profile

Issue JFusco/cms-field-vocabulary#58 contains a stable SDK 3.0 release identity. Pin a new `optimizely-saas.sdk-3` profile to the official release commit. Preserve the SDK 2.2.0 profile and existing consumer routing. Carry forward only the 14 native property types confirmed by the SDK 3.0 documentation, record its new rich-text default and mandatory content-relationship constraints, refresh generated catalog output, and run the full quality and packed-consumer gates. Open a draft pull request for maintainer review.
