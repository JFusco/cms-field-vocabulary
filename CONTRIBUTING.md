# Contributing

Contributions are welcome when they preserve the package's central invariant: an official CMS source supports every documented vendor claim, and no automated process invents or silently expands the vocabulary.

Use [SECURITY.md](./SECURITY.md) instead of a public issue for vulnerabilities.

## Development setup

The repository requires Node.js 24.14.0 or newer and pnpm 11.1.1.

```sh
corepack enable
corepack prepare pnpm@11.1.1 --activate
pnpm install --frozen-lockfile
```

Run the complete non-fixing gate before requesting review:

```sh
pnpm run verify:ci
pnpm run test:packed
```

`verify:ci` validates schemas and provenance, verifies generated catalog output, builds package types, runs tests and the context-budget ratchet, checks repository documentation, and lints maintained source. `test:packed` packs the artifact, installs it into clean offline consumers, synchronizes every consumer profile, checks the projection, and resolves a selected field contract.

When a reviewed schema or operation change intentionally increases selected-contract context, run `pnpm run context:update`, inspect every changed byte and token-estimate ceiling, and commit the ratchet update with the contract change. Do not raise ceilings to make an unrelated failure pass.

## Know which files are authoritative

| Path | Purpose | Editing rule |
| --- | --- | --- |
| `sources/official-sources.json` | Official evidence registry and freshness metadata | Human-reviewed source |
| `sources/profiles/*.json` | Canonical vendor vocabulary by version and surface | Human-reviewed source |
| `profiles/agent/*.json` | Framework and coding-agent policy | Human-reviewed policy; never vendor evidence |
| `profiles/consumers/*.json` | Adapter routing and selected-output policy | Human-reviewed configuration |
| `schemas/*.schema.json` | Closed structural contracts | Update with compatible migrations and tests |
| `sources.lock.json` | Reviewed source observations | Update only with `pnpm sources:review` after review |
| `catalog/`, `docs/platforms/`, `dist/` | Compiled projections | Generated; never hand-edit |

README examples and generated platform pages explain the package but do not override structured source.

## Evidence rules

Only official vendor documentation, official API/class-library references, and official vendor repositories are accepted as vendor evidence. A source entry must include:

- an HTTPS URL on an explicit official-host allowlist;
- a stable source ID and locator;
- the exact product/version relationship, including whether it is pinned or rolling;
- a role such as enumeration, management schema, storage, delivery, SDK source, or compatibility;
- `exhaustive` only when the official source actually defines the complete surface; otherwise `supplemental`;
- the exact case-sensitive tokens required to support approved claims;
- for every exhaustive enumeration-bearing source, a `tokenDiscovery` made from structural boundaries and capture patterns that do not embed those required tokens;
- a review owner.

Do not use search snippets, community articles, generated summaries, implementation folklore, or another package's vocabulary as primary evidence. Search can locate a source; the claim must be reviewed on the official page or repository.

If official sources disagree, preserve the disagreement in separate version/surface profiles or notes and cite both claims. Do not normalize a native token's case or collapse two vendor concepts unless an official machine schema or API explicitly establishes the mapping.

## Model one exact surface at a time

Each source profile represents one product, version boundary, schema surface, and transport. For example, an editor label and an API `type` value belong in different profiles when the vendor exposes them as different vocabularies.

When editing `sources/profiles/*.json`:

- preserve the vendor's exact native token and case;
- use `displayName` only when the official display label is distinct from the native token;
- mark the profile `closed-at-profile`, `discoverable`, or `open` according to official extension boundaries;
- set unsupported claim values to `null`; the compiler will emit an `undocumented` claim with no citation;
- add `typicalUse`, editor behavior, storage shape, delivery shape, and value shape only when official evidence supports them;
- attach narrower `claimEvidence` when a claim comes from a different source or locator than the native-type enumeration;
- keep formats and editor refinements separate from base field types;
- never add custom, plugin, app, or installation-specific fields with `origin: native`;
- use `canonicalSuffix` only when the deterministic suffix would be ambiguous or collide.

Canonical field IDs are generated as `<profile-id>.<suffix>`. They are stable public identifiers: renaming one is a breaking change.

## Rendering authority

A rendering operation has one explicit authority:

- `official` means an official source directly prescribes the operation and the operation carries evidence.
- `contract-derived` means it follows from one or more documented claims and carries `claimRefs`.
- `consumer-policy` belongs only in `profiles/agent/*.json`, carries a `policyId`, and must not cite vendor evidence.

Do not move consumer preferences into canonical vendor source. Do not describe a contract-derived choice as an official vendor requirement.

## Review vendor-documentation drift

The scheduled scanner is an alert, not an author. For an attention issue:

1. Download the workflow artifact and inspect both scan logs and observations.
2. Open the official source URL and navigate to the registered locator.
3. Determine whether the change is unreachable/transient, cosmetic, claim-changing, enumeration-changing, or version-changing. A changed claim fragment is not an enumeration change when the independently extracted token set is unchanged.
4. Compare the whole affected profile, not only the token named by the scanner.
5. Update the official-source manifest and canonical source profile only when official evidence requires it.
6. Update the reviewed observation after the human review:

```sh
pnpm sources:review -- <source-id>
```

Review all registered sources only when intentionally refreshing the complete lock:

```sh
pnpm sources:review -- --all
```

If automated retrieval is unavailable but the official source was independently reviewed, `--allow-manual` is an exceptional fallback. Explain the retrieval failure, manually verify every required token, and preserve the reviewed evidence in the pull request. This option cannot override a fetched observation that reports missing tokens or establish a new independent enumeration baseline.

`extract.tokens` is the reviewed required set, not the discovery set. `extract.tokenDiscovery.regions` bounds one or more official-source sections and captures every native token by structure. Patterns must not list approved token values. `maximumTokens` is a safety ceiling, not an expected count. Changing a discovery pattern requires a live review of that source; metadata-only refreshes fail closed. The reviewed lock stores the independently observed set and its SHA-256 separately from the required-token fingerprint.

Then regenerate and verify:

```sh
pnpm run catalog:build
pnpm run validate
pnpm run catalog:check
pnpm run verify:ci
pnpm run test:packed
```

An unreachable source does not authorize changing or deleting claims. Enumeration or version changes require review by the relevant `reviewOwner` and a release-impact decision.

## Add a source or profile

1. Add the official source to `sources/official-sources.json` before citing it.
2. Add or update a single-surface source profile under `sources/profiles/`.
3. Update platform unions and JSON Schemas if the platform itself is new.
4. Route the profile from a consumer only when that consumer deliberately supports the exact surface.
5. Run `pnpm sources:review -- <new-source-id>` to create its reviewed lock entry.
6. Rebuild the catalog and generated documentation.
7. Add tests for compilation, selection, routing, and expected failure behavior.
8. Run the complete verification commands above.

Do not broaden an existing pinned profile to absorb a new major product version. Add a versioned profile and migrate consumer routing explicitly.

## Consumer integration rule

Consumers synchronize a generated projection and resolve only the canonical field IDs needed for the current component or task. A consuming repository may document how to invoke the package, but it must not copy the package's field tables, typical-use prose, or rendering rules into permanent adapter text. That duplication creates two authorities and defeats the package.

If a consumer needs additional framework behavior, add a named agent policy with `consumer-policy` authority or keep the policy in that consumer. Do not alter a vendor claim to make a consumer implementation convenient.

## Commits and pull requests

Use Conventional Commits. `pnpm commit` invokes the repository's commit helper, and pull-request titles and commits are checked by commitlint.

- `feat:` produces a minor release after `1.0.0`.
- `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`, `test:`, and the other configured non-feature types produce a patch release.
- An intentional breaking release uses `type!:` or `type(scope)!:` in the subject. Do not add an aggregated `BREAKING CHANGE:` body; release preflight rejects it.

A pull request should state:

- affected platform, profile, version, and surface;
- official source IDs and locators reviewed;
- whether enumeration, claim meaning, canonical IDs, rendering operations, or consumer routing changed;
- whether the source is exhaustive or supplemental;
- generated files refreshed;
- verification commands run;
- expected semantic-version impact.

Keep unrelated vocabulary changes in separate pull requests so provenance and release impact remain reviewable.
