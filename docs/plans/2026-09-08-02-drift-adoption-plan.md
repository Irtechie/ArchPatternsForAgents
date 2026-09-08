---
slice_id: drift-02
title: Drift adoption and recurring review guidance
owning_component: documentation
blockers: [drift-01]
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
expected_files: [README.md, docs/architecture-patterns/drift-detection.md, docs/architecture-patterns/drift-policy.example.json, docs/architecture-patterns/README.md, docs/context/PROJECT.md]
proof_check: {kind: command, command: "npm test"}
---
Read requirements and completed CLI first.
1. Document setup, policy fields, exact commands for first and later reports, exit codes, finding identities, and model-free/harness-independent use. Pass: examples match actual CLI.
2. Supply a minimal consumer-owned example policy and demonstrate it against a temporary source tree. Pass: clean source exits 0, forbidden source exits 1, historic policy change exits 1.
3. Document owner-local contract tests, delta review, baseline change decision, exception owner/removal condition, and periodic workflow trace template. Pass: no automatic conformance/approval claim and no automation added.
4. Link catalog and project map. Pass: local links resolve and aggregate checks pass.
Coordinator may draft prose during 01 but must reconcile with actual outputs before completion. User's explicit scope amendment includes the reviewed main-checkout README changes and current checker documentation in this delivery; preserve source checkout while preparing the authorized combined commit.
