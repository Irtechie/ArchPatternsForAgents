---
slice_id: "09"
title: "Durable asynchronous job and reconciliation"
status: ready-after-blockers
owner: later-executor
owning_component: "docs/architecture-patterns (documentation; component table absent here)"
blockers: ["00","02","07","08"]
blocker_status: pending
resume_condition: "All blocker outputs and their receipts pass"
verification: verification-only
test_level: document-contract
functional_risk: low-documentation-only
execution_class: documentation
model_tier: medium
model_requirements: ["local file tools", "contract reasoning", "follow explicit invariant and negative scenarios"]
escalation_triggers: ["conflicting parent invariant", "duplicate catalog owner", "runtime implementation needed to finish documentation"]
token_budget: 3500
cost_tier: 2
cheaper_option_ruled_out: "Existing component declarations identify directories but cannot express this behavior; reuse the foundation template."
hitl: false
expected_files: ["docs/architecture-patterns/durable-job.md", "docs/architecture-patterns/proof/09-review.md"]
proof_check: {kind: artifact, path: "docs/architecture-patterns/proof/09-review.md"}
---

# Durable asynchronous job and reconciliation

## Observable outcome
A fresh executor can locate the responsible role, recognize the counterexample, and design a conformance test without choosing a framework.

**Invariant:** A long-running operation has durable identity and queryable state independent of the initiating request or chat.

**Concrete flow:** A render or ingest request returns a job ID; a restarted client asks the owner for its actual state.

**Bolted-on warning:** Web request holds the only job state, disconnect marks work failed, or multiple callers each retry the same operation.

## Contract to specify
Submit identity, accepted/running/terminal states, lease/heartbeat if needed, cancellation semantics, result reference, reconciliation.

## Failure cases and required proof
Cases: Worker crash; client disconnect; duplicate delivery; expired lease; cancel/completion race; owner restart.
Required observable result: Duplicate delivery cannot create a second logical job; unknown state is reconciled; terminal transitions obey documented race rules.
Turn these into individually named Given/When/Then scenarios. For each, identify the observation boundary, exact pass/fail condition, and whether it needs a deterministic unit test, integration test, actual caller probe, or quality evaluation. These are proof specifications, not executed application tests.

## Ordered work
1. Read the foundation and dependency pattern cards. Identify this pattern's responsibility and its exclusions. Pass: no other card acquires duplicate decision authority.
2. Author the card using the foundation template. Expand every contract item above; explain the normal flow and each failure transition. Pass: no unspecified failure is treated as success.
3. Write a good example and the concrete counterexample above, showing the minimal correction in responsibility placement. Pass: a reader can point to the violated invariant and owning role.
4. Add conceptual Python and TypeScript mappings. Name roles and normal native constructs, not hypothetical library APIs; keep code bodies out. Pass: both mappings preserve the same contract, with runtime-specific differences explicitly recorded.
5. Add the named proof scenarios, tradeoffs, and adoption notes. Pass: every invariant has an observable failure case; no framework is mandatory.
6. Complete proof/09-review.md with a field-completeness matrix, invariant-to-scenario mapping, dependency consistency, and language neutrality review. Mark this plan done only when all pass.

## Scope and tradeoff
A database-backed job record may suffice. Specify at-least-once effects and compensation honestly; do not prescribe a queue or orchestrator.
Dependencies order the documentation. They are not instructions to install every dependency pattern as a separate component.

## Execution rules
Read the adjacent requirements.md and the foundation outputs first. Work only in the named documentation files and this plan's execution receipt. Preserve unrelated work. Do not create services, packages, dependencies, application code, commits, or deployments. If the target already exists, compare and update it; never overwrite unreviewed work. No subagents are required.

The specified budget is a planning estimate for produced text, not authorization to create a token-budget goal. If a contract cannot be made coherent without a new product decision, record the exact conflict and stop this slice. Do not reinterpret the invariant merely to pass review.
