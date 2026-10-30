---
topics: [official-source-freshness]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/114'
issues:
  [
    'https://github.com/jfusco/cms-field-vocabulary/issues/114',
    'https://github.com/jfusco/cms-field-vocabulary/issues/100',
  ]
---
# Qualify CMS 13 Content options for elements

The `cms13-content-elements` finding from [issue #100](https://github.com/JFusco/cms-field-vocabulary/issues/100) is handled separately from the typed-reference and external-mapping claims added by [Propose CMS 13 Content Reference contracts](./2026-10-19-propose-cms13-content-reference-contracts.md). [Optimizely's CMS 13 Content property guide](https://docs.optimizely.com/cms-13/docs/content-property) lists Content Area, Content Area Item, and Content Reference under `Configure Content property > Content Type`. An info note following Content Reference says Content Reference is the only content type available for elements. The note was read from the full page on October 30.

The `optimizely-paas.cms13-admin` editor behavior for Content Area and Content Area Item now says those options are not available for elements. The Content Reference editor behavior keeps its picker and global-contract text and adds that it is the only Content Type option available for elements. Each editor-behavior claim cites the new registered locator `Content Type > Note following Content Reference` on `optimizely-paas.cms13-content-property`. The existing citations are kept. The general property options, labels, value shapes, Graph delivery claim, profile notes, CMS 12 and CMS 13 model profiles, and consumer routing are unchanged.

The scanner's registered fragment for this source covers the Content Type list and does not include the note. The October 19 observation fingerprint `e7cc1734897bd4fbb2a636db46bfbd703783878c57517dfacc4848935378ef0b` in `sources.lock.json` was not changed. The source stays `supplemental`, so this claim depends on a full-page read rather than on the scanned fragment. This delivery does not redesign the scanner or accept any source-lock observation. Parent issue #100 keeps its own merge prerequisites.

The generated catalog, CMS 13 admin catalog profile, manifest digests, and platform document were rebuilt from source. Independent review and verification are still required before publication.
