---
aliases: [npm release, semantic release, trusted publishing, repository workflows]
---
# Release operations

The repository publishes the public unscoped `cms-field-vocabulary` package through the same governed release shape used by the reference UI vocabulary packages.

## Current state

- Node 24.14.0 and pnpm 11.1.1 are pinned; the lockfile and pnpm build allowlist are committed.
- Offline hooks run commitlint, staged linting, catalog validation, generated-output checks, wiki lifecycle work, full verification, and packed-consumer tests.
- GitHub workflows cover commit linting, pull-request operations, quality, release, wiki integrity/sync, issue-state sync, and vendor-document freshness.
- Semantic Release on `main` derives versions from Conventional Commits, updates the changelog and package metadata, publishes npm provenance, tags `v${version}`, and creates the GitHub Release.
- Packed ESM and CommonJS fixtures exercise the actual tarball and the closed consumer CLI contract before publication.

## Decisions

- The first stable release is `1.0.0`.
- npm trusted publishing/OIDC is preferred. A one-time granular token is acceptable only if npm requires an authenticated bootstrap publication; it must then be revoked.
- Release automation never runs untrusted pull-request code with publication credentials.
- Conventional Commit type and scope validation remains strict, while subjects may use up to 100 characters beneath the existing 120-character header cap so generated grouped dependency updates can pass the same gate as maintainer commits.
- Wiki reconciliation manages its review pull requests through GitHub's REST pull-request endpoints so the repository-scoped `PR_BOT_TOKEN` does not require unrelated organization-read access.
- The explicit `[skip release]` commit marker is reserved for verified non-package follow-ups, including the post-publication wiki evidence commit, so that recording `1.0.0` does not trigger `1.0.1`.
- Catalog freshness remains independent and read-only as described in [official-source freshness](./official-source-freshness.md).
