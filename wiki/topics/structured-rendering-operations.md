---
aliases: [rendering implications, agent rendering contract, rendering operation vocabulary]
---
# Structured rendering operations

Rendering implications are encoded as closed operations so coding agents receive deterministic operands instead of paragraphs that can drift between adapter skills.

## Current state

- The operation vocabulary is `direct`, `branch`, `format`, `component`, `anchor`, `asset`, `resolved-content`, `reference`, `iterate`, and `pass-through`.
- Operands cover value paths, renderer IDs, prop and attribute bindings, edit targets, stable keys, null handling, constraints, conditions, and closed prohibition codes.
- Every operation is labeled `official`, `contract-derived`, or `consumer-policy`; validation prevents those authority channels from being conflated.
- The React/Next.js guidance profile binds renderer IDs to exact package entrypoints without embedding imports or prose in each field contract.
- Optimizely rich text reads `.json`, binds the SDK `RichText` renderer, applies editing attributes at the wrapper boundary, and prohibits HTML-string coercion.
- Selection-gated alternatives use closed discriminators; Optimizely SaaS `contentReference` resolves explicitly as link or media rather than loading two contradictory rendering paths.

## Decisions

- Canonical source records may contain official or contract-derived operations, never consumer policy.
- Consumer guidance may add operations but cannot mutate native identity or official value shape.
- Source evidence remains in the catalog and documentation; compact resolved contracts omit it before agent execution.
- Projection and selection behavior is recorded in [deterministic consumer projection](./deterministic-consumer-projection.md).
