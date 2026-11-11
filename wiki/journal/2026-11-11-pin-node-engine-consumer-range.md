---
topics: [release-operations]
issue: 'https://github.com/jfusco/cms-field-vocabulary/issues/165'
issues: ['https://github.com/jfusco/cms-field-vocabulary/issues/165']
---
# Pin the Node.js engine range to the documented floor

[Issue 165](https://github.com/JFusco/cms-field-vocabulary/issues/165) records a reviewed dependency update that narrowed `engines.node` to Node 26.13.0 while the README documented Node 24.14.0 or newer. Hosted checks passed because nothing compared the manifest with the documented consumer range; only a focused manifest review caught it.

`tests/node-engine-contract.test.mjs` now pins `engines.node` to `>=24.14.0` and requires `README.md` and `CONTRIBUTING.md` to state the same floor exactly once. It runs in `pnpm run test`, so the existing Quality `verify:ci` gate fails an accidental narrowing in any pull request, including Renovate, Dependabot, Pin Courier and wiki updates, without adding a separate model review or local QA cycle to them. An intentional floor change edits the test constant, the manifest and both documents together and is a breaking change for consumers.

The enforcement is a test rather than AGENTS.md guidance: the failure mode is a routine automated update, which instructions cannot stop and a deterministic check can. AGENTS.md is unchanged.
