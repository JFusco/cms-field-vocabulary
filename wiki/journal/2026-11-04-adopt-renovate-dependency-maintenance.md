---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/131'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/131']
---
# Adopt Renovate for dependency maintenance

CMS Vocabulary is the first adopter of the separate full-maintenance preset in `JFusco/renovate-config`. Its existing default preset remains restricted to first-party consumer packages. The central Pin Courier runner already discovers installed repositories with a Renovate configuration, so CMS needs no second runner or new credentials.

The root `renovate.json` enables Monday updates in America/New_York, preserves exact dependency pins, groups npm and GitHub Actions minor/patch updates independently, and leaves major updates separate. CMS omits the recommended preset's built-in grouping presets so they cannot override its explicit groups. A full Monday window is deliberate: a narrow 9 AM window would miss the runner's six-hour schedule. Renovate automerge remains disabled. `.github/dependabot.yml` is removed in the same cutover.

Generated bot bodies cannot honestly pre-complete the repository's evidence checklist or invent a closing issue. The commit workflow therefore recognizes the installed Pin Courier identity on same-repository `renovate/` PRs targeting main and gives it the metadata exemption already used for dependency bots. It does not exempt lookalike branch names, forks, other users, or the package verifier. The existing Office adapter still requires trusted bot commits and a Ready card before creating one linked tracking issue and routing ordinary delivery.

Security preflight found vulnerability alerts and Dependabot security-update PRs disabled before this change. Those repository settings remain unchanged. Enabling security PR coverage is a separate configuration decision; the new preset supports vulnerability alerts without automerge.

Evidence includes the pinned Renovate validator, read-only local extraction, bot-identity regression tests, and the repository's required verification commands recorded in the delivery PR. The first real Pin Courier update and its Office adoption remain connected operational acceptance, rather than something established by local checks alone. Validation, vendor scanning, wiki reconciliation, release and OIDC publication continue through their existing GitHub Actions workflows.
