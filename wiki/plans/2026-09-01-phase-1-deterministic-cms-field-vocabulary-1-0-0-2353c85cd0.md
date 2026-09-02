---
status: "implemented"
executed: true
evidence: ["commit:d16ab568514c80e9904c5923303f399912b42805", "workflow:33627334843", "npm:cms-field-vocabulary@1.0.0", "github-release:v1.0.0"]
source_tool: "codex"
source: "/private/tmp/cms-field-vocabulary-phase1-final-plan.md"
topics: ["catalog-authority", "structured-rendering-operations", "deterministic-consumer-projection", "official-source-freshness", "release-operations"]
digest: "2353c85cd0edfc24f992d312e15775bef12cf0194128db2d62bc3ce8f00e883d"
---

# Phase 1 — Deterministic `cms-field-vocabulary@1.0.0`

## Summary

Create `/Users/joe.fusco/Projects/cms-field-vocabulary` and publish the public unscoped npm package `cms-field-vocabulary@1.0.0`.

The package will provide official-source-backed field vocabularies for Contentful, Contentstack, Optimizely SaaS, Optimizely PaaS, SitecoreAI, Sitecore on-premises, and WordPress Core.

Consumer integration will follow a selected-contract model:

- Human-readable tables remain package documentation.
- Skills and adapter prose do not duplicate field vocabularies or rendering tables.
- Coding agents receive a compact structured contract containing only the active adapter and referenced field types.
- Provenance is validated before model execution but is not injected into the agent context.
- Phase 1 does not modify AI Orchestration or COS.

## Package authority and contracts

### Canonical source

Human-authored structured records are authoritative. Generated JSON, TypeScript, schemas, manifests, and documentation are never edited manually.

Every field record preserves:

- Stable platform-scoped `canonicalId`.
- Exact vendor spelling and case as `nativeToken`.
- Product, version, SDK, API, and delivery-surface applicability.
- Official value shape, constraints, formats, editor behavior, and typical use.
- Claim-level official evidence.
- Rendering operations and their authority.
- Explicit extensibility boundary.

Management, authoring, storage, REST, GraphQL, and SDK representations remain separate profiles.

### Structured rendering implications

Rendering implications will be encoded as closed operations rather than free-form instructions. The schemas will define operations such as:

- `direct`
- `branch`
- `format`
- `component`
- `anchor`
- `asset`
- `resolved-content`
- `reference`
- `iterate`
- `pass-through`

Each operation contains structured operands such as:

- Value access path.
- Renderer identifier.
- Prop and attribute bindings.
- Edit-attribute target.
- Stable-key paths.
- Null handling.
- Allowed constraints.
- Closed prohibition codes.

Each operation carries one authority value:

- `official`
- `contract-derived`
- `consumer-policy`

For example, the Optimizely `richText` contract will encode the `.json` access path, `RichText` renderer, wrapper-level editing attribute, and closed prohibitions against HTML coercion and applying edit attributes directly to the renderer. The consumer contract will not need a paragraph explaining those rules.

Human package documentation will generate the original table shape:

| Native type | What it holds | Typical use | Rendering implication | Authority | Evidence |
| --- | --- | --- | --- | --- | --- |

That table is for maintainers and reviewers. It is not projected into AI Orchestration skills.

### Public interfaces

Expose:

- `CmsProfile`
- `FieldTypeFact`
- `OfficialClaim`
- `OfficialSource`
- `RenderingOperation`
- `AgentGuidanceProfile`
- `ResolvedFieldContract`
- `ProjectionManifest`
- `FreshnessObservation`

Programmatic APIs will include:

- `getProfile(profileId)`
- `getFieldFact(profileId, fieldId)`
- `listFieldFacts(profileId)`
- `resolveFieldContracts({ profileId, fieldIds, agentProfile })`
- `validateProjection(config)`

Package exports will include the catalog, schemas, profiles, rendering operation definitions, resolver, and CLI with ESM, CommonJS, and TypeScript support.

### Narrow consumer CLI

The public CLI will expose only consumer operations:

- `sync --config <path> [--if-needed]`
- `check --config <path>`
- `resolve --config <path> --field-id <id>... --output <path>`

Catalog building, validation, documentation scanning, and evidence review are producer operations. They will remain repository scripts and will not appear in consumer skills or public CLI help:

- `pnpm sources:scan:index`
- `pnpm sources:scan:full`
- `pnpm sources:review -- <source-id>`

## Deterministic consumer projection

### Committed projection

The future AI Orchestration projection will contain only machine-owned files:

- Package/profile provenance.
- Projection manifest and SHA-256 records.
- Adapter-to-profile index.
- One compact compiled contract shard per adapter.

It will not generate field-vocabulary Markdown inside `frontend-ai/skills/`.

Generated files will be marker-owned, byte-deterministic, exact-versioned, atomically replaced, and protected from manual formatting.

### Runtime selection

The future pipeline driver will:

1. Validate the installed package, projection manifest, schema version, and digests.
2. Map `build.config.json.stackAdapter` to one exact CMS profile.
3. Resolve exact field IDs already selected by the Build Pack or modeled content definition.
4. Extract only those field contracts from the active adapter shard.
5. Add the result once as structured `inputs.cmsFieldContracts` in the work order.

The contracts will not enter the `load` list as prose rules.

If a run references no CMS fields, the injected contract is empty. Contracts from inactive adapters are never loaded.

Field selection will not search arbitrary prose or choose a “closest” type. Exact official tokens and evidence-backed editor labels may resolve automatically. Ambiguous or unknown language produces a structured unresolved result with candidates and requires an explicit selection before Implement.

The selected field IDs will be persisted in a validated driver-owned selection artifact, making Implement a replay of an already resolved decision.

### Skill boundary

When consumption is implemented later:

- Adapter skills retain only a short invariant stating that CMS field semantics come from the driver-provided contract.
- Existing hand-written property vocabulary and rendering tables are removed once projection parity is proven.
- Generic code-writing skills remain unaware of the package.
- Source URLs, review metadata, freshness reports, and full human descriptions are not placed in model context.
- Consumer-specific policies can extend operations but cannot replace official identities or value shapes.

A committed context-size ratchet will record the selected-contract byte/token baseline. CI will fail on unreviewed growth, preventing the projection from gradually becoming another large generated prose rule.

## Official catalog and freshness

### V1 coverage

Use only official documentation, including:

- [Contentful content types](https://www.contentful.com/developers/docs/references/content-management-api/content-types/) and editor interfaces.
- [Contentstack content-type JSON schema](https://www.contentstack.com/docs/headless-cms/json-schema-for-creating-a-content-type).
- [Optimizely CMS SaaS content types](https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/content-types-saas).
- [Optimizely CMS 13 property types](https://docs.developers.optimizely.com/content-management-system/v13.0.0-CMS/docs/built-in-property-types).
- [SitecoreAI field types](https://doc.sitecore.com/sai/en/developers/sitecoreai/content-modeling-and-presentation/data-templates/data-template-fields/the-data-template-field-types.html).
- [Sitecore XP 10.4 field types](https://doc.sitecore.com/xp/en/developers/104/sitecore-experience-manager/the-data-template-field-types.html).
- [WordPress Core `register_meta`](https://developer.wordpress.org/reference/functions/register_meta/) and [block attributes](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/).

Versioned products use pinned documentation and SDK versions. Rolling SaaS documentation uses an observed date and source fingerprint instead of a fabricated product version.

WordPress V1 is Core only. ACF, SCF, plugins, and project-defined meta remain extensions outside the canonical baseline.

### Provenance

`sources.lock.json` will retain:

- Official URL, vendor, title, and source role.
- Product/version/transport applicability.
- Stable locator and extraction method.
- Observation and review timestamps.
- Fragment and exact token-set fingerprints.
- Completeness classification.
- Reviewer and replacement history.

A field type cannot enter the catalog unless its exact native token is present in designated official evidence. Typical-use, editor, storage, delivery, and rendering claims each require their own evidence or an explicit `undocumented` state.

### Freshness automation

`vendor-doc-freshness.yml` will provide:

- Daily official release/version index checks.
- Weekly full official-source scans.
- Manual dispatch.

Drift is classified as unchanged, cosmetic, claim-changing, enumeration-changing, version-changing, unreachable, or removed.

Automation uploads evidence and opens or updates a source-specific issue. It never edits approved vocabulary, generates new field types, removes types, or publishes releases. Vendor outages retain the last reviewed snapshot.

## Repository, wiki, workflows, and release

### Foundation

Initialize Git with `main`, attach `JFusco/cms-field-vocabulary`, and configure:

- Node 24.14 and pnpm 11.
- TypeScript, ESLint, formatting, and tests.
- Conventional Commits and commitlint.
- Husky 9 and lint-staged.
- MIT license, README, CONTRIBUTING, SECURITY, OPERATING, and changelog.
- Deterministic build, validation, generation, packed-consumer, and CI scripts.

Hooks remain offline:

- `commit-msg`: commitlint.
- `pre-commit`: staged linting, catalog validation, generated-output check, and wiki lifecycle.
- `pre-push`: full verification and packed-consumer tests.

### Wiki

After Git and Husky initialization, run the requested `$wiki` installer with `--github`.

Seed topics for catalog authority, structured rendering operations, deterministic consumer projection, source freshness, and release operations. Archive this plan as the first wiki entry, add the implementation journal, rebuild the wiki graph, and validate the complete installation.

### GitHub workflows

Install the shared workflow suite:

- `commitlint.yml`
- `pr.yml`
- `quality.yml`
- `release.yml`
- `wiki-check.yml`
- `wiki-sync.yml`
- `wiki-issue-sync.yml`
- `vendor-doc-freshness.yml`

Do not copy UI Design Library’s Figma-only workflow. Configure Dependabot for npm and GitHub Actions.

### Release

Semantic Release on `main` will run verification, packed-consumer tests, npm dry-run, changelog generation, npm publication with provenance, `v${version}` tagging, and GitHub Release publication.

The first stable release is `1.0.0`. Prefer npm trusted publishing/OIDC. If first publication requires an initial token, use a one-time granular token in the same release workflow, then bind the trusted publisher and revoke the token.

## Future COS boundary

The future COS projection will consume compact structured JSON, not AI rendering operations or prose.

It will provide the immutable official baseline for the existing post-create Content Type tab. Organization-specific fields, aliases, and guidance remain a separately labeled overlay and cannot mutate canonical package records.

A cross-repository golden will be introduced only after COS serializes package-derived vocabulary into an actual handoff.

## Verification and acceptance

Tests will prove:

- All seven CMS profiles exist and remain isolated.
- Every native field type has exact official evidence.
- Native casing survives every projection.
- Rendering operations use only schema-defined operations and prohibition codes.
- `official`, `contract-derived`, and `consumer-policy` authority cannot be conflated.
- Consumer policy cannot override official type identity or value shape.
- The Optimizely structured contracts preserve the original rendering implications without relying on prose.
- Resolving fields returns only the requested fields from the active adapter, in canonical order.
- Unknown or ambiguous fields fail closed.
- A CMS-free job receives no CMS context.
- No consumer projection contains human documentation tables, source-page prose, or unrelated adapters.
- Build and projection output are byte-identical across repeated runs.
- Context-size growth fails without an explicit ratchet update.
- Sync/check enforce markers, exact package versions, digests, path safety, atomic promotion, and rollback.
- Normal CI remains offline; live sources are accessed only by freshness workflows.
- The npm tarball works in clean ESM and CommonJS fixture consumers.
- Wiki, hooks, workflows, release preflight, provenance, GitHub `v1.0.0`, and npm `cms-field-vocabulary@1.0.0` are complete.

Assumptions:

- The canonical path is `/Users/joe.fusco/Projects/cms-field-vocabulary`.
- Phase 1 changes only this new repository.
- The npm package remains public and unscoped.
- Human-readable vocabulary and rendering tables belong in package documentation, never duplicated in consumer skills.
