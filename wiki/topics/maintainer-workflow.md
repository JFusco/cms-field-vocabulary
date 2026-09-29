# Maintainer workflow

## Commit messages

Use a specific scoped Conventional Commit subject with an action verb and a
subject of at most 50 characters. Add a body when the reason, impact, or tradeoff
is not clear from the diff. Wrap body and footer lines at 72 characters and use
`!` or `BREAKING CHANGE:` for a breaking change. The repository's commitlint
configuration remains the enforcement source; history is not rewritten.

The subject limit changed from 100 to 50 characters to match the other seven
repositories. Conventional Commit release semantics are unchanged.

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
