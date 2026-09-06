---
kb_id: kb-2026-09-06-ui-surface-catalog
slice_id: slice-002
title: Publish worked UI surface and rendering references
blockers: [slice-001]
verification: verification-only
test_level: none
functional_risk: narrow
execution_class: cli
model_tier: medium
model_tier_reason: The guide must translate interaction topology into platform-aware rendering choices without turning suggestions into mandates.
model_requirements: [technical writing, source attribution, architecture boundary reasoning]
escalation_triggers: [A recommendation needs an unverified claim about a framework, A reference conflicts with the declaration contract]
workspace_mode: shared-serial
conflict_domains: [file:docs/ui-surfaces]
shared_resources: [git:integration-owner]
proof_check:
  kind: command_exit
  command: node scripts/check-ui-surface-catalog.mjs
  expect: 0
hitl: false
expected_files:
  - path: docs/ui-surfaces/README.md
    op: create
    scope: Defines the surface taxonomy, capability ladder, and proof boundary.
  - path: docs/ui-surfaces/platform-lanes.md
    op: create
    scope: Separates service language from client renderer and lists non-binding platform lanes.
  - path: docs/ui-surfaces/references/*.json
    op: create
    scope: Adds validated declarations for five worked surface kinds.
  - path: docs/ui-surfaces/consumer-declaration.example.json
    op: create
    scope: Shows the consumer-owned declaration, including catalog provenance.
protected_oracles: []
status: done
owner: agent
blocked_reason: ""
resume_when: ""
next_agent_action: Add the surface taxonomy, platform lanes, and validated reference declarations.
human_action: ""
can_continue_other_slices: false
---

# Publish worked UI surface and rendering references

## Behavior

The companion catalog gives agents positive examples for exploration, operation,
decision, creation, and monitoring. Each example declares its dominant
structure and why it uses semantic, 2D, GPU, or native-composition rendering.
The platform guide separates service language from the client surface and links
to official, non-binding framework lanes.

## Acceptance criteria

- Each initial surface kind has a checked declaration and a positive dominant
  structure that is not a generic card grid.
- The guide identifies when a table is correct and when it is not.
- The platform guide identifies Three.js and optional React Three Fiber for
  qualifying JavaScript or TypeScript web work, and identifies the Rust/Tauri
  client-service boundary without requiring either.
- Every external recommendation is framed as a lane, not a mandated dependency.

## Scope boundary

This slice does not install or demonstrate external rendering frameworks. It
does not prescribe a UI library for an application's backend language.

## Dependency rationale

The declarations are checked by slice 001, so reference claims can be verified
against the same contract agents will consume.
