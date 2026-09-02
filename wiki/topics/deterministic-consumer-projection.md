---
aliases: [selected contract, compact agent context, consumer projector, projection manifest]
---
# Deterministic consumer projection

Consumer integration is designed around an exact adapter and an exact set of already-selected field IDs, keeping unrelated CMS vocabularies and provenance out of model context.

## Current state

- The public API resolves requested fields in canonical order and fails closed for unknown or cross-profile IDs.
- The public CLI exposes only `sync`, `check`, and `resolve`; producer scanning, review, validation, and generation remain repository scripts.
- Projections are marker-owned, digest-bound, byte-deterministic, path-safe, symlink-safe, and atomically promoted with rollback.
- Adapter shards contain compact structured contracts. Human documentation tables, evidence text, and inactive adapters are not added to selected agent input.
- Named selected-contract fixtures record exact byte ceilings and deterministic token-estimate ceilings; unreviewed growth in either measurement fails validation.

## Decisions

- Phase 1 provides the package and projector contracts but does not modify AI Orchestration or COS.
- Future AI Orchestration work will inject one structured `inputs.cmsFieldContracts` value after provenance validation; it will not add vocabulary prose to a skill load list.
- Future COS work will consume compact official vocabulary data without coding-agent rendering policy.
- Ratchet updates use the explicit `pnpm run context:update` producer command and require review alongside the contract change.
- The underlying authority is [catalog authority](./catalog-authority.md); agent behavior is defined by [structured rendering operations](./structured-rendering-operations.md).
