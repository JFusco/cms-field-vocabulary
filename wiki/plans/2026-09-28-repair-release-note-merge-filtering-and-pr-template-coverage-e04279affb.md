---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/84; implementation review revision-007; CHECK-1-1 pnpm run verify:ci"]
source_tool: "repository"
source: "/private/tmp/cms-84-review-repair-plan.md"
topics: ["release-operations"]
digest: "e04279affbffaec3fe13218ec3ec4e080116e5c01d3b4f2a1924473a853bbfe7"
---

# Repair release-note merge filtering and PR-template coverage

## Objective

Resolve the two accepted implementation-review findings without widening the reviewed four-file scope.

## Steps

1. Exclude standard Git merge subjects before deterministic release-note classification and counting.
2. Add a merge-commit fixture that proves the rendered release notes remain unchanged.
3. Add a PR-body regression that reads the checked-in template, proves it is incomplete as authored, completes its placeholders and checklist, and proves the completed body passes validation.
4. Run the scoped tests and `pnpm run verify:ci`, then obtain independent recheck and finalization evidence.

## Boundaries

- Preserve the fixed release-note section order and empty-section behavior.
- Do not change release publication, credentials, versioning, or merge behavior.
- Do not claim hosted GitHub or npm verification from local checks.
