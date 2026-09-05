# ARCH-001 — Domain authority

Version: 0.1.0-draft
Status: proposed
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use when policy or status has more than one caller. Avoid inventing a separate service when one process can hold the roles. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. One domain owns each business decision and its authoritative writes; other roles retain only identifiers or explicitly derived projections.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Domain | decision and authoritative record |
| Consumer | request adapter and presentation |
| Projection | rebuildable read model |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

A UI requests a career-status change from the career domain. The domain checks the expected revision and returns the accepted state.

The boundary contract names: ownership, decision ID, expected revision, authorized actor, conflict outcome, authoritative result. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Two writers | Typed failure or explicit unknown state | Authoritative owner |
|  unavailable domain; stale projection | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

A stale write conflicts without overwriting accepted state, and a disconnected caller cannot claim success.

## Examples

**Conformant placement.** A UI requests a career-status change from the career domain. The domain checks the expected revision and returns the accepted state.

**Counterexample.** A conversation handler writes its own status record or reimplements eligibility policy.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Domain, Consumer, Projection; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Domain, Consumer, Projection; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-001@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.
