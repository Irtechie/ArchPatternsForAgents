---
kb_id: kb-2026-09-06-ui-surface-catalog
slice_id: slice-003
title: Route UI craft through surface selection
blockers: [slice-001, slice-002]
verification: integration
test_level: functional-cli
functional_risk: narrow
execution_class: cli
model_tier: medium
model_tier_reason: The skill must integrate the new contract without weakening semantic HTML and accessibility rules already enforced by the registry.
model_requirements: [instruction design, repository-local integration, regression proof]
escalation_triggers: [The new routing contradicts an existing UI-craft rule, A checker or README command needs package-script changes]
workspace_mode: shared-serial
conflict_domains: [file:.github/skills/ui-craft/SKILL.md, file:package.json, file:README.md]
shared_resources: [git:integration-owner]
proof_check:
  kind: command_exit
  command: npm test
  expect: 0
hitl: false
expected_files:
  - path: .github/skills/ui-craft/SKILL.md
    op: edit
    scope: Adds surface declaration selection before theme and markup guidance.
  - path: package.json
    op: edit
    scope: Exposes the UI-surface checker through repository verification.
  - path: README.md
    op: edit
    scope: Links the UI surface catalog from the root entry point when the README branch is available for integration.
protected_oracles: []
status: done
owner: agent
blocked_reason: ""
resume_when: ""
next_agent_action: Add the selection step and expose the new check in the documented verification path.
human_action: ""
can_continue_other_slices: true
---

# Route UI craft through surface selection

## Behavior

Before selecting a theme or writing HTML, an agent selects and records a surface
declaration. The UI-craft skill then applies its existing semantic substrate,
accessibility, layout, and visual-finish rules within that chosen surface.

## Acceptance criteria

- The skill links the UI surface catalog before the theme-selection instructions.
- The skill states that a theme is a finish, not a substitute for a declared
  interaction topology.
- Repository `npm test` runs the new checker and the existing UI proof suite.
- The root README exposes the companion catalog if its separate README branch
  has been integrated; otherwise the work receipt records the follow-up.

## Scope boundary

This slice does not alter existing theme markup or loosen semantic, accessibility,
or reduced-motion rules.

## Dependency rationale

The skill routes to content and proof created by the first two slices.
