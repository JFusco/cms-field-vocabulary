---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/135'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/135']
---
# Refuse drafts in the Pin Courier guard

[Issue 135](https://github.com/JFusco/cms-field-vocabulary/issues/135) closes three gaps an implementation review found in the Pin Courier metadata exemption from [Renovate adoption](2026-11-04-adopt-renovate-dependency-maintenance.md). `scripts/is-pin-courier-pr.cjs` now refuses a draft pull request, matching the Office harness guard; `commitlint.yml` also runs on `ready_for_review`, so the exemption is re-evaluated when a draft becomes ready; and `tests/pin-courier-pr.test.mjs` asserts the exact condition of each of the three lint steps and that the guard step precedes them, instead of counting occurrences, so a weakened clause or a moved step fails the test.

Renovate does not open drafts here, so the exposure was low; the change keeps the stated contract true: only a ready pull request from the installed App on its own `renovate/` branch is exempt, and Quality still runs the full verifier on every pull request.
