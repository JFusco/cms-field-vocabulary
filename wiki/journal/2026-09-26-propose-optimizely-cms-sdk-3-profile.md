---
topics: [catalog-authority, official-source-freshness]
plans: [2026-09-26-propose-a-separate-optimizely-cms-sdk-3-0-profile-b5290dd9fc.md]
issue: "https://github.com/JFusco/cms-field-vocabulary/issues/58"
---
# Propose Optimizely CMS SDK 3.0 profile

The September 25 release-index scan found stable `@optimizely/cms-sdk@3.0.0`. Its [official release notes](https://github.com/episerver/content-js-sdk/releases/tag/%40optimizely/cms-sdk%403.0.0) identify breaking content-relationship validation and a JSON-only default rich-text query. The immutable release tag resolves to source commit `c771d824f2328e1a51c111b61b9853141fa66333`. Its modelling document independently enumerates the same 14 native property types as SDK 2.2.0.

The proposed `optimizely-saas.sdk-3` profile pins that source, preserves the 2.2.0 profile and all consumer routes, and describes the changed rich-text and relationship behavior. The 2.2.0 format refinements were not copied because the SDK 3.0 modelling document does not substantiate them. Generated catalog and documentation were rebuilt from source. The new reviewed observation is proposed for maintainer approval in a draft pull request.

Local verification: `pnpm run validate`, `pnpm run verify:ci`, and the SDK 3.0 token-discovery check passed. Packed-consumer verification and final wiki checks complete the review gate.
