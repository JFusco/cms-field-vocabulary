---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/130'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/130']
---
# Wait for the release tarball before the Renovate dispatch

The [registry wait](2026-11-03-wait-for-registry-before-renovate-dispatch.md) stopped as soon as the packument listed the new version, but the tarball that consumers install is served separately and can lag. In `JFusco/brain` pull request 318, the dispatched update to `ui-design-brain` 1.18.6 failed its install with `ERR_PNPM_FETCH_404` for the tarball and passed on rerun once the registry served it. This repository's wait step had the same check.

The step now also requires a HEAD request to the version's `dist.tarball` URL to return 200 before it mints the Pin Courier token and dispatches. The 40-check limit, `continue-on-error`, and dispatch-anyway warning are unchanged. Local runs of the exact step passed at once for `cms-field-vocabulary@1.3.10` and `ui-design-brain@1.18.6`; against a local server whose tarball returned 404 twice, it waited and passed on the third check. The next real release is the connected proof.
