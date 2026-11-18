---
topics: [official-source-freshness, catalog-authority]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/174'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/174']
plans: [2026-11-18-brief-plan-add-composition-to-optimizely-saas-cms-api-v1-4fd9b3f3ff.md]
---
# Add SaaS composition property type

The weekly vendor-documentation scan reported an enumeration change on `optimizely-saas.content-types`. The registered `data-types` discovery region now yields fourteen data types; the reviewed lock and the `optimizely-saas.cms-api-v1` profile listed thirteen. The official page (https://docs.optimizely.com/cms-saas/docs/content-types-saas, reached from the registered docs.developers.optimizely.com URL) was read again on 2026-11-18 and compared with the profile, as tracked by [issue #174](https://github.com/JFusco/cms-field-vocabulary/issues/174).

The added `composition` property cites three passages. `Properties > Data types` says it represents a Visual Builder layout with the content it contains, is supported only on content types with the `_experience` base type, and is not supported as an array item. `Properties > format` says that on a composition property `format` names the layout type. `Properties > Validation fields` lists composition among the types that accept `allowedTypes` and `restrictedTypes`, with `restrictedTypes` taking priority. The profile records only `typicalUse` and `editorBehavior` from these passages. The page documents no wire shape, nullability, delivery or rendering, so those claims stay undocumented and no rendering operation is derived.

The same page also documents a built-in content-type `composition` setting for experience and section types that configures the main Visual Builder canvas. That setting is not a property data type and is not part of this field. The linked "Composition properties" page is not a registered source, so no layout-type values are taken from it.

The `optimizely-saas.content-types` lock entry was refreshed from a live review. Its fragment fingerprint `53233f57da97689579e6bce58190cdc98b885cdc4cf97645c8e16b8a12c5adca` matches the weekly scan. Repository validation requires the reviewed token set to equal the manifest tokens, so the refresh ships in the draft as a proposal for maintainer approval; no other lock entry changes. Existing canonical IDs, the SDK 2, 3 and 3.1 profiles and consumer routing are unchanged. Issue #173 also regenerates this profile's outputs, and whichever delivery merges second rebases and regenerates.
