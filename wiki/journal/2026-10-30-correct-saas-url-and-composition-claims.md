---
topics: [official-source-freshness]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/115'
issues:
  [
    'https://github.com/jfusco/cms-field-vocabulary/issues/115',
    'https://github.com/jfusco/cms-field-vocabulary/issues/100',
  ]
---
# Correct SaaS URL and composition claims

[Issue #115](https://github.com/JFusco/cms-field-vocabulary/issues/115) is the focused CMS SaaS correction identified by the Optimizely field-guide review in [issue #100](https://github.com/JFusco/cms-field-vocabulary/issues/100). It changes only the `optimizely-saas.cms-api-v1` profile (product Optimizely CMS SaaS, version CMS SaaS API v1, management surface, CMS API content-type property schema transport).

On 2026-10-30 at 02:34:59Z, `pnpm run sources:review -- optimizely-saas.content-types` requested the registered URL `https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/content-types-saas`. It received HTTP 301 to the canonical official page [Content types in Optimizely CMS SaaS](https://docs.optimizely.com/cms-saas/docs/content-types-saas), which returned HTTP 200. The same response body was captured and has raw SHA-256 `97af0f7385d435f82d4300397f765e980c0be872f0449907ad9e9a575152f4cd`. The proposed source-lock observation was derived from that response: fragment SHA-256 `af0bbf3380b0da68cfa9434f3d99636c51fa9ac525882aa392f6df6f8e11956a`, normalized SHA-256 `e54ab03cb85de84b73cee4258e893c5d6aaa2bf07ee8d7df28017b7990905c8c`, and the unchanged thirteen-token set `b0694033bb4674d9a9526d466267d112ed78d4a7f12204b105f9b9d9a3ff9757`. No other lock record changed, and the source manifest is unchanged.

The page's `Properties > Data types` section says `url` is "A URL string value." It says `content` "Represents a composition of another content item (inline or referenced)." A content property can use any content type unless it is limited to a specific set. The `Properties > Validation fields` section says `allowedTypes` and `restrictedTypes` apply to `content` and `contentReference`, and that `restrictedTypes` "has priority over allowedTypes." Both locators are registered for `optimizely-saas.content-types`.

The profile now declares URL `valueShape.kind` as `string` and keeps it nullable, so the compiler derives a direct render operation. Content's typical use is composition of another content item, inline or referenced. Its editor behavior names the allowed/restricted type rules and exclusion precedence. The previous reference value shape and "Content relationship" storage shape are withdrawn, along with their citations. Content therefore compiles with undocumented `valueShape` and `storageShape`, no evidence for those claims, and no derived reference operation. `deliveryShape` remains undocumented. This does not claim that Content values are null, and it does not use `kind: unknown` or describe a REST envelope.

The unresolved question is the Content wire mapping. The official CLI's management REST client and generated types at `episerver/content-js-sdk` revision `cebd5c058a146ea6f09bd49bf8fcf7fe8d9104c9` establish management REST provenance. Their generic property-data union does not show which value a `type=content` property carries, so the mapping remains unasserted. The inaccessible schema endpoint was not retried.

All thirteen native tokens, the other URL and Content citations on `Property types`, the unrelated field claims, the SDK 2, SDK 3, CMS 12, and CMS 13 profiles, and consumer routing remain unchanged. This proposal does not accept the other issue #100 dispositions, the two other profile holds, or the release-note indexes in [issue #91](https://github.com/JFusco/cms-field-vocabulary/issues/91). Independent review of the source evidence, its applicability, and the single-source lock proposal is required before acceptance.
