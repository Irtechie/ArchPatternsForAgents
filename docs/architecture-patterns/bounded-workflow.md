# ARCH-008 — Bounded workflow

Version: 0.1.0-draft  
Status: proposed  
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use for multi-step processes with observable termination. Avoid wrapping a single deterministic call in an artificial loop. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. Code owns workflow state, budgets, and termination; a model may choose only transitions the workflow permits.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Workflow owner | state machine |
| Model | permitted choice |
| Tool adapter | bounded invocation |
| Checkpoint | restart state |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

A research run persists gather/evaluate stages and a remaining budget, then ends with a typed outcome.

The boundary contract names: run/stage identity, allowed transitions, step/time/cost budgets, cancellation, checkpoint, failure/needs-input/completed outcomes. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Repeated poor output | Typed failure or explicit unknown state | Authoritative owner |
|  invalid transition; unavailable tool | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

Exhaustion terminates; invalid transitions fail; restart does not repeat confirmed effects; quality failure differs from runtime failure.

## Examples

**Conformant placement.** A research run persists gather/evaluate stages and a remaining budget, then ends with a typed outcome.

**Counterexample.** The prompt is the state machine, retries nest without bound, or an agent redefines success.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Workflowowner, Model, Tooladapter, Checkpoint; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Workflowowner, Model, Tooladapter, Checkpoint; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-008@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.

