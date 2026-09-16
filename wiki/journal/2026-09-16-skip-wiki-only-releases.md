---
pr: https://github.com/jfusco/cms-field-vocabulary/pull/47
topics: [release-operations]
plans: [2026-09-16-suppress-package-releases-for-wiki-only-reconciliation-51f3eae0c0.md]
---
# Skip wiki-only releases

Wiki reconciliation pull requests are review artifacts and do not alter the published package. Their bot commits and pull-request titles previously omitted the repository's reserved `[skip release]` marker, so each merge launched Semantic Release and could create a redundant patch release or repeat an unrelated npm authentication failure.

The sync workflow now includes `[skip release]` in both the bot branch commit and generated pull-request title. The duplicate placement deliberately covers merge, rebase, and squash strategies while leaving the original substantive pull request eligible for its normal release.

Verification covers workflow-shell syntax, the complete `pnpm run verify:ci` gate, packed-consumer installation, wiki integrity, and the normal pull-request checks.
