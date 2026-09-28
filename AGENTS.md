## Git delivery flow

For repository changes that include delivery, complete this sequence:

1. Confirm the worktree is safe to switch, then switch to `main` and run
   `git pull --ff-only` so the branch point is the current remote main.
2. Create one actionable GitHub issue with the repository's canonical labels
   using the `github-issue-creator` workflow, and read the saved issue back
   before creating downstream artifacts.
3. Create `codex/<issue-number>-<short-slug>` from that updated `main`.
4. Implement only the issue scope, record substantive work in the wiki in the
   same delivery, and run `pnpm run verify:ci`.
5. Commit with a valid conventional message, then push the issue branch with
   ordinary Git commands.
6. Open a pull request with a conventional title and the canonical
   `.github/pull_request_template.md` body. Keep its level-two headings exactly
   once and in order; replace every placeholder with meaningful content,
   include `Closes #<issue-number>`, record verification and risk/rollback,
   and complete every required checkbox. Run `pnpm run lint:pr` before opening
   the PR and read the saved PR back afterward.
7. Stop after the pull request is open and verified. Never merge it, enable
   auto-merge, delete the delivery branch, or close the issue as part of this
   flow. Leave review and merging to the user.


## Release cycle

This repository publishes the public `cms-field-vocabulary` npm package. A
release begins only after the user merges a qualifying PR to `main`; the agent
delivery flow above never merges, tags, versions, or publishes.

- `scripts/semantic-release-notes.cjs` generates release notes from conventional
  commits with `Summary`, `Breaking changes`, `Features`, `Fixes`, and
  `Other changes` exactly once and in that order. Never hand-author, AI-generate,
  or conditionally omit this structure.
- Conventional commits determine the semantic version. Do not edit the package
  version, changelog, release tag, or GitHub Release manually.
- Before opening the PR, run `pnpm run release:preflight`,
  `pnpm run verify:ci`, `pnpm run test:packed`, and
  `npm pack --dry-run --ignore-scripts`.
- After a user-authorized merge, the `Release` workflow is the only publisher.
  It uses GitHub permissions and npm trusted publishing through OIDC; do not add
  release-note AI credentials or a long-lived npm token.
- When asked to monitor a release, verify the workflow revision, Git tag, GitHub
  Release, npm version, and provenance. If a run fails after an external side
  effect, inspect all four surfaces before retrying.

<!-- wiki-skill:start -->
## Context wiki

Use `wiki/` as this repository's durable record of executed plans, decisions, and substantive change history. Never bulk-load `wiki/`.

- For an exact current-code, file, symbol, or command question, inspect the named source or use targeted source `rg`; do not load history.
- For a direct single-topic history or rationale question, start at `wiki/INDEX.md` when it exists and open only the page it routes to.
- Only for a cross-page why, wiring, ownership, or impact question, run `node scripts/wiki/navigate.cjs --intent why --query "<terms>"` before opening wiki pages. Use `wiring` for ownership/dependencies and `impact` for change scope.
- Query with exact slugs, identifiers, symbols, or repository-qualified GitHub references. Never use a bare issue or PR number such as `#123`.
- When both endpoints are known, use exact `--from` and `--to` node IDs.
- Trust the router's deterministic weighted shortest route, which accounts for relationship cost, hubs, and page bytes. Open only its itinerary; never add candidates, neighbors, or adjacent pages.
- Read itinerary pages sequentially, never speculatively in parallel, and stop as soon as the answer is grounded.
- If resolution is ambiguous, rerun with one returned exact ID; never open every candidate.
- Never use `grep`, `find`, or recursive `rg` as initial wiki discovery. After a router miss, run at most one root-scoped exact search: `rg -n --fixed-strings "<exact term>" wiki/`. If it fails, inspect one known source path or ask one focused question; never widen the search.
- Never read generated graph JSON directly.
- After executing a Claude, Codex, or Cursor plan, archive it and add the journal/topic updates in the same delivery per `wiki/MECHANICS.md`.
- Run `node scripts/wiki/discover-plans.cjs` to recover missed plans, `node scripts/wiki/build-graph.cjs` after wiki edits, and `node scripts/wiki/check.cjs` before completion.
- The Sigma.js graph indexes only Markdown under `wiki/`; never add code nodes.

This managed block was installed for Codex, Cursor, and Claude (via `@AGENTS.md` in `CLAUDE.md`).
<!-- wiki-skill:end -->
