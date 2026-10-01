---
topics: [release-operations]
plans: [2026-09-28-repair-release-note-merge-filtering-and-pr-template-coverage-e04279affb.md]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/84'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/84']
---
# Repair release-note merge filtering and PR-template coverage

Issue [#84](https://github.com/JFusco/cms-field-vocabulary/issues/84) captured two accepted implementation-review findings in the deterministic delivery tooling. Standard Git merge subjects reached the release-note generator as non-conventional `Other changes`, and the PR-body tests derived their valid checklist from the validator rather than the checked-in template.

The repair now drops standard merge subjects before classification and adds a merge fixture whose expected notes remain unchanged. PR-body coverage now reads the canonical template, proves the untouched template is incomplete, fills its six placeholders, completes its checklist, and proves the resulting body matches the validator contract.

The bounded implementation review used Sol for the scoped repair, Opus for the independent recheck, and Astra for adjudication and finalization. `CHECK-1-1` ran `pnpm run verify:ci` successfully with 86 tests on the final target. This is local evidence only; it does not establish hosted GitHub or npm state.

Affected durable topic: [release operations](../topics/release-operations.md).
