# ARCH-004 — Context envelope

Version: 0.1.0-draft
Status: proposed
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use when context comes from more than one source. Avoid a global history store for a single bounded request. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. One assembler supplies bounded, attributed context; retrieved content cannot gain authority or cross identity boundaries.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Assembler | bounded envelope |
| Authority source | facts and access policy |
| Retriever | attributed candidates |
| Model port | consumer only |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

A response receives task facts, authorized memory, and retrieved passages under an explicit budget and source labels.

The boundary contract names: actor/tenant/task scope, source authority, trust class, freshness, budget, truncation policy, selected-source IDs. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Cross-tenant result | Typed failure or explicit unknown state | Authoritative owner |
|  malicious instruction; oversized context | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

Unauthorized sources are excluded before delivery; truncation is visible; content never changes tool authorization.

## Examples

**Conformant placement.** A response receives task facts, authorized memory, and retrieved passages under an explicit budget and source labels.

**Counterexample.** Every tool appends arbitrary prompt text, retrieval changes authority, or shared history leaks across identities.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Assembler, Authoritysource, Retriever, Modelport; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Assembler, Authoritysource, Retriever, Modelport; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-004@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.
