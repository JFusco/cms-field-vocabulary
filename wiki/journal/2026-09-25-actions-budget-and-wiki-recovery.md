---
date: 2026-09-25
topics: [release-operations]
plans: [2026-09-26-reduce-actions-usage-and-recover-wiki-synchronization-a7e32708e7.md]
issue: "https://github.com/jfusco/cms-field-vocabulary/issues/59"
pr: https://github.com/JFusco/cms-field-vocabulary/pull/60
issues: ["https://github.com/jfusco/cms-field-vocabulary/issues/59"]
---
# Reduce Actions work and add wiki recovery

Hosted merge testing showed that API authentication did not configure Git after checkout. Both wiki bot workflows now give `actions/checkout` the validated `PR_BOT_TOKEN`, so review branches can be pushed without expanding workflow permissions.

Weekly maintenance replaces the daily wiki schedule. Merge sync now supports single and dated batch replay, defaults to 90 days, updates review PRs through REST, and runs without application dependencies. Quality classifies changed paths so wiki-only work is lightweight while ready code and `main` code changes retain full verification. Strict frontmatter validation now covers every wiki page.
