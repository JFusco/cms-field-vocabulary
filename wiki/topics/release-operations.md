---
aliases: [npm release, semantic release, trusted publishing, repository workflows]
---
# Release operations

The repository publishes the public unscoped `cms-field-vocabulary` package through the same governed release shape used by the reference UI vocabulary packages.

## Current state

- Node 24.14.0 and pnpm 11.1.1 are pinned; the lockfile and pnpm build allowlist are committed.
- Offline hooks run commitlint, staged linting, catalog validation, generated-output checks, wiki lifecycle work, full verification, and packed-consumer tests.
- GitHub workflows cover commit and PR-body linting, quality, release, wiki integrity/sync, issue-state sync, and vendor-document freshness.
- Official JavaScript actions run on their native Node 24 majors (`checkout@v7`, `setup-node@v7`, `cache@v6`, `upload-artifact@v7`, and `github-script@v9`); no runtime-forcing compatibility flag remains.
- Semantic Release on `main` derives versions from Conventional Commits, updates the changelog and package metadata, publishes npm provenance, tags `v${version}`, and creates the GitHub Release.
- npm trusts the `JFusco/cms-field-vocabulary` `release.yml` workflow through OIDC; publication requires no repository release secret.
- Packed ESM and CommonJS fixtures exercise the actual tarball and the closed consumer CLI contract before publication.

## Decisions

- 2026-09-28 — Exclude standard Git merge subjects before release-note classification and bind PR-body regression coverage to the checked-in canonical template ([issue #84](https://github.com/JFusco/cms-field-vocabulary/issues/84)).
- 2026-09-28 — Standardized issue-first delivery, standalone Commitlint, deterministic PR-body validation, and the `BOT_TOKEN` secret name while stopping agent delivery before merge ([issue #75](https://github.com/JFusco/cms-field-vocabulary/issues/75)).
- The first stable release is `1.0.0`.
- npm publication uses trusted publishing/OIDC only.
- Official actions should be upgraded to a release that natively declares the repository's pinned Node runtime rather than forced onto it with a compatibility environment flag.
- Release automation never runs untrusted pull-request code with publication credentials.
- Conventional Commit type and scope validation remains strict, while subjects may use up to 100 characters beneath the existing 120-character header cap so generated grouped dependency updates can pass the same gate as maintainer commits.
- Wiki reconciliation manages its review pull requests through GitHub's REST pull-request endpoints so the repository-scoped `BOT_TOKEN` does not require unrelated organization-read access.
- Wiki maintenance runs weekly with batch recovery, and portable wiki checks install no application dependencies. Repository-wide frontmatter validation rejects duplicate fields and malformed bracket lists before automation rewrites authored history.
- The explicit `[skip release]` commit marker is reserved for verified non-package follow-ups, including the post-publication wiki evidence commit, so that recording `1.0.0` does not trigger `1.0.1`.
- Automated wiki reconciliation includes `[skip release]` in both its branch commit and review pull-request title, covering merge, rebase, and squash strategies without suppressing releases for the substantive source pull request.
- Catalog freshness remains independent and read-only as described in [official-source freshness](./official-source-freshness.md).
- Draft and wiki-only changes keep stable checks through lightweight validation; ready code changes and `main` code updates retain the complete verifier.
