---
date: 2026-11-19
topics: [maintainer-workflow]
plans: []
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/183'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/183']
---
# Override minimatch for the eslint advisory

## Why

Dependabot alert 22 (GHSA-g3hv-75wg-m249, medium) flags `minimatch` 10.2.6, a
denial of service through crafted glob patterns. The affected range is
`>=7.0.0 <11.0.1`. `minimatch` arrives only through `eslint@10.14.0` and
`@eslint/config-array@0.23.5`, which require version 10. The fix ships only in
11.0.1, so Dependabot found no installable version and its security updates
failed.

## What changed

- `pnpm-workspace.yaml` overrides `minimatch` to `>=11.0.1`. pnpm 11 no longer
  reads settings from the `pnpm` field of `package.json`, so the override lives
  in the workspace file.
- `pnpm-lock.yaml` resolves `minimatch` 11.0.9 and its new dependency
  `@isaacs/nonrecursive-glob-match`. No `minimatch` below 11.0.1 remains.

## Verification

eslint and `@eslint/config-array` use only the `Minimatch` class, which
minimatch 11 still exports. `pnpm why minimatch` reports only 11.0.9. eslint
lints the same 43 files under minimatch 10.2.6 and 11.0.9. `pnpm run lint`,
`pnpm run verify:ci`, `pnpm run test:packed` and
`npm pack --dry-run --ignore-scripts` pass.

## Removal

Remove the override once eslint and `@eslint/config-array` depend on
`minimatch` 11.0.1 or later.
