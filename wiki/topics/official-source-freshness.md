---
aliases: [vendor documentation drift, source lock, provenance, freshness automation]
---
# Official-source freshness

Freshness automation detects changes in official vendor documentation while preserving reviewed vocabulary as a human-approved record.

## Current state

- `sources/official-sources.json` declares official URLs, product and profile applicability, source roles, extraction locators, exact token sets, version mode, and allowed redirect hosts.
- `sources.lock.json` records reviewed URLs, timestamps, raw and normalized fingerprints, token-set fingerprints, reachability, and manual-review notes.
- The catalog currently binds 54 reviewed official sources to 17 surface-specific profiles and 281 exact native field facts.
- Exhaustive enumeration sources use schema-v2 structural discovery regions. Their independently observed token sets are hashed separately from the required evidence tokens, so a vendor-added or vendor-removed native type is detectable without first teaching the scanner that token.
- Rolling WordPress handbook pages remain registered as supplemental documentation, while the Core 7.1 facts resolve to immutable official Core and bundled Gutenberg revisions.
- Daily runs scan release indexes; weekly and manual full runs inspect all declared sources and upload evidence outside the checkout.
- Drift is classified as unchanged, cosmetic, claim-changing, enumeration-changing, version-changing, unreachable, or removed.
- The scanner uploads a readable source-by-source summary with changed release identities, affected profiles, and observation fingerprints. Ordinary drift does not create a generic issue; scanner failures and checkout mutations do.
- A Monday Codex task reviews the weekly full scan and intervening daily observations against official sources and may prepare a focused draft pull request linked to an actionable issue. A maintainer accepts source observations and reviews the draft before merge. The scanner cannot add, rename, or remove field types and cannot publish a release.

## Decisions

- Rolling SaaS documentation uses observation dates and fingerprints; pinned products and SDKs retain exact versions or commits.
- Release-index drift advances the reviewed identity window only after a full scan confirms that claim and enumeration sources remain stable. Discovering a prerelease does not silently migrate a pinned SDK profile.
- A stable major release with official field evidence is proposed as a separate versioned profile; it does not replace an older pinned SDK profile or change consumer routing by default.
- Close a no-impact drift issue with a recorded finding and a stable observation fingerprint. Close a change issue after its linked review pull request merges; keep uncertain findings open with a specific verification need.
- Missing exact native tokens fail review rather than being accepted as implied by an overview page.
- Supplemental field tables declare each authoring label used as exact native-token evidence; the SitecoreAI list-field observation was refreshed when four additional labels were registered.
- The SitecoreAI base image 1.10.13 Droplist fix is recorded as an authoring editor claim: selected-value comparison is case insensitive. It does not change the native field identity or Content SDK delivery shape.
- When an exact official page blocks automated review, replacement history records that URL and the immutable official vendor-repository source used for the reviewed claim set.
- Vendor outages retain the last reviewed snapshot and are surfaced as unreachable.
- Optimizely field-documentation redirects to `docs.optimizely.com` are scoped to the eleven registered CMS SaaS, CMS 12, and CMS 13 sources. A markup move requires the exhaustive SaaS field-token extractor and the proposed source-lock observations to be reviewed together; the redirect or a changed fragment hash alone does not change a field fact.
- The CMS 13 Content property guide explicitly documents typed Content Reference selection through global contracts and distinct Optimizely Graph results for typed versus Any references. A focused draft proposes these claims for `optimizely-paas.cms13-admin`; connected external property mappings describe behavior, not another native property label. The other ten Optimizely field-guide observations remain separate review work in issue #100.
- The CMS 13 Content property note that Content Reference is the only Content Type option available for elements qualifies the admin editor behavior for Content Area, Content Area Item, and Content Reference. The scanner fragment for that source excludes the note, so the claim relies on supplemental full-page evidence and does not change the reviewed lock.
- The CMS SaaS content-types page documents `url` as a string and `content` as inline or referenced composition, with `restrictedTypes` taking priority over `allowedTypes`. The API profile withdraws its unsupported Content value and storage shapes rather than inferring a REST wire mapping; issue #115 tracks this focused correction from the issue #100 review.
- Approved facts flow into [catalog authority](./catalog-authority.md); release policy is tracked in [release operations](./release-operations.md).
