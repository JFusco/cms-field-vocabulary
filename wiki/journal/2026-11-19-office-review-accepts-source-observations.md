---
date: 2026-11-19
topics: [official-source-freshness, maintainer-workflow]
plans: []
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/179'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/179']
---
# The Office's review accepts source observations

## Why

This repository is delivered hands-off through the Office. A maintenance run proposes source-backed changes as draft pull requests, and the Office now marks them ready and reviews them. The README and the freshness topic still said a maintainer must accept reviewed observations before merge, so the readiness review stopped a proposal for Joe. Joe accepted that proposal's source-lock observation on 2026-11-19 and delegated maintainer acceptance to the Office's independent readiness review from then on.

## What changed

- `README.md` and the official-source freshness topic say the official source is inspected at the recorded locator and reviewed observations are accepted before merge by the Office's independent readiness review, under Joe's delegation.
- A maintainer can still hold a proposal.

## Verification

Documentation only. The inspection requirement, evidence rules, scanner behaviour and release rules are unchanged; `pnpm run verify:ci` and the wiki checks pass.
