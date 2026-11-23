# Maintainer workflow

## Commit messages

Use a specific scoped Conventional Commit subject with an action verb and a
subject of at most 50 characters. Add a body when the reason, impact, or tradeoff
is not clear from the diff. Wrap body and footer lines at 72 characters and use
`!` or `BREAKING CHANGE:` for a breaking change. The repository's commitlint
configuration remains the enforcement source; history is not rewritten.

The subject limit changed from 100 to 50 characters to match the other seven
repositories. Conventional Commit release semantics are unchanged.

Dependabot pull requests (`dependabot/` head refs) skip the PR body, title, and
commit-message lint steps, because Dependabot writes those itself and grouped
update subjects exceed the limit. See
[Exempt Dependabot pull requests from commitlint](../journal/2026-11-02-exempt-dependabot-prs-from-commitlint.md).

## Delivery and merging

The Office harness merges every board-delivered pull request once its applicable
checks pass, its readiness review passes and the saved pull request and head are
verified. Delivery outside the Office stops at the verified pull request unless
the user authorizes merging. After a merge the delivery cleans up its remote
branch, local branch, worktree and any scratch files it left outside the
repository. See
[State the Office's merge authority and cleanup](../journal/2026-11-18-office-merges-board-delivered-prs.md).

## Generated wiki conflicts

A base-update conflict limited to the generated wiki graph and connection
summary is repaired by regenerating both from the merged Markdown, checking
wiki integrity, and comparing the result with the pre-repair candidate. See
[Regenerate conflicted wiki outputs](../journal/2026-11-23-regenerate-conflicted-wiki-outputs.md).

## Dependency overrides

pnpm 11 reads overrides from `pnpm-workspace.yaml`. `minimatch` is overridden to
`>=11.0.1` because eslint 10.14.0 still requires the vulnerable version 10.
Remove the override once eslint depends on a fixed `minimatch`. See
[Override minimatch for the eslint advisory](../journal/2026-11-19-override-minimatch-for-eslint-advisory.md).

## Code map

Graphify 0.9.36 maps src/ and maintained scripts. The code map was introduced from local AST extraction without model calls. A repository-local
skill guides CLI queries and source verification. Native post-commit and
post-checkout hooks refresh the shared map; each clone runs `graphify hook install` to register its hooks and local merge driver. The shareable graph,
HTML, report, manifest, analysis, and labels are committed. Caches, machine
paths, and query memory remain local; `graphify-out/memory/` stays empty.

The context wiki is the authority for rationale and change history, and its
graph indexes Markdown only. Graphify's code map does not add wiki graph nodes
or install agent tool hooks.

Tracked by [cms-field-vocabulary issue 86](https://github.com/JFusco/cms-field-vocabulary/issues/86).
