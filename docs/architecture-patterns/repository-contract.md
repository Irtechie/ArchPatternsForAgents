# ARCH-002 — Repository contract

Version: 0.1.0-draft
Status: proposed
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use across independently deployed or versioned owners. Avoid a shared SDK when a small published contract is sufficient. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. A provider owns published semantics and a consumer owns its adapter; collaboration crosses a versioned contract, never private source or foreign storage.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Provider | public semantics and validation |
| Consumer adapter | translation and retry policy |
| Contract fixture | compatibility evidence |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

A TypeScript application calls a Python domain API through its own adapter; provider validation remains in the provider repository.

The boundary contract names: contract version, request/result schemas, typed failures, timeout, retry owner, compatibility window, fixtures. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Old consumer/new provider | Typed failure or explicit unknown state | Authoritative owner |
|  removed field; timeout after possible commit | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

Supported requests remain valid; incompatible requests fail explicitly; uncertain outcome reconciles rather than silently replaying.

## Examples

**Conformant placement.** A TypeScript application calls a Python domain API through its own adapter; provider validation remains in the provider repository.

**Counterexample.** A sibling source import, shared database write, or retry that turns a provider rejection into permission.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Provider, Consumeradapter, Contractfixture; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Provider, Consumeradapter, Contractfixture; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-002@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.
