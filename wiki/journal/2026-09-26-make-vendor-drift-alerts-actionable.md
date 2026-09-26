---
topics: [official-source-freshness]
plans: [2026-09-26-make-vendor-drift-alerts-actionable-f5febea181.md]
issues: ["https://github.com/JFusco/cms-field-vocabulary/issues/50", "https://github.com/JFusco/cms-field-vocabulary/issues/51", "https://github.com/JFusco/cms-field-vocabulary/issues/52", "https://github.com/JFusco/cms-field-vocabulary/issues/53", "https://github.com/JFusco/cms-field-vocabulary/issues/55", "https://github.com/JFusco/cms-field-vocabulary/issues/56", "https://github.com/JFusco/cms-field-vocabulary/issues/57", "https://github.com/JFusco/cms-field-vocabulary/issues/58"]
---
# Make vendor drift alerts actionable

The September vendor scan repeatedly commented on open issues with classification and run links but no source delta or proposed action. Its release-index classification means the selected feed identities changed; it does not itself prove a field-vocabulary change. The September 25 index artifact showed routine Contentstack, SitecoreAI, and WordPress index movement, and a stable Optimizely CMS SDK 3.0 release. The September 21 weekly full artifact showed three claim-fragment hash changes without missing required tokens. These require source review before changing claims.

The scan workflow now uploads a readable summary containing source URLs, locators, affected profiles, observation fingerprints, and added or removed release identities. It creates GitHub issues only for scanner or checkout-integrity failures. The separate Codex review task can turn official evidence into a focused draft pull request and a linked issue. Maintainers retain acceptance authority for source observations and merges. The Optimizely SDK 3.0 candidate is tracked in its own change to preserve the pinned SDK 2.2.0 profile.

The Codex review runs Mondays at 15:00 UTC after the weekly full scan and includes daily index observations since the previous review.

Local verification: the September 25 report rendered with identity deltas; `pnpm run verify:ci` passed with 80 tests. The eight legacy issues remain for evidence-based triage and disposition.
