---
status: "implemented"
executed: true
evidence: ["sources/official-sources.json, sources.lock.json, catalog/manifest.json, issue JFusco/cms-field-vocabulary#94"]
source_tool: "repository"
source: "/private/tmp/cms-vendor-drift-20261012/optimizely-field-doc-plan.md"
topics: ["official-source-freshness"]
digest: "e45c9097f99a1020be091eb765e26e7927b98118a6514cb96c1f078f8e746f12"
---

# Restore Optimizely field-documentation scans

1. Verify the eleven registered Optimizely CMS field guides now redirect to official `docs.optimizely.com` pages.
2. Limit each affected source's redirect allowlist to the old and new official hosts; update the CMS SaaS field-token extractor for the new markup.
3. Compare each observed locator with the reviewed lock and structured profiles. Propose new lock fingerprints without changing field facts or consumer routing.
4. Rebuild generated catalog output, record the review in the context wiki, run the repository gates, and open a draft PR linked to issue #94.
