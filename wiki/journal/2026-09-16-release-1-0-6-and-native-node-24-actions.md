---
topics: [release-operations]
plans: [2026-09-16-upgrade-github-actions-to-native-node-24-runtimes-07ee4b0626.md]
---
# Release 1.0.6 and native Node 24 Actions

## Change

- npm trusted publishing now authorizes the `JFusco/cms-field-vocabulary` repository's `release.yml` workflow to publish through OpenID Connect.
- The invalid fallback `NPM_TOKEN` repository secret was deleted, and the release workflow no longer reads that secret.
- GitHub Actions run [`35112090656`](https://github.com/JFusco/cms-field-vocabulary/actions/runs/35112090656) published `cms-field-vocabulary@1.0.6` with signed provenance and created GitHub Release [`v1.0.6`](https://github.com/JFusco/cms-field-vocabulary/releases/tag/v1.0.6).
- Repository workflows now use the current official action majors that declare the Node 24 runtime: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/cache@v6`, `actions/upload-artifact@v7`, and `actions/github-script@v9`. The temporary runtime-forcing environment flag was removed.

## Rationale

The package needed a durable release identity that does not depend on a long-lived npm credential. The first successful OIDC release also exposed deprecation annotations from older Node 20-based action majors, so every workflow was moved to the corresponding native Node 24 action generation instead of retaining the compatibility override.

## Evidence

- npm registry metadata reports `1.0.6` as `latest` and exposes its provenance-backed tarball.
- The release run completed verification, packed-consumer installation, npm publication, tagging, changelog generation, and GitHub Release creation.
- `pnpm run verify:ci` passes all 79 tests after the workflow changes, and every workflow file parses as YAML.

## Affected durable topic

- [Release operations](../topics/release-operations.md)
