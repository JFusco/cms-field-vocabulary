---
topics: [official-source-freshness]
plans: [2026-11-23-brief-plan-qualify-cms-13-model-xhtmlstring-editor-media-13-7-0-4a8b8a1be6.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/197'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/197']
---
# Qualify CMS 13 model XhtmlString editor media

[Issue #197](https://github.com/JFusco/cms-field-vocabulary/issues/197) qualifies the `XhtmlString` editor claim of the `optimizely-paas.cms13-model` profile (product Optimizely CMS 13, .NET model surface) with the EPiServer.CMS.Core 13.7.0 rich-text media behavior.

On 2026-11-23, [Release notes - CMS 13](https://docs.optimizely.com/cms-13/release-notes) returned HTTP 200. Under "CMS Core—EPiServer.CMS.Core" > "November 18—13.7.0" > Enhancements, the first item says rich-text editors gained image and video buttons that insert media from CMS or Optimizely DAM, and that dragged or pasted images now upload to CMS before insertion instead of being stored as embedded data. The registry routes this release index to both CMS 13 profiles. The registered property-types URL returned HTTP 301 to [CMS 13 property types](https://docs.optimizely.com/cms-13/docs/built-in-property-types), an allowed host, whose Common property types table maps `XHtmlString` to "A TinyMCE HTML editor". The release note names rich-text editors generically, so applying it to `XhtmlString` relies on that mapping.

The locator `CMS Core > November 18—13.7.0 > Enhancements` is now registered for `optimizely-paas.cms13-release-notes-index`. Only the `XhtmlString` `editorBehavior` value and its citations change; the new behavior is stated as applying from 13.7.0, not to earlier CMS 13 releases. "No longer stores them as embedded data" is recorded as editor behavior only; `storageShape` and `deliveryShape` remain unspecified. The compiler-facing `XhtmlString` token, field count, the nullable rich-text value shape, the pass-through rendering operation that preserves null and forbids plain-string coercion, the `optimizely-paas.cms13-admin` profile, SaaS profiles and consumer routing are unchanged. No REST link-fragment representation or SaaS media payload is imported, and the entry's bug fixes CMS-58191, CMS-58884 and CMS-59042 are out of scope.

The admin-label counterpart is tracked separately in [issue #195](https://github.com/JFusco/cms-field-vocabulary/issues/195). Its draft test asserts that the model claim does not mention 13.7.0, and both changes register the same locator, so whichever merges second must reconcile that assertion and the locator and regenerate shared outputs.

`sources.lock.json` is unchanged. The release-index observation `3041b3ee83f2e42dfb29dd5b9d9ea2a61f8d6fbf4b1965162f81faf1dfa73c48` remains a proposal for maintainer approval.
