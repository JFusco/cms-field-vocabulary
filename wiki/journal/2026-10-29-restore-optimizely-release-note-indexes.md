---
topics: [official-source-freshness]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/91'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/91']
---
# Restore Optimizely release-note indexes

The registered support-center sections for `optimizely-saas.release-notes-index` and `optimizely-paas.release-notes-index` no longer list release articles. Earlier scans saw them redirect off the official host allowlist, and on October 29 they redirected to the generic `docs.optimizely.com` documentation landing pages. Optimizely now publishes the current-year notes on three official pages: [CMS SaaS](https://docs.optimizely.com/cms-saas/release-notes), [CMS 12](https://docs.optimizely.com/cms-12/release-notes), and [CMS 13](https://docs.optimizely.com/cms-13/release-notes). Each page records entries under dated headings, not as article links.

## Registration

- `optimizely-saas.release-notes-index` keeps its ID and profiles and moves to the CMS SaaS page. `docs.optimizely.com` is its only allowed host.
- `optimizely-paas.release-notes-index` keeps its ID and moves to the CMS 12 page. It now applies only to `optimizely-paas.cms12-property-data-type` and `optimizely-paas.cms12-model`.
- The new `optimizely-paas.cms13-release-notes-index` covers the CMS 13 page for `optimizely-paas.cms13-admin` and `optimizely-paas.cms13-model`.
- All three sources extract identities from dated `h2`/`h3` heading IDs, for example `october-21` or `october-271350`. Replacement history records the two retired support-center URLs.
- If a release-index page returns no entry identities, the scanner now reports it as `unreachable` instead of observing it as source content. This covers sign-in pages and unrelated in-host redirects. The allowlist still rejects off-host redirects.

The October 29 observations below are retained as historical proposals. Their metadata alone does not establish retained same-response body evidence; the amendment ledger records the current response binding.

| Source | Identities | Fragment fingerprint | Raw fingerprint |
| --- | --- | --- | --- |
| `optimizely-saas.release-notes-index` | 32 | `a690604186b8ef506173ea03805c784dc4e8cb1748212df0791c4505b9066abd` | `2ce44c99ec0ad01a7e7580c71c27a24fe9c152507f8ef279ee8c446c82bd34af` |
| `optimizely-paas.release-notes-index` | 52 | `bac88f723394fb1f7a66c238b926825b7d41a356ed6e33a3d2814a48d5d2d6e8` | `d5bbdae9a33a291028fe1ee3e9d57c2da3c746eb13f825bf80412d65117b9255` |
| `optimizely-paas.cms13-release-notes-index` | 42 | `cc0a39a0150a26e980e26ae708352f54bc24ed2b1c64e5a891a3656a78f063b4` | `1e9f741fcb2c9de4d511f907aea47582f709b39eadb5bac0cd7595b49f71a11c` |

A follow-up index scan matched all three fragments to the reviewed lock (`cosmetic`, raw markup only).

## Claim dispositions

Every field-relevant 2026 entry was compared with the affected profiles. Identities are the heading anchors on each page.

### CMS SaaS (`optimizely-saas.cms-api-v1`, `optimizely-saas.sdk-2`, `optimizely-saas.sdk-3`)

- `october-21`: Link, Link collection, and URL properties use the Content Manager picker, which can select DAM assets and connected-source content. No impact. This is picker scope; it adds no native token and changes no value or delivery shape. The profiles' link and URL editor claims remain accurate.
- `october-9`: a picked DAM rendition is stored on the property and delivered through Optimizely Graph. No impact. The entry documents no new token and no changed value, storage, or delivery shape.
- `september-24` (`@optimizely/cms-sdk` 3.0.0): `content` and `contentReference` require `contentType` or non-empty `allowedTypes`/`restrictedTypes`, rich text returns JSON by default, and properties gain `displayMode`. No impact. `optimizely-saas.sdk-3` already records the constraint and JSON default. `displayMode` controls editor visibility and is not a field type. The pinned 2.2.0 profile is unaffected.
- `july-23` (2.2.0) and `july-7` (2.1.0): `contentType` typing, the `displaySettings` editor type, `selectOne`, and contract allowed/restricted types. No impact. `optimizely-saas.sdk-2` is pinned to 2.2.0 and already lists `selectOne`.
- `june-8`: Content Reference List multi-select with item-limit feedback. No impact. This is consistent with the array list editor honoring count constraints.
- `may-18`: content type binding maps less capable property types to more capable ones, and Graph indexes the external DAM URL for LinkItem `url.default`/`url.hierarchical`. No impact. Binding mappings are not native types, and the URL fix corrects a value without changing the LinkItem delivery shape.
- `march-28`: select and dropdown choice values are validated against their options. No impact. This is consistent with constraint-refined string editors.
- `february-24` (contracts) and `february-13` (SDK GA, block property binding, nested block saves): no field-type or shape claim.
- Mark agents, analytics, forms, Graph and REST API administration, security, and bug-fix entries make no field-vocabulary claim. The bug fixes restore documented behavior.

### CMS 12 (`optimizely-paas.cms12-property-data-type`, `optimizely-paas.cms12-model`)

- CMS Core and CMS UI fixes in 12.23.x through 12.35.0, such as a ContentArea inside `PropertyCollection`, empty block-list references, XhtmlString link warnings, and the AllowedTypes description: no impact. These fixes restore documented behavior.
- `april-283127` and `january-203125` (Content Delivery API 3.12.x): empty references are filtered from `IList<ContentReference>`, and LinkItem remaining-URL encoding is fixed. No impact. The profiles claim no Content Delivery API delivery shape.
- `april-10220` and `april-27221` (CMP DAM 2.2.x): multi-asset selection for Content Area and ContentReferenceList, with item limits. No impact. This is editor UX only.
- TinyMCE 5.0.4, Forms, connectors, DXP, Reporting, Image Library, and Language Manager entries make no field-vocabulary claim.

### CMS 13 (`optimizely-paas.cms13-admin`, `optimizely-paas.cms13-model`)

- `october-151340`: DAM rendition selection for single-item image properties. No impact. This is editor UX with no new token.
- `june-11310`: external-content property mappings expand, LinkItem DAM URLs are indexed in Graph, and `VisibleInMenu` joins the Graph schema. No impact. Mappings are already recorded as behavior, `VisibleInMenu` is page metadata rather than a property type, and the LinkItem delivery shape is unclaimed.
- `april-91301`: **Create a new block** in content areas defaults to inline blocks. No impact. The Content Area editor claim remains accurate.
- `july-301311`: Graph C# SDK field-name mappings. No impact. This is SDK configuration, not a field type.
- `august-191300`: Content Delivery API 13.0 uses `System.Text.Json` and `/api/episerver/v4.0`. No impact on these profiles, which claim no Content Delivery API delivery shape.
- Other CMS Core fixes (13.0.1 through 13.5.0), Forms, Mark tools, Language Manager, MA connectors, DXP, and the duplicated JavaScript SDK entries: no field-vocabulary claim.

None of these 2026 entries contradicts a structured claim in the seven listed profiles, so no profile change is proposed. The same scan found unrelated `version-changing` release-index drift for other vendors and for `optimizely-saas.sdk-releases-index`. That drift is out of scope here. The Optimizely source-lock observations need maintainer acceptance before merge.

<!-- office-source-amendment-evidence:v1 -->
## Source amendment evidence

These three proposed response bindings require independent source review and QA. This ledger does not accept a baseline or declare any new claim to have no impact.

| Source | Observed at (UTC) | Identities | Raw SHA-256 | Normalized SHA-256 | Fragment SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `optimizely-saas.release-notes-index` | 2026-10-30T08:00:20.308Z | 32 | `e9ee9a01d05853f7525041fd26230bc6bf23fb55cfde6f9471bf522101d03486` | `e266f35b8c6049f7aa057b743d42bffd0876a74e0ee890d32cf336d45f76a9f0` | `a690604186b8ef506173ea03805c784dc4e8cb1748212df0791c4505b9066abd` |
| `optimizely-paas.release-notes-index` | 2026-10-30T08:00:20.341Z | 52 | `5b4379b7f1a7322b67f4a2ecf8592cbe9dccec7261d046041c139a673c0dc2fa` | `e3f09038b645437e522bed1477dd0536fb691822e001b46e9f30c798ca927669` | `bac88f723394fb1f7a66c238b926825b7d41a356ed6e33a3d2814a48d5d2d6e8` |
| `optimizely-paas.cms13-release-notes-index` | 2026-10-30T08:00:20.342Z | 43 | `d04bdddf6ed9461dee8f42bcc338c2b4fc964553bf876baffe00e7553a4e6ee4` | `c6b05e68abf5265dc686f6acede53e1ebdd7ee77e660cdf691d6bee1f2a821d6` | `93da716e5ff1f279df3577396ff98a7d03fc566a27aee7eaddf184f3d2bb30cc` |

Identity changes relative to the original proposal are inventory evidence; their claim applicability remains an independent review obligation.

| Source | Added identities | Removed identities |
| --- | --- | --- |
| `optimizely-saas.release-notes-index` | none | none |
| `optimizely-paas.release-notes-index` | none | none |
| `optimizely-paas.cms13-release-notes-index` | `october-291340` | none |
<!-- /office-source-amendment-evidence:v1 -->
