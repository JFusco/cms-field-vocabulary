---
date: 2026-11-23
topics: [maintainer-workflow]
plans: []
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/190'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/190']
---
# Regenerate conflicted wiki outputs

## Why

An accepted repair of a base-update conflict touched only the two generated wiki outputs. It regenerated both from the merged Markdown and kept the scoped vocabulary changes, and independent review found no blocking defects. The procedure was not written down anywhere.

## What changed

- [Wiki mechanics](../MECHANICS.md) now says that a conflict limited to `scripts/wiki/graph/data/graph.json` and `wiki/connections.md` is resolved by running `node scripts/wiki/build-graph.cjs` on the merged Markdown, never by hand-merging. Wiki integrity is then checked, and the repaired candidate's diff is compared with the pre-repair candidate's.
- The rule is documentation rather than a new test. `node scripts/wiki/check.cjs` and `pnpm run graph:check` already reject generated output that does not match the Markdown, and the candidate comparison is a judgement made during review.

## Verification

Documentation only. `node scripts/wiki/build-graph.cjs`, `node scripts/wiki/check.cjs` and `pnpm run verify:ci` pass.
