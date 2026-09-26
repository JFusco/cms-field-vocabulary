---
topics: [catalog-authority, official-source-freshness]
plans: [2026-09-26-complete-the-sitecoreai-authoring-list-field-vocabulary-119fff380e.md]
issue: "https://github.com/JFusco/cms-field-vocabulary/issues/56"
---
# Complete SitecoreAI authoring list fields

Review of [SitecoreAI's list-field table](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/data-templates/data-template-fields/the-data-template-field-types/the-list-field-types.html) found four documented authoring labels absent from `sitecore-ai.authoring.current`: `Multilist with search`, `Grouped droplink`, `Grouped droplist`, and `Name value list`. The separate Content SDK profile already had corresponding labels with its own reviewed casing.

The authoring profile now records the four exact labels. The list-table source declares them as required evidence tokens, and its reviewed observation was refreshed on September 26. The generated catalog and platform page were rebuilt. This adds authoring identities without inferring Content SDK delivery shapes or changing consumer routes. Issue 56 remains open until the focused pull request merges.

Verification: official source review, `node scripts/validate.mjs`, and `node --test tests/catalog-contract.test.mjs` passed.
