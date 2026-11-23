---
topics: [official-source-freshness]
plans: [2026-11-23-brief-plan-qualify-cms-13-admin-xhtml-string-255-editor-claim-with-cms-c-09fc8db63e.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/195'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/195']
---
# Qualify CMS 13 XHTML editor media claim

[Issue #195](https://github.com/JFusco/cms-field-vocabulary/issues/195) qualifies the `XHTML string (>255)` editor claim of the `optimizely-paas.cms13-admin` profile (product Optimizely CMS 13, admin authoring surface) with the EPiServer.CMS.Core 13.7.0 rich-text media behavior.

On 2026-11-23, [Release notes - CMS 13](https://docs.optimizely.com/cms-13/release-notes) returned HTTP 200. Under "CMS Core—EPiServer.CMS.Core" > "November 18—13.7.0" > Enhancements, the first item says rich-text editors gained image and video buttons that insert media from CMS or Optimizely DAM, and that dragged or pasted images now upload to CMS before insertion instead of being stored as embedded data. The registered text-property URL returned HTTP 301 to [Text property](https://docs.optimizely.com/cms-13/docs/text-property), an allowed host, whose "Text Type > XHTML string (>255)" entry maps the admin label to the WYSIWYG (TinyMCE) editor. The release note names rich-text editors generically, so applying it to this label relies on that mapping.

The locator `CMS Core > November 18—13.7.0 > Enhancements` is now registered for `optimizely-paas.cms13-release-notes-index`. Only the `XHTML string (>255)` `editorBehavior` value and its citations change; the new behavior is stated as applying from 13.7.0, not to earlier CMS 13 releases. "No longer stores them as embedded data" is recorded as editor behavior only; `storageShape` and `deliveryShape` remain unspecified. Labels, field count, the nullable rich-text value shape, rendering operations, the `optimizely-paas.cms13-model` profile, SaaS profiles and consumer routing are unchanged. The same entry's bug fixes CMS-58191, CMS-58884 and CMS-59042 are REST or link fixes and are not imported.

`sources.lock.json` is unchanged. The release-index observation `3041b3ee83f2e42dfb29dd5b9d9ea2a61f8d6fbf4b1965162f81faf1dfa73c48` remains a proposal for maintainer approval.
