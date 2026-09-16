---
pr: pending
topics: [release-operations]
plans: [2026-09-16-remove-wiki-sync-read-org-dependency-c033b010ae.md]
---
# Fix wiki-sync token scope

Manual replays of the wiki reconciliation workflow successfully rebuilt and force-updated the bot branches, then failed while editing the already-open review pull requests. Runs `35106364356`, `35106595007`, `35106800553`, and `35107038819` all reported that `gh pr edit` queried GraphQL organization fields requiring `read:org`, while `PR_BOT_TOKEN` intentionally carries repository scope only.

The workflow now uses the GitHub REST pull-request endpoints for branch-filtered lookup, title/body updates, reopen operations, and creation. This preserves exact open-PR reuse, closed-unmerged-PR recovery, force-with-lease branch updates, and review-before-merge behavior without broadening the secret's permissions.

Verification covers shell syntax for the changed step, a live read-only REST lookup, the complete `pnpm run verify:ci` gate, wiki graph freshness, and the workflow's normal pull-request checks.
