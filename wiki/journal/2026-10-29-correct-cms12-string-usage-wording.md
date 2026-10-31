---
topics: [catalog-authority]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/113'
issues:
  [
    'https://github.com/jfusco/cms-field-vocabulary/issues/113',
    'https://github.com/jfusco/cms-field-vocabulary/issues/100',
  ]
---
# Correct CMS 12 String usage wording

The [GH-100 claim review](https://github.com/JFusco/cms-field-vocabulary/issues/100) recorded finding `cms12-string-wording`: the `optimizely-paas.cms12-model` `String` usage said "Short text up to 255 characters." [Optimizely's CMS 12 built-in property types](https://docs.optimizely.com/cms-12/docs/built-in-property-types) list `String` under `Common property types` for both short and long plain text, so a universal 255-character limit is not supported by the cited source.

[Issue #113](https://github.com/JFusco/cms-field-vocabulary/issues/113) bounded the correction to one claim. Before and after:

| Claim | Before | After |
| --- | --- | --- |
| `String.typicalUse` value | Short text up to 255 characters. | Short or long plain text; length is configured with StringLength. |
| `String.typicalUse` evidence locator | `Common property types; Work with other content` | `Common property types` |

The narrower `Common property types` locator was registered for `optimizely-paas.cms12-builtins` in `sources/evidence-locators.json` so validation accepts it as reviewed evidence. The source's registered scan locator and `sources.lock.json` are unchanged.

The value shape, default single-line editor, storage shape, canonical ID, consumer routing, and every other profile are unchanged, including the `optimizely-paas.cms12-property-data-type` `String` and `LongString` claims. Regenerating the catalog changed only the matching `String` claim in `catalog/catalog.json`, `catalog/profiles/optimizely-paas.cms12-model.json`, the manifest hashes, and the CMS 12 model platform table. No source-lock observation was accepted; GH-100 keeps its own merge prerequisites.

Local verification ran `pnpm run verify:ci`, `pnpm run test:packed`, and `npm pack --dry-run --ignore-scripts`. Independent review and verification remain required before merge; no release was made.
