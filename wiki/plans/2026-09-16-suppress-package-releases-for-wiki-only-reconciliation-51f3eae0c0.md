---
status: "implemented"
executed: true
evidence: ["path:.github/workflows/wiki-sync.yml"]
source_tool: "repository"
source: "/private/tmp/cms-skip-wiki-release-plan.md"
topics: ["release-operations"]
digest: "51f3eae0c076e0393bc6a8620243a6da496cc3d5559f6acd1e30e936dd3a2967"
---

# Suppress package releases for wiki-only reconciliation

## Goal

Ensure automated wiki reconciliation cannot trigger a package release when it is merged.

## Work

1. Add the repository's reserved `[skip release]` marker to the bot branch commit message.
2. Add the same marker to the generated pull-request title so squash merges preserve it.
3. Record the rationale and verification in the context wiki.
4. Run the complete repository verification and exercise the normal pull-request workflow.

## Boundaries

- Keep wiki reconciliation reviewable through pull requests.
- Do not change package release rules for substantive commits.
- Do not weaken wiki integrity or pull-request checks.
