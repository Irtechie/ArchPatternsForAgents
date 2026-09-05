---
slice_id: "11"
title: "Consumer-visible receipts and recovery"
status: ready-after-blockers
owner: later-executor
owning_component: "docs/architecture-patterns (documentation; component table absent here)"
blockers: ["00","02"]
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
expected_files: ["docs/architecture-patterns/operational-evidence.md", "docs/architecture-patterns/proof/11-review.md"]
proof_check: {kind: artifact, path: "docs/architecture-patterns/proof/11-review.md"}
---

# Consumer-visible receipts and recovery

## Observable outcome
A fresh executor can locate the responsible role, recognize the counterexample, and design a conformance test without choosing a framework.

**Invariant:** Operational claims follow correlated evidence across the real consumer boundary; maintainers have an explicit diagnosis and recovery path.

**Concrete flow:** A request ID connects UI outcome, owner decision, and external effect; the runbook explains how to reconcile an unknown result.

**Bolted-on warning:** Passing mock tests called production readiness, logs with no correlation, or a recovery script only its author understands.

## Contract to specify
Correlation/run IDs, revision and deployment identity, typed outcome, timestamps, evidence scope, redaction, recovery action owner.

## Failure cases and required proof
Cases: Transport broken while provider healthy; stale deployment; missing receipt; partial failure; secret-bearing payload.
Required observable result: A real consumer probe fails when its transport is broken even if provider health is green; a runbook traces an example failure to the responsible owner.
Turn these into individually named Given/When/Then scenarios. For each, identify the observation boundary, exact pass/fail condition, and whether it needs a deterministic unit test, integration test, actual caller probe, or quality evaluation. These are proof specifications, not executed application tests.

## Ordered work
1. Read the foundation and dependency pattern cards. Identify this pattern's responsibility and its exclusions. Pass: no other card acquires duplicate decision authority.
2. Author the card using the foundation template. Expand every contract item above; explain the normal flow and each failure transition. Pass: no unspecified failure is treated as success.
3. Write a good example and the concrete counterexample above, showing the minimal correction in responsibility placement. Pass: a reader can point to the violated invariant and owning role.
4. Add conceptual Python and TypeScript mappings. Name roles and normal native constructs, not hypothetical library APIs; keep code bodies out. Pass: both mappings preserve the same contract, with runtime-specific differences explicitly recorded.
5. Add the named proof scenarios, tradeoffs, and adoption notes. Pass: every invariant has an observable failure case; no framework is mandatory.
6. Complete proof/11-review.md with a field-completeness matrix, invariant-to-scenario mapping, dependency consistency, and language neutrality review. Mark this plan done only when all pass.

## Scope and tradeoff
Do not log secrets or full private prompts by default. A receipt describes observed evidence, not proof of every semantic claim.
Dependencies order the documentation. They are not instructions to install every dependency pattern as a separate component.

## Execution rules
Read the adjacent requirements.md and the foundation outputs first. Work only in the named documentation files and this plan's execution receipt. Preserve unrelated work. Do not create services, packages, dependencies, application code, commits, or deployments. If the target already exists, compare and update it; never overwrite unreviewed work. No subagents are required.

The specified budget is a planning estimate for produced text, not authorization to create a token-budget goal. If a contract cannot be made coherent without a new product decision, record the exact conflict and stop this slice. Do not reinterpret the invariant merely to pass review.


