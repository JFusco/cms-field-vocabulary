---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/128'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/128']
---
# Wait for the registry before the Renovate dispatch

The [first dispatch after a release](2026-11-03-notify-renovate-runner-after-release.md) reached the Renovate runner too early. For 1.3.9, npm accepted the upload at 14:07:45 UTC and reported that the package "may take a few minutes to become available". The dispatch arrived at 14:07:52, but the registry listed 1.3.9 only at 14:11:55. The dispatched run could not see the new version, so consumers would have waited for the next six-hour run.

`.github/workflows/release.yml` now polls the public registry packument, the document Renovate reads, every 15 seconds after a published release. It mints the Pin Courier token and sends the dispatch once the packument lists the version from `package.json`. After 40 checks, about ten minutes, it logs a warning and dispatches anyway. The step uses `continue-on-error` and a 12-minute timeout, so it can never fail a release that already published. A run that publishes nothing skips the wait.

The script reads the package name from `package.json` and encodes a scope separator, so the same step works for scoped packages. Local runs of the exact step confirmed an immediate pass for `cms-field-vocabulary@1.3.9` and `@verndale/ui-design-brain@1.18.2`, and the warning path for a version that never appears. The next real release is the connected proof.
