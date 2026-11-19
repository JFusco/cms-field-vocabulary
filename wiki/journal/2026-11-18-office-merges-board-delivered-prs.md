---
date: 2026-11-18
topics: [maintainer-workflow, release-operations]
plans: []
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/177'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/177']
---
# State the Office's merge authority and cleanup

## Why

This repository is delivered hands-off through the Office. The Office's project policy already let its harness merge, and merges have been enabled since 2026-10-28, but `AGENTS.md` still told agents to stop at an open pull request and leave merging to the user, and said a release begins only after the user merges. The readiness reviewer reads `AGENTS.md`, so the stale rule could stall a pull request the Office was authorized to merge. Joe confirmed on 2026-11-18 that board-delivered work goes through to merge and cleanup, including the release a qualifying merge publishes.

## What changed

- Step 7 of the Git delivery flow states that the Office harness merges every board-delivered pull request once its applicable checks pass, its readiness review passes and the saved pull request and head are verified. Outside the Office, delivery still stops at the verified pull request unless the user authorizes merging.
- A new step 8 covers cleanup after a merge: the remote branch, the local branch, the worktree, and scratch or temporary files the delivery left outside the repository. The wording matches the Brain and Office repositories.
- The Release cycle section says a release begins when a qualifying pull request merges, by the Office or by the user.

## Verification

Documentation only. Release rules, workflows and the Office's configuration are unchanged; `pnpm run verify:ci` and the wiki checks pass.
