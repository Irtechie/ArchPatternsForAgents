---
slice_id: drift-01
title: Portable ownership and boundary drift report
owning_component: verification-scripts
blockers: []
owner: delegated
status: done
blocker_status: clear
model_tier: large
model_requirements: ["Node file tools", "CLI design", "failure-path reasoning", "test execution"]
escalation_triggers: ["new dependency needed", "contract ambiguity changes user-visible behavior", "unrelated source changes overlap"]
token_budget: 14000
cost_tier: 6
cheaper_option_ruled_out: "Existing surface validator and component table do not inventory source or compare revision-bound drift evidence."
execution_class: code
functional_risk: medium
test_level: functional-cli
hitl: false
expected_files: [scripts/check-architecture-drift.mjs, tests/check-architecture-drift.test.mjs, package.json]
proof_check: {kind: command, command: "npm run test:drift"}
---
Read docs/brainstorms/2026-09-08-architecture-drift-requirements.md in full. Implement R1-R5 and R7-R8; the source defines exact policy, CLI, exit semantics and report guarantees.
1. Write representative CLI tests for clean, violated, malformed and changed-policy cases. Pass: negative expectations fail without implementation.
2. Implement strict input validation and scope-safe source inventory using built-ins; pass R1-R4 including explicit unknowns.
3. Implement immutable report output and comparison with validated integrity-bound baselines; pass R5.
4. Expand negative cases under R7 with real subprocess CLI calls, temporary consumers and portable link tests where supported.
5. Add npm test:drift and prepend aggregate npm test. Run narrow proof; pass all assertions. Return changes, proof and limitations without commits.
No other files, no registry service, no source code snippets in emitted findings. Worker is not alone and must preserve coordinator docs.
