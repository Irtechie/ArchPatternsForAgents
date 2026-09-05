---
slice_id: "01"
title: "Domain-owned decisions and state"
status: ready-after-blockers
owner: later-executor
owning_component: "docs/architecture-patterns (documentation; component table absent here)"
blockers: ["00"]
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
expected_files: ["docs/architecture-patterns/domain-authority.md", "docs/architecture-patterns/proof/01-review.md"]
proof_check: {kind: artifact, path: "docs/architecture-patterns/proof/01-review.md"}
---

# Domain-owned decisions and state

## Observable outcome
A fresh executor can locate the responsible role, recognize the counterexample, and design a conformance test without choosing a framework.

**Invariant:** One domain owns each business decision and its authoritative writes. Other repositories hold identifiers or explicitly derived projections.

**Concrete flow:** Assistant UI requests a change to an application decision through the career domain; it does not edit the career database.

**Bolted-on warning:** A conversation handler persists its own application status or reproduces the domain's eligibility rule.

## Contract to specify
Write ownership, decision identity, expected revision, authorized actor, conflict outcome, authoritative result.

## Failure cases and required proof
Cases: Two conflicting writers; domain unavailable; stale projection; untrusted model proposal.
Required observable result: A stale write conflicts without overwriting accepted state; a disconnected caller cannot claim success.
Turn these into individually named Given/When/Then scenarios. For each, identify the observation boundary, exact pass/fail condition, and whether it needs a deterministic unit test, integration test, actual caller probe, or quality evaluation. These are proof specifications, not executed application tests.

## Ordered work
1. Read the foundation and dependency pattern cards. Identify this pattern's responsibility and its exclusions. Pass: no other card acquires duplicate decision authority.
2. Author the card using the foundation template. Expand every contract item above; explain the normal flow and each failure transition. Pass: no unspecified failure is treated as success.
3. Write a good example and the concrete counterexample above, showing the minimal correction in responsibility placement. Pass: a reader can point to the violated invariant and owning role.
4. Add conceptual Python and TypeScript mappings. Name roles and normal native constructs, not hypothetical library APIs; keep code bodies out. Pass: both mappings preserve the same contract, with runtime-specific differences explicitly recorded.
5. Add the named proof scenarios, tradeoffs, and adoption notes. Pass: every invariant has an observable failure case; no framework is mandatory.
6. Complete proof/01-review.md with a field-completeness matrix, invariant-to-scenario mapping, dependency consistency, and language neutrality review. Mark this plan done only when all pass.

## Scope and tradeoff
Keep pure business policy local to its domain. A small app may implement all roles in one process; a pattern is not a demand for another service.
Dependencies order the documentation. They are not instructions to install every dependency pattern as a separate component.

## Execution rules
Read the adjacent requirements.md and the foundation outputs first. Work only in the named documentation files and this plan's execution receipt. Preserve unrelated work. Do not create services, packages, dependencies, application code, commits, or deployments. If the target already exists, compare and update it; never overwrite unreviewed work. No subagents are required.

The specified budget is a planning estimate for produced text, not authorization to create a token-budget goal. If a contract cannot be made coherent without a new product decision, record the exact conflict and stop this slice. Do not reinterpret the invariant merely to pass review.
