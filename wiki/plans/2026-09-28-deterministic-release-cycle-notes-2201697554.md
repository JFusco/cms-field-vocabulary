---
status: "implemented"
executed: true
evidence: ["https://github.com/JFusco/cms-field-vocabulary/issues/75; scripts/semantic-release-notes.cjs; .releaserc.cjs"]
source_tool: "repository"
source: "/private/tmp/deterministic-release-cycle-notes-plan.md"
topics: ["release-operations"]
digest: "2201697554cfdc7b6d671c9b2a520855a614d9cce3d8919082fa6ca0c706143e"
---

# Deterministic release-cycle notes

## Objective

For repositories that already own a release cycle, generate release notes
deterministically without AI credentials, release variables, or optional prose
fallbacks.

## Delivery

- Keep release execution after a user-authorized merge; agent delivery still
  stops after opening the pull request.
- Generate release notes locally from conventional commits.
- Emit Summary, Breaking changes, Features, Fixes, and Other changes exactly once
  and in that order, including explicit empty sections.
- Use the deterministic generator from semantic-release for GitHub releases and,
  in CMS Field Vocabulary, the npm release and changelog.
- Add regression coverage and document the release cycle in AGENTS.md.
