---
aliases: [vendor documentation drift, source lock, provenance, freshness automation]
---
# Official-source freshness

Freshness automation detects changes in official vendor documentation while preserving reviewed vocabulary as a human-approved record.

## Current state

- `sources/official-sources.json` declares official URLs, product and profile applicability, source roles, extraction locators, exact token sets, version mode, and allowed redirect hosts.
- `sources.lock.json` records reviewed URLs, timestamps, raw and normalized fingerprints, token-set fingerprints, reachability, and manual-review notes.
- The catalog currently binds 52 reviewed official sources to 16 surface-specific profiles and 263 exact native field facts.
- Exhaustive enumeration sources use schema-v2 structural discovery regions. Their independently observed token sets are hashed separately from the required evidence tokens, so a vendor-added or vendor-removed native type is detectable without first teaching the scanner that token.
- Rolling WordPress handbook pages remain registered as supplemental documentation, while the Core 7.1 facts resolve to immutable official Core and bundled Gutenberg revisions.
- Daily runs scan release indexes; weekly and manual full runs inspect all declared sources and upload evidence outside the checkout.
- Drift is classified as unchanged, cosmetic, claim-changing, enumeration-changing, version-changing, unreachable, or removed.
- Actionable drift creates or updates a source-specific issue. Raw-only cosmetic churn remains in the uploaded report without creating issue noise. Automation cannot add, rename, or remove field types and cannot publish a release.

## Decisions

- Rolling SaaS documentation uses observation dates and fingerprints; pinned products and SDKs retain exact versions or commits.
- Missing exact native tokens fail review rather than being accepted as implied by an overview page.
- When an exact official page blocks automated review, replacement history records that URL and the immutable official vendor-repository source used for the reviewed claim set.
- Vendor outages retain the last reviewed snapshot and are surfaced as unreachable.
- Approved facts flow into [catalog authority](./catalog-authority.md); release policy is tracked in [release operations](./release-operations.md).
