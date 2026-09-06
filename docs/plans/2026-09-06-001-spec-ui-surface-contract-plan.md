---
kb_id: kb-2026-09-06-ui-surface-catalog
slice_id: slice-001
title: Define and validate UI surface declarations
blockers: []
verification: tdd
test_level: unit
functional_risk: narrow
execution_class: cli
model_tier: medium
model_tier_reason: The contract must encode the product boundary precisely enough to reject default-layout loopholes.
model_requirements: [Node test authoring, JSON schema design, deterministic failure-case reasoning]
escalation_triggers: [The contract cannot distinguish a justified table from a default table, The checker requires browser rendering to answer the declared constraints]
workspace_mode: shared-serial
conflict_domains: [file:package.json, file:scripts, file:docs/ui-surfaces]
shared_resources: [git:integration-owner]
proof_check:
  kind: command_exit
  command: node scripts/check-ui-surface-catalog.mjs
  expect: 0
hitl: false
expected_files:
  - path: docs/ui-surfaces/surface-declaration.schema.json
    op: create
    scope: Defines the required declaration fields and allowed values.
  - path: docs/ui-surfaces/references/*.json
    op: create
    scope: Valid and invalid declaration fixtures.
  - path: scripts/check-ui-surface-catalog.mjs
    op: create
    scope: Deterministically validates declaration fixtures and rejects invalid layouts.
  - path: tests/check-ui-surface-catalog.test.mjs
    op: create
    scope: Exercises valid declarations and rejects missing verbs and unearned primary layouts.
  - path: package.json
    op: edit
    scope: Adds a narrow UI-surface check script and includes it in the test command.
protected_oracles:
  - path: tests/check-ui-surface-catalog.test.mjs
    role: behavior oracle for the declaration validator
    sha256: 1f2415157579693a32bf9420d79020cf6877b1fa5aeb47584b770984c676d00d
    update_policy: requires explicit plan update
    update_reason: Review added fixture-wide schema parity, fixture-envelope, and CLI input-failure coverage.
status: done
owner: agent
blocked_reason: ""
resume_when: ""
next_agent_action: Create the schema, fixtures, and deterministic checker.
human_action: ""
can_continue_other_slices: false
---

# Define and validate UI surface declarations

## Behavior

A machine-readable declaration names a surface kind, primary user verb,
dominant structure, rendering lane, supporting elements, any primary table or
card rationale, semantic requirements, and proof obligations. A deterministic
checker accepts complete valid declarations and rejects an unearned card-grid or
table primary structure.

## Acceptance criteria

- The checker accepts a valid declaration for each initial reference surface.
- The checker rejects a missing user verb, an unknown rendering lane, and a
  primary card grid or table without an explicit rationale.
- The checker emits actionable failure text without needing a browser or model.

## Test scenarios

1. Run the checker with valid explore, operate, decide, create, and monitor
   fixtures; it exits zero.
2. Run it with an invalid card-grid fixture; it exits nonzero and names the
   missing rationale.
3. Run it with an invalid table fixture; it exits nonzero and names the
   missing data-shape rationale.

## Scope boundary

This slice does not create a browser-rendered application, select a framework,
or determine an application's visual finish.

## Dependency rationale

The reference and skill slices need a stable declaration vocabulary and proof
before they can make selection claims.
