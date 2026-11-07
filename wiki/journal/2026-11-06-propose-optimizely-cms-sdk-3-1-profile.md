---
topics: [catalog-authority, official-source-freshness]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/112'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/112']
---
# Propose Optimizely CMS SDK 3.1 profile

The October 20 release-index scan found the prerelease `@optimizely/cms-sdk@3.1.0-beta.0`, so no profile was proposed then. Stable [`@optimizely/cms-sdk@3.1.0`](https://github.com/episerver/content-js-sdk/releases/tag/%40optimizely/cms-sdk%403.1.0) was published on 2026-11-03 and is npm `latest`. Its tag resolves to source commit `bf3ad005aa4e6942c2fcc48348d439f31a7e8076`.

The stable release keeps both beta field claims. Media `contentReference` values resolve `item` during the page request, and `content` properties reject `contentType` in types and `config push`. Release `3-modelling.md` was replaced by `docs/reference/property-types.md`, which still lists the same 14 native property types. The shipped `queryUtils.ts` and `properties.ts` agree with the changelog. One paragraph in the reference page still says a reference fetches only key and URLs, which contradicts the changelog and the source, so the media-resolution claim cites the pinned changelog.

The proposed `optimizely-saas.sdk-3-1` profile pins both documents to that commit. It preserves the 3.0.0 and 2.2.0 profiles and all consumer routes. The release-index observation is not accepted; only its profile applicability changes. Generated catalog and documentation were rebuilt from source for maintainer review in a draft pull request.
