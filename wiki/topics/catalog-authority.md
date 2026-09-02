---
aliases: [canonical catalog, field vocabulary, official CMS fields, source profiles]
---
# Catalog authority

The catalog is an official-source-backed record of CMS field identities and semantics. Human-authored JSON under `sources/profiles/` is authoritative; catalog JSON, TypeScript bundles, schemas, manifests, and platform tables are generated or validated views.

## Current state

- Sixteen profiles keep represented management, storage, authoring, REST, SDK, product-version, and delivery surfaces distinct across seven platform families; an unmodeled surface remains undocumented instead of being folded into another profile.
- Each native type has a stable profile-scoped canonical ID and preserves the exact spelling and case of a designated official source.
- Documented claims carry official evidence. Unknown value shapes and uses remain explicitly undocumented rather than inferred.
- Extensible platforms are labeled open; a documented built-in list is never represented as a closed instance inventory when custom field types are supported.
- Generated platform tables remain maintainer documentation. Consumers receive structured selected contracts rather than copied vocabulary prose.

## Decisions

- Official identity and value-shape claims cannot be replaced by consumer policy.
- Editor labels, storage tokens, SDK values, and delivery mappings remain separate profiles even when they look similar.
- WordPress Core is split into meta, REST schema, block attribute type, and block attribute source surfaces; plugin vocabularies are extensions.
- Optimizely CMS 13 admin labels and .NET model types are separate profiles, and Sitecore authoring tokens are isolated from Content SDK and Headless Services delivery contracts.
- Rendering behavior is governed by [structured rendering operations](./structured-rendering-operations.md), and source evidence is maintained through [official-source freshness](./official-source-freshness.md).
