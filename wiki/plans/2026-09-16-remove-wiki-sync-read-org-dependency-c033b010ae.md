---
status: "implemented"
executed: true
evidence: ["workflow:35106364356", "workflow:35106595007", "workflow:35106800553", "workflow:35107038819", "path:.github/workflows/wiki-sync.yml"]
source_tool: "codex"
source: "/private/tmp/cms-field-vocabulary-wiki-sync-rest-plan.md"
topics: ["release-operations"]
digest: "c033b010aef93bcc40176e88751036983fadc9ca11ba11cd89826f5023025815"
---

# Remove wiki-sync read:org dependency

## Goal

Make the context-wiki reconciliation workflow create, update, and reopen its review pull requests using only the documented repository-scoped bot token.

## Work

1. Preserve the existing branch reconciliation and force-with-lease behavior.
2. Replace GraphQL-backed pull-request editing with GitHub REST pull-request list, update, reopen, and create calls.
3. Keep exact open-PR reuse and closed-unmerged-PR reopen behavior.
4. Record the failure evidence and durable token-scope decision in the repository wiki.
5. Run repository verification and validate the workflow through its normal pull-request checks.

## Boundaries

- Do not broaden `PR_BOT_TOKEN` permissions to work around a client-side GraphQL query.
- Do not change the exclusion that prevents wiki bot PRs from recursively producing more wiki PRs.
- Do not weaken force-with-lease branch safety or review-before-merge behavior.
