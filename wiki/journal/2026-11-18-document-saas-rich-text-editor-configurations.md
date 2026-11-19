---
topics: [official-source-freshness]
plans: [2026-11-18-brief-plan-173-richtext-editor-configurations-nov-18-on-optimizely-saas--548a1b850f.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/173'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/173']
---
# Document SaaS rich-text editor configurations

[Issue #173](https://github.com/JFusco/cms-field-vocabulary/issues/173) adds a second documented `richText` editor claim to the `optimizely-saas.cms-api-v1` profile (product Optimizely CMS SaaS, version CMS SaaS API v1, management surface). The scope addition was recorded on the issue before implementation rather than through a competing issue.

On 2026-11-18, [Release notes - CMS SaaS](https://docs.optimizely.com/cms-saas/release-notes) returned HTTP 200 with its URL unchanged. Under the `november-18` heading, "Create your own rich-text editor configurations" (`#create-your-own-rich-text-editor-configurations`) says that administrators create named configurations in Settings > Config > TinyMCE Configurations, deciding which toolbar buttons, named styles, block formats and content stylesheets each rich-text property offers, and assign one to a property in its editor settings. The Minimal, Standard and Expanded configurations remain available and cannot be edited or deleted, and a configuration cannot be deleted while a property uses it.

The locator `November 18 > Create your own rich-text editor configurations` is now registered for `optimizely-saas.release-notes-index`. Only `richText` `editorBehavior` gains the claim and its citation. `valueShape`, `typicalUse`, `storageShape`, the null `deliveryShape`, the empty authored `renderingOperations`, the native tokens, the SDK 2/3/3.1 profiles and consumer routing are unchanged. Generated catalog, manifest, profile and platform documentation change only for this field.

`sources.lock.json` is unchanged. The scanner observation fingerprint `d0d9182f99b21cf0d1b9aa1bd83a5d9a433671177908b7a02eec58646647166b` remains a proposal for maintainer approval. The same entry's bug fix CMS-58191 (string minimum length) concerns `string` and is out of scope. The release notes carry no explicit "API v1" qualifier, so applicability relies on the source's existing profile routing.
