---
date: 2026-11-08
topics: [release-operations]
plans: []
pr: pending
issue: https://github.com/JFusco/cms-field-vocabulary/issues/151
---
# Align security producer guidance

## Why

The current-state topic still described preflight-disabled settings after the approved rollout enabled Dependabot. That could direct a maintainer toward a competing security producer.

## What changed

Current guidance names Dependabot as the alert-driven producer and states that the shared preset disables Renovate vulnerability and OSV production. Historical preflight observations remain in Git history. Release and runtime configuration are unchanged.

## Verification

`pnpm run verify:ci` passed all 118 tests and the release preflight, catalog, types, context-budget and wiki checks using the declared pnpm and a frozen isolated install. Wiki graph freshness is checked again after recording these results. Natural update and publication examples remain separately tracked rollout observations.
