---
date: 2026-11-23
topics: [official-source-freshness, maintainer-workflow]
plans: []
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/189'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/189', 'https://github.com/jfusco/cms-field-vocabulary/issues/179']
---
# Require explicit observation acceptance

## Why

[PR #180](https://github.com/JFusco/cms-field-vocabulary/pull/180) delegated source-observation acceptance to the Office's independent readiness review ([record](./2026-11-19-office-review-accepts-source-observations.md)). It did not say what that acceptance must contain, and `OPERATING.md` still said only that "a reviewer accepts source observations and approves any merge". A review could then read passing checks or a ready pull request as acceptance of a proposed source-lock refresh.

## What changed

- `OPERATING.md` gains an "Accept a source-lock observation" runbook section. For each refreshed source the readiness review names the source ID and proposed observation fingerprint, records inspection at the registered official-source locator, and explicitly accepts the observation. Passing checks, pull-request readiness, or a readiness pass without those items is not acceptance, and a maintainer hold stays effective.
- The freshness workflow paragraph in `OPERATING.md` points to that section instead of its older reviewer wording.
- `README.md` and the official-source freshness topic summarise the rule and point to the runbook.

## Enforcement choice

Documentation. Acceptance is recorded in the Office's readiness review, outside this repository, so no repository test or check can observe it. `sources:review` and `verify:ci` already fail closed on missing evidence tokens and lock drift; they verify evidence, not acceptance.

## Verification

Documentation only. Scanner behaviour, the inspection requirement, evidence rules and release rules are unchanged; `pnpm run verify:ci` and the wiki checks pass.
