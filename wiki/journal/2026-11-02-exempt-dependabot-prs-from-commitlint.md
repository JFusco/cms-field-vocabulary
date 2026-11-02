---
topics: [maintainer-workflow]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/122'
issues:
  [
    'https://github.com/jfusco/cms-field-vocabulary/issues/122',
    'https://github.com/jfusco/cms-field-vocabulary/issues/121',
  ]
---
# Exempt Dependabot pull requests from commitlint

Dependabot writes its own pull request title, body, and commit messages. Grouped updates such as [cms-field-vocabulary pull request 121](https://github.com/JFusco/cms-field-vocabulary/pull/121) produce subjects like `chore(deps-dev): bump the development-minor-and-patch group with 2 updates`, which is longer than the 50-character `subject-max-length` rule. The body has no pull request template sections either. Fixing those would mean rewriting Dependabot's commits, so the `commitlint` check could never pass for these pull requests.

`.github/workflows/commitlint.yml` now skips "Validate PR body", "Lint PR title", and "Lint commit messages" when `github.event.pull_request.head.ref` starts with `dependabot/`. The job still runs, so its check reports success. [GitHub's Dependabot options reference](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference) documents the default branch form `dependabot/PACKAGE-MANAGER/DEPENDENCY`. `.github/dependabot.yml` does not set `pull-request-branch-name`, and the open head ref of pull request 121 is `dependabot/npm_and_yarn/main/development-minor-and-patch-6de09b3544`.

The `bot/wiki-` body exemption is kept. Every other pull request is linted as before. `commitlint.config.cjs`, `dependabot.yml`, and the other workflows are unchanged. The condition matches on the branch name only, so a human branch named `dependabot/...` would also skip linting. The issue scoped the exemption to that prefix. Joe approved it on 2026-11-02 so that Dependabot updates can be reviewed and merged on their other checks. The approval does not cover lint rule changes for any other branch.
