# ARCH-007 — Authorized tool command

Version: 0.1.0-draft  
Status: proposed  
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use for any effectful action proposed by an agent. Avoid using it to decorate an already owner-authenticated deterministic command. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. A model proposes; deterministic code validates schema, actor, scope, and current authority before the owning service performs a side effect.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Proposer | non-authoritative candidate |
| Validator | schema and authority |
| Owner | side effect |
| Receipt store | durable observed outcome |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

An assistant proposes a scheduling change. The owner validates it under current authorization and returns a durable result.

The boundary contract names: operation/argument identity, actor, authorization policy, expected revision, idempotency key, result or unknown outcome, receipt. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Prompt injection | Typed failure or explicit unknown state | Authoritative owner |
|  changed approved arguments; timeout after commit | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

Unauthorized or changed commands are rejected; same identity and payload do not duplicate; ambiguous completion reconciles.

## Examples

**Conformant placement.** An assistant proposes a scheduling change. The owner validates it under current authorization and returns a durable result.

**Counterexample.** Model output executes directly, approval is a vague global flag, or a caller claims success before owner confirmation.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Proposer, Validator, Owner, Receiptstore; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Proposer, Validator, Owner, Receiptstore; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-007@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.

