---
topics: [official-source-freshness]
plans: [2026-10-12-restore-optimizely-field-documentation-scans-e45c9097f9.md]
issue: "https://github.com/JFusco/cms-field-vocabulary/issues/94"
---
# Restore Optimizely field-documentation scans

The [October 5 full scan](https://github.com/JFusco/cms-field-vocabulary/actions/runs/37374576621) marked eleven registered Optimizely field guides unreachable because their legacy `docs.developers.optimizely.com` URLs redirect to `docs.optimizely.com`. The redirect target is the Optimizely documentation site and each exact registered locator is readable there. The separate SaaS and PaaS release-note redirects still require [issue #91](https://github.com/JFusco/cms-field-vocabulary/issues/91).

The proposed source registration adds that host only for the eleven affected sources. The CMS SaaS page also changed HTML markup: its old `id="data-types"` and `<li><code>` extraction found no independently observed tokens after the redirect. The new bounded `Data types` list extractor finds the same thirteen native data types as the reviewed lock: `array`, `boolean`, `component`, `content`, `contentReference`, `dateTime`, `float`, `integer`, `json`, `link`, `richText`, `string`, and `url`. The remaining ten registered locators retained every required claim token. The existing SaaS API, SDK 2 and 3, CMS 12 model, CMS 13 model, and CMS 13 admin profiles still express their supported field identities and authoring claims; no profile or consumer route changes are proposed. Additional material elsewhere on the moved pages is not adopted as a new vocabulary claim by this redirect repair.

The following live observations are proposals in the draft PR's source lock. A refreshed fingerprint records the moved page and markup; it is not evidence by itself of a changed field contract.

| Official source ID | Registered locator | Resolved official page | Proposed fragment fingerprint |
| --- | --- | --- | --- |
| `optimizely-saas.content-types` | `Property types` | [CMS SaaS content types](https://docs.optimizely.com/cms-saas/docs/content-types-saas) | `73a9c61ceb704aa28bae58157d416d39627beb3dc3905e4ed96b05e09153c565` |
| `optimizely-paas.cms12-builtins` | `Common property types; Work with other content` | [CMS 12 built-ins](https://docs.optimizely.com/cms-12/docs/built-in-property-types) | `31b988ea3f146a72a50751530077152d969badc7a3b53cc8def1a8444379742f` |
| `optimizely-paas.cms12-property-attributes` | `Default backing types` | [CMS 12 property attributes](https://docs.optimizely.com/cms-12/docs/property-attributes) | `b17ef906e9ceb8495203d6e754dd58b741ca2215b27915628641da0460c12339` |
| `optimizely-paas.cms13-builtins` | `Common property types; Work with other content; ContentReference<T> property type` | [CMS 13 built-ins](https://docs.optimizely.com/cms-13/docs/built-in-property-types) | `3a7a6b9ed3f58dbc9eba12c0c6fb2af7b6d6812e6cd48280336d3abcb673709f` |
| `optimizely-paas.cms13-property-attributes` | `Available attributes; Default backing types` | [CMS 13 property attributes](https://docs.optimizely.com/cms-13/docs/property-attributes) | `c9028b941117c1152cb8c0c16491eb82edb244fb52cdb6030a267af360d92a10` |
| `optimizely-paas.cms13-develop-properties` | `Access properties on strongly typed content; Access properties on non-strongly typed content; Check null values in properties` | [CMS 13 property access](https://docs.optimizely.com/cms-13/docs/develop-properties) | `7d2c5d346b4f76632f5acf7ac87c14cf8486b35cceb6ee5399def87689722341` |
| `optimizely-paas.cms13-building-blocks` | `Property types and linked property-type pages` | [CMS 13 modeling](https://docs.optimizely.com/cms-13/docs/building-blocks-of-content-modeling) | `0e18a9c170c92a46183cded18129b34688a06836b45a8451f25c3e24ac5f8c91` |
| `optimizely-paas.cms13-choice-property` | `Configure Choice property > Choice Type` | [CMS 13 Choice](https://docs.optimizely.com/cms-13/docs/choice-property) | `4b0d0909ed5b071427e74f7c5c3d926834f55525ae596216f9a4619d382dc994` |
| `optimizely-paas.cms13-content-property` | `Configure Content property > Content Type` | [CMS 13 Content](https://docs.optimizely.com/cms-13/docs/content-property) | `71b8702b69b0050a6a8f294a84e1c97f849aaac04ecf43f37d43751232ab1565` |
| `optimizely-paas.cms13-link-property` | `Configure Link property > Link Type` | [CMS 13 Link](https://docs.optimizely.com/cms-13/docs/link-property) | `9410083986f6e8bc017a7418c343943a3e3da12bfaa1ff984533d0fdb8ae5c6a` |
| `optimizely-paas.cms13-text-property` | `Configure Text property > Text Type` | [CMS 13 Text](https://docs.optimizely.com/cms-13/docs/text-property) | `6ee9a07236935a15d7586b93d77174ffc18c32995ca2de7a2ab8f3c7f681a182` |

The source lock and catalog digests are regenerated as draft proposals for maintainer review. A post-review full scan reached all eleven official pages with no missing required or observed tokens and classified only cosmetic response changes at those sources. No package version, published release, or consumer routing changes follow from this repair.

Local verification passed: `pnpm run release:preflight`, `pnpm run verify:ci` (86 tests), `pnpm run test:packed`, `npm pack --dry-run --ignore-scripts` with a writable temporary npm cache, and the wiki graph/integrity checks. Full-history plan discovery could not read one oversized global Codex session file; the one-day recovery pass completed with no matched plan for this repository. The plan for this change is archived in this wiki delivery.
