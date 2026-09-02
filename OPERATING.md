# Operating cms-field-vocabulary

This runbook is for maintainers responsible for official-source review, generated catalog integrity, consumer projections, and releases.

## Operating invariants

- `sources/profiles/*.json` is the only human-authored vendor vocabulary.
- Every documented claim resolves to an official source ID and locator in `sources/official-sources.json`.
- `sources.lock.json` records a reviewed observation; a scanner cannot accept or update it.
- Product versions and authoring, management, storage, delivery, and SDK surfaces remain distinct.
- Framework behavior is consumer policy, not vendor authority.
- Generated catalogs, platform pages, distributions, and consumer projections are reproducible and never hand-edited.
- Coding agents receive selected contracts, not the full catalog or duplicated prose.
- Publication runs only through the authorized `main` release workflow. npm trusted publishing with GitHub OIDC is the normal credential path; a one-time granular token is permitted only to bootstrap the first unscoped package release.

## Routine quality operation

Use the pinned toolchain:

```sh
corepack enable
corepack prepare pnpm@11.1.1 --activate
pnpm install --frozen-lockfile
```

Before merge:

```sh
pnpm run verify:ci
pnpm run test:packed
```

The pull-request `Quality` workflow runs the complete non-fixing gate. `Commit message lint` validates the pull-request title and every commit. The packed-consumer test is also part of release readiness and must pass before publication.

Generated drift is repaired from source:

```sh
pnpm run catalog:build
pnpm run types:build
```

Never repair `catalog/`, `docs/platforms/`, or `dist/` directly.

## Vendor-documentation freshness

The `Vendor documentation freshness` workflow runs an index scan daily at 13:17 UTC and runs an index scan plus the full official-source scan every Monday at 13:47 UTC. A manual dispatch can select either depth. It has read-only repository access plus permission to open or update issues.

The workflow:

1. checks out the repository without persisted credentials;
2. runs the release-index scan, adding the full official-source scan on the weekly schedule or a manual `full` dispatch;
3. verifies that the scanner did not mutate the checkout;
4. uploads logs and evidence for 30 days;
5. opens or updates a source-specific attention issue when either scan reports drift or retrieval fails, and uses a scanner-integrity issue when the checkout changes.

It does not edit source, update `sources.lock.json`, open a vocabulary pull request, or publish.

### Triage an attention issue

1. Open the linked workflow run and download the artifact.
2. Inspect `index.log`, `full.log`, and `worktree-status.txt`.
3. Identify each observation that is not `unchanged`.
4. Open the registered official URL and review the exact locator in `sources/official-sources.json`.
5. Check the page's product/version context and whether the source is `exhaustive` or `supplemental`.
6. Compare every field and claim in the affected source profile.

Use these dispositions:

| Condition | Action |
| --- | --- |
| Transient/unreachable | Retry later; do not change claims or the reviewed lock |
| Cosmetic document change | Retain it in the scan artifact; it does not create an attention issue or require a lock refresh by itself |
| Claim-changing | The bounded observed token set is unchanged but claim content moved; update only supported structured claims and evidence, then rebuild |
| Enumeration-changing | The independent observed token set changed, required tokens disappeared, or discovery could not safely run; audit the entire surface, exact casing, extension boundary, and consumer impact |
| Version-changing | Add or migrate a versioned profile; do not silently widen a pinned profile |
| Removed/moved page | Locate an official replacement, update the manifest and locators, and retain review evidence in the pull request |

After review, update only the affected observations:

```sh
pnpm sources:review -- <source-id> [<source-id>...]
```

Then run:

```sh
pnpm run catalog:build
pnpm run verify:ci
pnpm run test:packed
```

`pnpm sources:review -- --all` is reserved for an intentional complete-lock refresh. `--allow-manual` is an exception for an independently reviewed official source that automation cannot retrieve; the pull request must explain the failure and review method, and the reviewer must manually verify every required token. It cannot override a fetched observation that reports missing tokens or establish a new independent enumeration baseline.

Close the attention issue only after the reviewed pull request is merged or the evidence establishes a transient false alarm. Link the issue to the reviewing pull request.

## Review and release impact

The source entry's `reviewOwner` reviews vendor meaning. A second maintainer should review changes that alter any of the following:

- an exhaustive enumeration;
- canonical field IDs;
- value, storage, or delivery shapes;
- official or contract-derived rendering operations;
- agent-policy rules or renderer bindings;
- consumer adapter routing;
- schema versions or public exports;
- source-lock or projection digest behavior.

Treat canonical-ID removals or renames, profile removal, incompatible schema changes, changed selected-contract meaning, and incompatible public API changes as breaking. Additive native facts are normally minor after `1.0.0`; corrected evidence or prose that does not change a contract is normally patch. Confirm the actual semantic-release result with a dry run.

## Release model

`semantic-release` owns versions, tags, release notes, the changelog, npm publication, and the release commit. Do not run `npm version`, edit the package version manually, create the release tag manually, or reuse an existing version.

Configured analysis rules are:

| Conventional change | Release after `1.0.0` |
| --- | --- |
| `feat:` | Minor |
| `type!:` or `type(scope)!:` | Major |
| `fix:`, `docs:`, `chore:`, `ci:`, `refactor:`, `test:`, and other configured non-feature types | Patch |

The initial semantic-release publication, when no prior release tag exists, is `1.0.0`. The repository remains `0.0.0-development` until that authorized publication.

Release preflight rejects `BREAKING CHANGE:` bodies because aggregated release bodies can cause accidental majors. Use `!` in the conventional subject for an intentional breaking change.

The literal commit marker `[skip release]` skips only the release job on a push; other quality and wiki workflows still run. Reserve it for a verified non-package follow-up such as recording durable wiki evidence for a release that has already completed. Do not use it to bypass publication for a contract or package change.

## Trusted publication boundary

`.github/workflows/release.yml` is the only publisher. On an authorized `main` push or dispatch it:

- validates release commits;
- runs the complete quality gate;
- packs and clean-installs the tarball;
- performs an npm publish dry run;
- invokes `semantic-release` to assign the version, update the changelog, publish npm with provenance, create the immutable `v${version}` tag, push the release commit, and publish the GitHub Release.

The workflow grants `contents: write` for the release commit, tag, and GitHub Release, and `id-token: write` for npm trusted publishing and provenance. Bind the npm trusted publisher to `JFusco/cms-field-vocabulary` and `.github/workflows/release.yml`; use a protected GitHub environment when the npm binding requires one.

If npm does not allow the trusted publisher to be attached before the unscoped package exists, create a least-privileged one-time granular access token that can create and publish `cms-field-vocabulary`, store it temporarily as the repository secret `NPM_TOKEN`, and run the same release workflow. `@semantic-release/npm` attempts OIDC first and uses the token only as a fallback. Immediately after `1.0.0` exists, bind the trusted publisher, delete the GitHub secret, and revoke the token. Do not retain a long-lived npm token for later releases.

## First release: 1.0.0

Use this checklist after the trusted publication path is approved:

1. Confirm the npm package name belongs to the project and bind the trusted publisher if npm already permits it.
2. Confirm branch protection and required checks are active on `main`.
3. Confirm there is no existing `v1.0.0` tag or published `cms-field-vocabulary@1.0.0`.
4. Resolve every vendor-freshness attention issue that affects shipped claims.
5. Confirm `sources.lock.json` contains every registered source and that all generated output is current.
6. Run locally from a clean checkout:

```sh
pnpm install --frozen-lockfile
pnpm run verify:ci
pnpm run test:packed
pnpm run release:dry
```

7. Inspect the dry-run release notes and packed file list. Confirm the proposed version is exactly `1.0.0`.
8. If the new package cannot yet accept a trusted-publisher binding, install the one-time `NPM_TOKEN` repository secret described above.
9. Dispatch or allow the release job from `main`.
10. After a token-bootstrap release, bind the trusted publisher, delete the GitHub secret, and revoke the token before any later release.
11. Do not retry blindly if the job becomes uncertain after npm publication. Check npm, GitHub Releases, and tags first.
12. Promote the Phase 1 wiki archive from `partial` to `implemented`, record the npm/tag/GitHub Release evidence, verify the wiki locally, and push that documentation-only commit with `[skip release]` so it cannot create an unintended `1.0.1`.

### Verify 1.0.0

After publication, verify all release outputs:

```sh
npm view cms-field-vocabulary@1.0.0 version dist.integrity dist.tarball dist.attestations --json
npm view cms-field-vocabulary@1.0.0 --json
```

Confirm:

- npm reports version `1.0.0` and provenance;
- GitHub contains immutable tag `v1.0.0` and the corresponding release notes;
- `CHANGELOG.md` and `package.json` contain the semantic-release update on `main`;
- a clean consumer can install `1.0.0`, run `sync`, `check`, and `resolve`;
- the tarball contains the catalog, profile projections, schemas, source manifest, reviewed source lock, runtime distribution, CLI, and operator documentation, but not repository workflows, tests, environment files, or wiki internals.

## Subsequent releases

For each later release:

1. Review commits since the last `vX.Y.Z` tag.
2. Run release preflight and dry run.
3. Confirm freshness review and generated projections are current.
4. Confirm the proposed semantic version matches contract impact.
5. Publish only from the trusted `main` workflow.
6. Verify npm provenance, tag, GitHub release, release commit, and clean-consumer behavior.

## Failed or harmful release

Do not rewrite a GitHub tag, overwrite an npm version, or force-push release history.

For a non-security defect, deprecate the affected npm version with a concise migration message and publish a fixed higher version. For a suspected compromise, stop publication, disable or rotate affected credentials and trusted-publisher access, preserve workflow evidence, follow [SECURITY.md](./SECURITY.md), deprecate the affected version, and release from a newly verified clean commit.

If semantic-release fails after one external side effect, inspect npm, GitHub tags, GitHub Releases, and `main` before rerunning. Resume only after determining which operations completed.

## Consumer incident response

If a selected contract is wrong but official evidence has not changed:

1. identify whether the defect is canonical vendor data, a contract-derived operation, agent policy, or consumer routing;
2. fix the owning structured layer only;
3. add a regression test for both compiled catalog and selected output;
4. publish the appropriate higher version;
5. have consumers update the exact dependency, run `sync`, and commit or verify the regenerated projection according to their repository policy.

Do not patch generated consumer files or copy corrected prose into adapters as a workaround.
