---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/126'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/126']
---
# Notify the Renovate runner after a release

Consumers of this package now receive updates from a shared Renovate preset that runs centrally from [JFusco/renovate-config](https://github.com/JFusco/renovate-config) as the Pin Courier GitHub App. The runner checks every six hours, so without a signal a consumer could wait hours for an update pull request after a release.

`.github/workflows/release.yml` now records `HEAD` before semantic-release. `@semantic-release/git` commits every release, so a moved `HEAD` after the publish step means a version was published. Only then does the workflow mint a Pin Courier installation token scoped to `renovate-config` with `contents: write` and send a `package-released` `repository_dispatch` to it. GitHub's [permissions reference for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps) lists Contents write for `POST /repos/{owner}/{repo}/dispatches`. `actions/create-github-app-token` is pinned to the v3.3.0 commit because it handles the app's private key.

The token comes from the `RENOVATE_APP_CLIENT_ID` and `RENOVATE_APP_PRIVATE_KEY` repository secrets. npm publication still uses trusted publishing only; these secrets never reach the publish step. A run that publishes nothing sends no dispatch. A failed dispatch fails the job after publication has already succeeded, and the runner's schedule still delivers the update. The next real release is the first connected proof.
