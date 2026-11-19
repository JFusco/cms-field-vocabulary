---
topics: [official-source-freshness]
plans: [2026-11-16-brief-plan-optimizely-saas-api-v1-rich-text-media-claims-f819cb770c.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/173'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/173']
---
# Document SaaS rich-text media claims

[Issue #173](https://github.com/JFusco/cms-field-vocabulary/issues/173) enriches the `richText` claims of the `optimizely-saas.cms-api-v1` profile (product Optimizely CMS SaaS, version CMS SaaS API v1, management surface, CMS API content-type property schema transport). The vendor-drift scan observed new dated entries on the registered release-index source `optimizely-saas.release-notes-index`. A changed index fingerprint alone does not change a field fact, so the exact official entry was compared with the profile.

On 2026-11-16 at 20:18Z, [Release notes - CMS SaaS](https://docs.optimizely.com/cms-saas/release-notes) returned HTTP 200, raw SHA-256 `f8cacb94157714b092edf185a065ef2034f071212b9ba8132bd2bde42b93d28b`. The relevant entry is the `november-10` heading's "Insert images and video from CMS or Optimizely DAM in rich text" section (`#insert-images-and-video-from-cms-or-optimizely-dam`). It says:

- Rich-text image and video buttons browse CMS media, pick a DAM asset when DAM is configured, or upload an image to CMS (SaaS).
- "DAM assets in rich text": "CMS (SaaS) stores DAM assets as permanent links, like other content links, which redirect to the DAM URL."
- "Optimizely Graph and the Content Management API": "To add media through the Content Management API, put a cms://content reference in the src of an img element or of a source element inside a video element."
- "Limitations": only images and video are supported.

Three locators are now registered for `optimizely-saas.release-notes-index`: the entry heading and its two named sub-items. The profile's `richText` `editorBehavior` and `storageShape` cite them alongside the existing `optimizely-saas.content-types` `Property types` evidence. `valueShape`, `typicalUse`, the null `deliveryShape` and the empty authored `renderingOperations` are unchanged. The compiler still derives the same pass-through operation. Generated catalog, manifest, profile and platform documentation change only for this field.

The same entry's Optimizely Graph statements are not imported: the `html` field carries public asset URLs and the `json` field adds a cms://content reference. They describe delivery, while this management profile keeps `deliveryShape` undocumented. The release note carries no version-specific evidence for the pinned SDK 2, SDK 3 or SDK 3.1 profiles, so those profiles do not cite it. The release notes are continuous SaaS notes without an explicit "API v1" qualifier. Applying them to the pinned API v1 label relies on the source's existing profile routing.

All thirteen native tokens, the SDK profiles and consumer routing remain unchanged. `sources.lock.json` is unchanged. The scanner observation fingerprints `ad01132bff45448c17929d6764aef33d32ea852663780d614e06b78039a5a83d` (November 10) and `63739e41d6589d11ebea364a51f1066d26f639c78c57a8b1a6450b7d8e317c1d` (November 12–15) remain proposals for maintainer approval. Maintainer review of the source evidence and its applicability is required before acceptance.
