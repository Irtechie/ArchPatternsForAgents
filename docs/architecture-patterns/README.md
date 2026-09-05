# Architecture Patterns for Agents

This is a specification catalog, not a framework, shared runtime, or claim that an application conforms. Each card describes one optional pattern: its invariant, ownership boundary, failure behavior, counterexample, and proof scenarios. Application owners decide whether to adopt a card and must record their own source and runtime evidence.

Start with [ARCH-000: ownership and seams](ownership-and-seams.md), then use the [card template](pattern-template.md). The catalog currently contains ARCH-001 through ARCH-012 plus an [adoption record](adoption-record.md) and [composed example](composed-example.md).

## Versioning and identity

A consumer records the exact card ID, semantic version, immutable locator, and content hash. A changed invariant is a breaking major-version change; a corrected typo or clarified example is not. Draft versions remain proposed and never replace a consumer's pinned reference. `uses`, `adapted-from`, and `historically-derived-from` are different relations: only an origin record supports the last claim.

## Proof boundary

Card reviews establish documentation coverage. Owner-local deterministic tests establish behavioral invariants. Consumer-boundary probes establish live readiness. Evaluation datasets establish probabilistic model quality. None substitutes for another.

## Catalog

| ID | Pattern |
|---|---|
| ARCH-001 | [Domain authority](domain-authority.md) |
| ARCH-002 | [Repository contract](repository-contract.md) |
| ARCH-003 | [Model port](model-port.md) |
| ARCH-004 | [Context envelope](context-envelope.md) |
| ARCH-005 | [Grounded retrieval](grounded-retrieval.md) |
| ARCH-006 | [Decision memory](decision-memory.md) |
| ARCH-007 | [Authorized tool command](authorized-tool-command.md) |
| ARCH-008 | [Bounded workflow](bounded-workflow.md) |
| ARCH-009 | [Durable job](durable-job.md) |
| ARCH-010 | [Attention loop](attention-loop.md) |
| ARCH-011 | [Operational evidence](operational-evidence.md) |
| ARCH-012 | [Evaluation boundary](evaluation-boundary.md) |
