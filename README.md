# cms-field-vocabulary

`cms-field-vocabulary` is an official-source-backed catalog of native CMS field types and a deterministic contract generator for coding agents. It keeps vendor nomenclature, value shapes, rendering implications, and consumer-specific policy in one structured package without copying the same vocabulary prose into every adapter repository.

Stable publication begins at `1.0.0` and is owned by `semantic-release`. Source checkouts can retain the development placeholder until the release job assigns a version.

## What this package guarantees

- Native field tokens come from official vendor documentation or official vendor repositories recorded in `sources/official-sources.json`.
- Every documented claim carries a source ID and stable locator. A claim that official evidence does not support compiles as `undocumented`; it is not inferred or filled in.
- Product versions and schema surfaces stay separate. An authoring label, management-schema token, storage type, delivery type, and SDK type are not treated as synonyms.
- Consumer output is deterministic for an exact package version, configuration, profile, and selected set of canonical field IDs.
- Framework guidance is labeled separately from vendor authority. Consumer policy cannot masquerade as an official claim.

This package does not define a cross-CMS universal field enum, promise that open CMS installations cannot add custom types, or replace the vendor documentation linked by each claim.

## Authority and generated output

The repository has one vocabulary-authoring path:

1. `sources/official-sources.json` registers official evidence, its version mode, completeness, locator, expected tokens, allowed hosts, and review owner.
2. `sources/profiles/*.json` is the canonical human-authored vocabulary. Each file covers one product version, surface, and transport.
3. `profiles/agent/*.json` contains framework or coding-agent policy. It is not vendor evidence.
4. `profiles/consumers/*.json` routes a consumer's adapter names to exact vocabulary profiles.
5. `catalog/`, `docs/platforms/`, `dist/`, and consumer projections are generated from those inputs.

Generated Markdown is a readable view, not another source of truth. Do not edit generated files or reproduce their field tables in adapter rules, skills, or application documentation. Consumers should resolve the contracts they need from the installed package.

## Included profiles

Seven CMS identities are represented by sixteen versioned surface profiles:

| Platform | Profile | Surface | Version boundary |
| --- | --- | --- | --- |
| Contentful | `contentful.cma.saas` | Management | SaaS snapshot observed 2026-09-01 |
| Contentstack | `contentstack.cma.saas` | Management | SaaS snapshot observed 2026-09-01 |
| Optimizely SaaS | `optimizely-saas.cms-api-v1` | Management | CMS SaaS API v1 |
| Optimizely SaaS | `optimizely-saas.sdk-2` | SDK | `@optimizely/cms-sdk` 2.x contract snapshot |
| Optimizely PaaS | `optimizely-paas.cms12-model` | SDK/model | CMS 12 model and editor surface |
| Optimizely PaaS | `optimizely-paas.cms12-property-data-type` | Storage | `EPiServer.dll` 12.0.3 enum |
| Optimizely PaaS | `optimizely-paas.cms13-admin` | Authoring | CMS 13 admin labels |
| Optimizely PaaS | `optimizely-paas.cms13-model` | SDK/model | CMS 13 .NET content model types |
| SitecoreAI | `sitecore-ai.authoring.current` | Authoring | Rolling SitecoreAI snapshot observed 2026-09-01 |
| SitecoreAI | `sitecore-ai.content-sdk2` | SDK | Rolling SitecoreAI delivery with Content SDK 2.x |
| Sitecore XP | `sitecore-on-prem.xp104-authoring` | Authoring | XP 10.4 editor vocabulary |
| Sitecore XP | `sitecore-on-prem.headless22` | SDK | XP 10.4 with Headless Services 22 |
| WordPress | `wordpress.core71-meta` | Storage | Core 7.1 `register_meta` |
| WordPress | `wordpress.core71-rest-schema` | Delivery | Core 7.1 REST JSON Schema |
| WordPress | `wordpress.core71-block-attributes` | Storage | Core 7.1 block attribute `type` |
| WordPress | `wordpress.core71-block-attribute-source` | Storage | Core 7.1 block attribute `source` |

The `extensibility` value on each profile tells consumers whether the documented vocabulary is closed at that exact profile, discoverable, or open. It does not change the evidence threshold for adding native types.

## Requirements and installation

- Node.js 24.14.0 or newer
- pnpm 11.1.1 for repository development

After `1.0.0` is published:

```sh
pnpm add cms-field-vocabulary
```

Create `cms-field-vocabulary.config.json` in the consuming repository:

```json
{
  "$schema": "./node_modules/cms-field-vocabulary/schemas/consumer-config.schema.json",
  "packageName": "cms-field-vocabulary",
  "profile": "generic",
  "adapter": "contentful",
  "target": "generated/cms-field-vocabulary"
}
```

The available consumer profiles are `generic`, `ai-orchestration`, and `cos`. They may use different adapter names while routing to the same canonical vendor profiles. `generic` and `ai-orchestration` emit coding-agent contracts. The future-facing `cos` profile emits compact official-data shards containing only profile identity plus field `canonicalId`, exact `nativeToken`, optional `displayName`, `valueShape`, and `formats`; it contains no rendering operations, agent profile, renderer bindings, consumer policy, evidence, or descriptive claim prose.

## Synchronize and verify a consumer projection

Synchronize the exact installed package into the configured target:

```sh
pnpm exec cms-field-vocabulary sync --config cms-field-vocabulary.config.json --if-needed
```

Verify it in CI without accepting drift:

```sh
pnpm exec cms-field-vocabulary check --config cms-field-vocabulary.config.json
```

The target contains:

- a generated ownership marker;
- package, catalog, and source-lock identity in `source.json`;
- exact adapter-to-profile routing in `adapters.json`;
- deterministic adapter contracts under `contracts/`;
- a SHA-256 projection manifest.

Synchronization accepts relative config paths and absolute config paths that remain inside the consumer root. It refuses absolute or escaping targets, config paths outside the consumer root, symlink traversal, unmarked directories, unexpected files, and locally modified generated files. Replacement is staged and renamed atomically. Treat the entire target as generated and never edit it manually.

## Resolve only the fields needed by an agent

Agent context should contain selected contracts, not the whole catalog. Resolve one or more canonical field IDs from one exact CMS profile:

```sh
pnpm exec cms-field-vocabulary resolve \
  --config cms-field-vocabulary.config.json \
  --field-id optimizely-saas.sdk-2.contentReference \
  --rendering-selection optimizely-saas.sdk-2.contentReference:content-reference-usage=media \
  --output artifacts/cms-fields/component-contract.json
```

Each repeatable `--rendering-selection` uses the exact closed syntax `<field-id>:<discriminator>=<value>`. `resolve` first verifies the installed projection, rejects field IDs from different profiles, applies only the configured consumer's agent policy, sorts and deduplicates the requested IDs, and writes a deterministic selected contract. A selected field with mutually exclusive rendering branches fails closed until its discriminator is supplied. Unknown, duplicate, unrequested, and unsupported selections also fail before output is written. Claim provenance stays in the catalog for audit and review; it is intentionally omitted from normal agent context.

The CLI requires at least one `--field-id`. The programmatic file resolver treats an explicitly empty field list as a successful no-op, returns `null`, and creates no output file.

A consuming adapter should identify the field IDs required by the current component and load that selected artifact. It should not paste field definitions or rendering prose from this repository into its own permanent rules.

Selected-contract size is guarded by committed byte and deterministic token-estimate ceilings in `profiles/context-budget.json`. `pnpm run context:check` rejects growth; maintainers use `pnpm run context:update` only after reviewing an intentional contract expansion.

## Programmatic API

```ts
import {
  getProfile,
  resolveFieldContracts,
} from 'cms-field-vocabulary';

const profile = getProfile('optimizely-saas.sdk-2');
const selected = resolveFieldContracts({
  profileId: profile.id,
  fieldIds: [
    'optimizely-saas.sdk-2.contentReference',
  ],
  agentProfile: 'react-nextjs',
  renderingSelections: [{
    fieldId: 'optimizely-saas.sdk-2.contentReference',
    discriminator: 'content-reference-usage',
    value: 'media',
  }],
});
```

Selection-gated operations carry a closed discriminator in the contract. Supplying `renderingSelections` projects only the matching branch; an unknown, duplicate, unrequested, or unsupported choice fails closed.

`resolveFieldContracts` returns `null` immediately when `fieldIds` is empty. Callers should omit `inputs.cmsFieldContracts` in that case so a CMS-free job receives no CMS profile, agent, renderer, or contract metadata.

The root export also provides catalog lookup and projection functions. Package subpath exports expose the generated catalog, JSON Schemas, and consumer profiles. The published tarball also includes the official source manifest and reviewed source lock for filesystem-based audit tooling.

## Freshness is reviewed, not auto-authored

A scheduled, read-only workflow checks registered official release/version indexes daily and runs a full official-source scan weekly. It normalizes fetched documents, compares reviewed hashes, verifies required evidence tokens, and independently extracts complete token sets from structurally bounded official-source regions. The required-token check proves approved facts still have evidence; the independent observed-token hash detects native types added or removed without first adding them to the manifest. Claim text drift is classified separately when the observed enumeration is unchanged. Raw-only cosmetic churn remains visible in the uploaded report but does not create an attention issue.

The scanner never edits vocabulary source, updates the reviewed lock, opens a vocabulary pull request, or publishes a package. A maintainer must inspect the official source at the recorded locator, update structured claims when warranted, run the explicit source-review command, and pass the full quality gate. See [CONTRIBUTING.md](./CONTRIBUTING.md) for evidence rules and [OPERATING.md](./OPERATING.md) for the freshness and release runbooks.

## License and security

The package is available under the [MIT License](./LICENSE). Report security issues according to [SECURITY.md](./SECURITY.md).
