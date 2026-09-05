# ARCH-011 — Operational evidence

Version: 0.1.0-draft
Status: proposed
Parent: [ARCH-000](ownership-and-seams.md)

## Problem, use, and avoid

Use whenever a readiness or recovery claim matters. Avoid collecting secret-bearing raw payloads as generic evidence. The problem is a bolted-on responsibility that bypasses its owner or makes a derived representation authoritative.

## Invariants

1. Operational claims follow correlated evidence across the real consumer boundary; maintainers have an explicit diagnosis and recovery path.
2. A caller treats typed failure or unknown outcome as unresolved, never as success.
3. A catalog card describes a proof obligation; an application must provide owner-local evidence before claiming conformance.

## Roles and authority

| Role | Owns |
|---|---|
| Consumer probe | observed boundary |
| Owner receipt | decision/effect |
| Evidence store | correlated record |
| Runbook | diagnosis and recovery |

The named authoritative owner is the system of record. Other state is derived and must remain traceable to it.

## Flow and boundary contract

A request ID connects UI outcome, owner decision, and external effect; the runbook reconciles an unknown result.

The boundary contract names: correlation/run IDs, revision and deployment identity, typed outcome, timestamps, evidence scope, redaction, recovery-action owner. It carries identity and revision where concurrency or replay matters. Authorization is evaluated by the owning role, not by model text or retrieved content.

## Failure and recovery

| Situation | Required visible result | Recovery owner |
|---|---|---|
| Broken transport with healthy provider | Typed failure or explicit unknown state | Authoritative owner |
|  stale deployment; missing receipt | No silent fallback or overwrite | Contract or operation owner |
| Reconciliation after uncertainty | Query or replay only under documented identity | Owning service |

A consumer probe fails for broken transport even when provider health is green; a runbook traces failure to the responsible owner.

## Examples

**Conformant placement.** A request ID connects UI outcome, owner decision, and external effect; the runbook reconciles an unknown result.

**Counterexample.** Mock success is called readiness, logs have no correlation, or recovery only works for its author.

**Minimal correction.** Move the responsibility behind the named owner boundary; retain only an adapter, identifier, or derived projection outside it.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Invalid or unauthorized input | Owner public boundary | Rejection has no authoritative effect | deterministic behavior test |
| Timeout or interruption | Caller-to-owner boundary | Outcome is typed unknown or reconciled, not assumed | integration or caller probe |
| Repeated identity | Owner state boundary | At most one documented logical effect | deterministic or integration test |
| Counterexample introduced | Declared role boundary | The violated invariant is named and detected | structural review plus owner-local test |

## Conceptual language mappings

- **Python:** model the roles as explicit modules or protocols such as Consumerprobe, Ownerreceipt, Evidencestore, Runbook; use typed results or exceptions only at the boundary, and keep the authoritative write in the owner module.
- **TypeScript:** model the roles as interfaces or classes such as Consumerprobe, Ownerreceipt, Evidencestore, Runbook; expose discriminated result unions at the boundary, and keep provider-specific or effectful details behind the owner.

These mappings are conceptual. Cancellation, transactions, scheduling, and transport guarantees must be proven by the selected runtime rather than inferred from matching names.

## Tradeoffs, composition, and adoption

This pattern is optional. It composes with [ARCH-000](ownership-and-seams.md) and any card whose role boundary it protects. Its cost is an explicit contract and evidence burden; its benefit is a predictable location for responsibility and a detectable counterexample.

An application pins ARCH-011@0.1.0-draft with a content hash, maps roles to actual code, and records only proof it truly ran. A changed invariant requires explicit migration; a compatible specialization preserves every claimed invariant.

## Change history

- 0.1.0-draft — initial catalog proposal.
