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
- A release index must also resolve to its registered document. A redirect whose final origin and path differ from the registered URL, ignoring a trailing slash and query string, is `unreachable`. Before this guard, an in-host redirect from the SaaS page to the CMS 12 page would have been observed as SaaS content with valid CMS 12 entry identities.

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
- `october-30`: saves now enforce nesting limits (inline blocks 8 levels, Visual Builder layouts 4, JSON property values 8, REST request bodies 64). CMS-57992 stops applying `required` to single block properties but keeps it on block lists. CMS-57293 fixes rich text over 255 characters missing from inline blocks loaded in batches. No impact. The official [content-types reference](https://docs.optimizely.com/cms-saas/docs/content-types-saas) already documents these depth limits. They constrain values without adding a token or changing a value, storage or delivery shape, and the profiles make no depth or `required` claim.
- `september-14`: an experience can hold several compositions. Administrators add a composition property in Settings > Content Types, choose an Outline or Grid layout type, and restrict accepted content types. CMS-55291 adds full CSS property names to rich-text JSON delivered to Graph. CMS-54849 and CMS-52979 fix DateTime display and the `formsElementEnabled` composition behavior. No evidenced impact. The entry names no REST property type token or value shape. On October 31 the cited content-types reference still listed exactly the 13 profile tokens, with no composition type, so no token is inferred. Layout composition stays an experience-level structure, and `compositionBehaviors` is a type-level setting. The rich-text change adds style names inside the same JSON shape. If Optimizely documents a native composition property type, it needs its own focused profile change.
- `october-7`: REST API scopes, file sanitization, indexing speed, category fallback names, and composition order in Visual Builder. No impact.
- `september-22`: experience preview, and a block list referencing a missing content type now returns a validation error. No impact. This is error handling, not a shape change.
- `august-31`: categories are indexed into Graph as `_itemMetadata.categories` and `_TaxonomyTerm`. The REST OpenAPI 3.1 specification lists former strict enum values as examples, and the entry states runtime behavior is unchanged. No impact. Categories are item metadata, not a property type. The API profile's tokens come from the content-types reference, not an OpenAPI enum.
- `august-7`: creating content from a blueprint, form step rules, Graph `item` queries for CMS assets in a content reference, and TinyMCE link indexing. No impact. These fixes restore documented behavior.
- `july-15`: property filters in Content Manager, form submission columns, read-only block lists, and strict REST number handling (CMS-53094). No impact. Strict number handling matches the integer and float value kinds.
- `may-5`: JavaScript SDK general availability summary. No impact. The pinned SDK profiles record the SDK contracts.
- `april-21`, `february-3`, `january-27`, `june-23`: DAM picker, external content sources, read-only mapped properties, Mark tools, and editor fixes for Content Area, ContentReference and XhtmlString. No impact. These are editor, integration and tooling changes.
- Mark agents, analytics, forms, Graph and REST API administration, security, and bug-fix entries make no field-vocabulary claim. The bug fixes restore documented behavior. This covers every other SaaS identity.

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
- `october-301351` (13.5.1): Graph no longer indexes fallback versions for languages with no content and no global fallback language. No impact. This is language indexing, not a property shape.
- `october-291340` (13.4.0 MCP): Opti ID sign-in for the MCP server. No impact.
- `september-91313` (13.1.3): CMS-53287 lets Graph `item` queries return CMS assets in a content reference field. CMS-54881 honors `[AllowedTypes]` in the block type dialog. CMS-55218 persists `PropertyList<T>` items containing XhtmlString. CMS-55298 indexes rich text nested past the configured maximum depth as HTML only. No impact. The admin Content Reference delivery claim distinguishes specific and Any reference types, and this fix does not change that distinction. The other fixes restore documented editor behavior. The profiles make no rich-text Graph delivery claim.
- `september-211320` (13.2.0): CMS-55319 fixes creating typed block lists (`IList<TBlock>`) through the CMS REST API. No impact. This restores documented behavior, and these profiles claim no REST wire shape.
- `october-51330`, `october-261341`, `october-261342`, `october-271350`, `april-221302`, `august-211312`: DAM migration, mapped-property validation, culture-specific value loss, inline block and content-area editor fixes, and composition cache keys. No impact. These fixes restore documented behavior.
- `may-221300`, `august-211311`, `august-281312`, `september-231331`: CMS 13 Mark tools for content types, compositions and content areas. No impact. Tool payloads are not native field types.
- Other CMS Core fixes (13.0.1 through 13.5.1), Forms, Mark tools, Language Manager, MA connectors, DXP, and the duplicated JavaScript SDK entries: no field-vocabulary claim.

None of these 2026 entries contradicts a structured claim in the seven listed profiles, so no profile change is proposed. The October 31 review re-read every dated entry on all three pages, including the entries published after the first proposal. The same scan found unrelated `version-changing` release-index drift for other vendors and for `optimizely-saas.sdk-releases-index`. That drift is out of scope here. The Optimizely source-lock observations need maintainer acceptance before merge.

The October 30 response bindings (SaaS raw `e9ee9a01…`, CMS 12 raw `5b4379b7…`, CMS 13 raw `d04bdddf…`, CMS 13 fragment `93da716e…`) are superseded below. They predate the redirect guard and the `october-30` and `october-301351` entries.

<!-- office-source-amendment-evidence:v1 -->
## Source amendment evidence

These three proposed response bindings require independent source review and QA. This ledger does not accept a baseline or declare any new claim to have no impact.

| Source | Observed at (UTC) | Identities | Raw SHA-256 | Normalized SHA-256 | Fragment SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `optimizely-saas.release-notes-index` | 2026-10-31T18:09:02.303Z | 33 | `32394707896f1ff10543de99db946cad93161cf3d931294a5571fff0a048cb23` | `3cadd938ffe81b27a3015e235838851f309beac0c9813b6f06dde71318312d35` | `913b3fd6f0da1956e4b97ebec1434decb10b57744dbf8bda89e0091a62ed02b1` |
| `optimizely-paas.release-notes-index` | 2026-10-31T18:09:03.867Z | 52 | `a400a84ad653ceefefeab4305488f40028932e46e29386d023ae822900560a5a` | `03776faa51989e7b74f6f110b45d86a1087136654e5772db8975db6480433278` | `bac88f723394fb1f7a66c238b926825b7d41a356ed6e33a3d2814a48d5d2d6e8` |
| `optimizely-paas.cms13-release-notes-index` | 2026-10-31T18:09:05.268Z | 44 | `925eebc44c6f2f876b24945d9c503a7364cd921a73520707725bbd75237596ba` | `aed259c7051f60574f27ec11b8df993e06ad2483d349c775a43ce7250d59b4d2` | `d4addda65fad9cc531e6901bff59f441aa471f1b0aaa0be4640b5a9042e1b406` |

Identity changes relative to the original proposal are inventory evidence; their claim applicability remains an independent review obligation.

| Source | Added identities | Removed identities |
| --- | --- | --- |
| `optimizely-saas.release-notes-index` | `october-30` | none |
| `optimizely-paas.release-notes-index` | none | none |
| `optimizely-paas.cms13-release-notes-index` | `october-291340`, `october-301351` | none |
<!-- /office-source-amendment-evidence:v1 -->
