---
date: 2026-11-08
topics: [release-operations]
plans: [2026-11-08-harden-publisher-release-maintenance-e03cb8ddea.md]
pr: 'https://github.com/jfusco/cms-field-vocabulary/pull/143'
follow_up_pr: 'https://github.com/jfusco/cms-field-vocabulary/pull/147'
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/142'
issues:
  [
    'https://github.com/jfusco/cms-field-vocabulary/issues/142',
    'https://github.com/jfusco/cms-field-vocabulary/issues/146',
  ]
---
# Suppress maintenance releases per commit

## Why

Maintenance markers must exclude individual commits without hiding earlier substantive changes. A failed release notification needs a replay path that does not republish.

## What changed

The analyzer and release notes share a literal complete-message filter. Release rules, publication plugins and authentication remain in place. Dependabot marks its own maintenance commits, while its routine version-update limit is zero. Registry checks report ready, timeout or error; the publication summary records accepted or failed notification delivery. Current action versions use full commit pins.

## Verification

Isolated Git histories exercise the installed release engine with fake publication and dispatch hooks, including suppressed breaking changes, mixed histories, and manual reruns. Live publication and generated Dependabot metadata still require rollout observations.


## Preset adoption follow-up

[Preset adoption issue](https://github.com/JFusco/cms-field-vocabulary/issues/146) adopts the reviewed maintenance overlay with explicit Monday lockfile refresh. Redundant local grouping is removed so first-party exemptions keep precedence. Isolated Git tests now create actual merge and squash histories with isolated Git configuration. The real notification CLI runs through a fake dispatch endpoint to verify failure and notification-only retry. Policy tests passed without live publication or dispatch. Actual generated Dependabot metadata and natural dependency delivery remain separate acceptance observations.
