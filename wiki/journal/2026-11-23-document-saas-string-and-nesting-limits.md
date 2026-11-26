---
topics: [official-source-freshness]
plans: [2026-11-23-brief-plan-optimizely-saas-cms-api-v1-string-validation-and-nesting-limi-38e768b953.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/193'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/193']
---
# Document SaaS string and nesting limits

[Issue #193](https://github.com/JFusco/cms-field-vocabulary/issues/193) adds documented editor constraints to six fields of the `optimizely-saas.cms-api-v1` profile (product Optimizely CMS SaaS, version CMS SaaS API v1, management surface).

On 2026-11-23, [Release notes - CMS SaaS](https://docs.optimizely.com/cms-saas/release-notes) returned HTTP 200. Under the `november-18` heading, Bug fixes > CMS-58191 says the editor had capped a string property with a minimum but no maximum length at 255 characters; such properties now accept text of any length, property settings have a Min Length field, and an admin-UI save no longer removes a minimum set through the REST API. [The 2026-11-18 record](./2026-11-18-document-saas-rich-text-editor-configurations.md) had left this fix out of scope.

The registered content-types URL returned HTTP 301 to [Content types](https://docs.optimizely.com/cms-saas/docs/content-types-saas), an allowed host. "Properties > Validation fields" lists `minLength`, `maxLength` and `pattern` for strings, and "Properties > Data types" says `json` values nest up to eight levels. The "Nesting limits" section (Updated 20 Nov 2026) limits inline blocks in content areas, component and content properties, arrays of components and Visual Builder sections to eight levels, Visual Builder layouts to four and `json` values to eight. A shared block or section counts as one level and is checked when it is saved; the whole item is checked on every save, and an over-limit REST request returns 400 Bad Request with the field path.

The locators `Nesting limits` (`optimizely-saas.content-types`) and `November 18 > Bug fixes` (`optimizely-saas.release-notes-index`) are now registered. Only the `editorBehavior` claims and citations of `string`, `json`, `content`, `component`, `array` and `composition` change. The array claim applies only to arrays of components. The composition claim describes layout nodes without section-type wording, because the property does not cover section types. The 64-level REST request-body limit is a transport limit and is not recorded as a field claim. Native tokens, value, storage and delivery shapes, rendering operations, the SDK 2/3/3.1 profiles and consumer routing are unchanged.

`sources.lock.json` is unchanged. The release-index observation `d0d9182f99b21cf0d1b9aa1bd83a5d9a433671177908b7a02eec58646647166b` remains a proposal for maintainer approval, and the content-types extraction fingerprint `53233f57da97689579e6bce58190cdc98b885cdc4cf97645c8e16b8a12c5adca` did not change; the nesting passage is newly inspected text, not a changed observation. The release notes carry no explicit "API v1" qualifier, so applicability relies on the source's existing profile routing.
