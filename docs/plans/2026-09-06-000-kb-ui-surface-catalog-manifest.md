---
type: kb-manifest
kb_id: kb-2026-09-06-ui-surface-catalog
brainstorm_path: docs/brainstorms/2026-09-06-ui-surface-catalog-requirements.md
created: 2026-09-06
status: reviewed
workflow_shape: pipeline-change
objective_contract: true
blocker_lifecycle_contract: true
scope-verified-files:
  - .github/skills/ui-craft/SKILL.md
  - package.json
  - package-lock.json
  - scripts/check-ui-surface-catalog.mjs
  - tests/check-ui-surface-catalog.test.mjs
  - docs/ui-surfaces/surface-declaration.schema.json
  - docs/ui-surfaces/README.md
  - docs/ui-surfaces/platform-lanes.md
  - docs/ui-surfaces/consumer-declaration.example.json
  - docs/ui-surfaces/references/invalid-card-grid.json
  - docs/ui-surfaces/references/invalid-missing-verb.json
  - docs/ui-surfaces/references/invalid-table.json
  - docs/ui-surfaces/references/valid-dependency-map.json
  - docs/ui-surfaces/references/valid-document-workspace.json
  - docs/ui-surfaces/references/valid-event-stream.json
  - docs/ui-surfaces/references/valid-operator-topology.json
  - docs/ui-surfaces/references/valid-staged-review.json
  - docs/context/PROJECT.md
  - docs/context/operations/testing.md
  - docs/context/eval-map.md
  - docs/context/memory-maintenance.md
  - docs/context/kb/kb-completions.txt
  - docs/solutions/best-practices/ui-surface-contract-single-source-2026-09-06.md
  - docs/brainstorms/2026-09-06-ui-surface-catalog-requirements.md
  - docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - docs/plans/2026-09-06-001-spec-ui-surface-contract-plan.md
  - docs/plans/2026-09-06-002-docs-ui-surface-reference-plan.md
  - docs/plans/2026-09-06-003-skill-ui-surface-selection-plan.md
  - todo.md
  - todo-done.md
done_check:
  kind: command_exit
  command: npm test
  expect: 0
  why: The new surface declaration checker and existing UI registry proof both pass.
model_tier_contract:
  allowed: [small, medium, large]
  default: medium
model_selection_contract:
  timing: work-time
  decision_owner: orchestrator
  default_owner: delegated
  owner_choice: current-or-delegated
  max_owner_decisions_per_slice: 1
  catalog: active-host-plus-user-local
  delegated_fallback: same-tier-then-higher
  automatic_downward_routing: false
  automatic_cross_owner_fallback: false
  amr_required: false
workspace_isolation_contract:
  coordinator_owned_lifecycle: true
  plan_run_worktree_default: true
  internal_integration_target: plan-run-branch
  default_branch_delivery_owner: kb-complete
  allowed_modes: [shared-serial]
gate_ledger:
  - gate_id: brainstorm-to-plan
    owner_skill: kb-brainstorm
    gate_scope: implementation
    status: passed
    required_evidence:
      - requirements path exists
      - question gate has no unresolved ask-now or research-first item
      - external framework choices are explicitly non-binding
    proof:
      - docs/brainstorms/2026-09-06-ui-surface-catalog-requirements.md
    blockers: []
    passed_at: 2026-09-06T11:20:00-04:00
    allowed_next_action: kb-plan docs/brainstorms/2026-09-06-ui-surface-catalog-requirements.md
  - gate_id: plan-to-work
    owner_skill: kb-plan
    gate_scope: implementation
    status: passed
    required_evidence:
      - manifest and all three slice plans exist
      - DAG has no missing blockers or cycles
      - each slice declares expected files, proof, model tier, and functional classification
      - objective check covers the surface checker and existing registry tests
    proof:
      - docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
      - docs/plans/2026-09-06-001-spec-ui-surface-contract-plan.md
      - docs/plans/2026-09-06-002-docs-ui-surface-reference-plan.md
      - docs/plans/2026-09-06-003-skill-ui-surface-selection-plan.md
    blockers: []
    passed_at: 2026-09-06T11:20:00-04:00
    allowed_next_action: kb-work docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - gate_id: slice-slice-001-to-done
    owner_skill: kb-work
    gate_scope: implementation
    status: passed
    required_evidence:
      - protected oracle was RED before implementation and its SHA is unchanged
      - Node unit test and declaration-fixture checker pass
      - scope check found no unexplained files
      - no browser proof is required for a CLI-only validator
    proof:
      - node --test tests/check-ui-surface-catalog.test.mjs
      - node scripts/check-ui-surface-catalog.mjs
      - tests/check-ui-surface-catalog.test.mjs sha256 1f2415157579693a32bf9420d79020cf6877b1fa5aeb47584b770984c676d00d
    blockers: []
    passed_at: 2026-09-06T11:28:00-04:00
    allowed_next_action: kb-work docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - gate_id: slice-slice-002-to-done
    owner_skill: kb-work
    gate_scope: implementation
    status: passed
    required_evidence:
      - five worked surface kinds have valid checked declarations
      - platform lanes frame external frameworks as non-binding choices
      - local documentation links resolve
      - no browser proof is required for reference documentation
    proof:
      - node scripts/check-ui-surface-catalog.mjs
      - local UI-surface Markdown link check
    blockers: []
    passed_at: 2026-09-06T11:35:00-04:00
    allowed_next_action: kb-work docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - gate_id: slice-slice-003-to-done
    owner_skill: kb-work
    gate_scope: implementation
    status: passed
    required_evidence:
      - UI-craft directs surface selection before theme selection
      - npm test invokes the surface checker and existing UI registry proof
      - UI-craft local links resolve
      - functional CLI classification is satisfied by npm test
    proof:
      - npm test
      - UI-craft local Markdown link check
    blockers: []
    passed_at: 2026-09-06T11:43:00-04:00
    allowed_next_action: kb-work docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - gate_id: work-to-complete
    owner_skill: kb-work
    gate_scope: implementation
    status: passed
    required_evidence:
      - all three slice-to-done gates passed
      - npm test passed after integration
      - scope-verified-files lists all implementation, documentation, and lifecycle files
      - project map and testing operations were refreshed
    proof:
      - npm test
      - docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
      - docs/context/PROJECT.md
      - docs/context/operations/testing.md
    blockers: []
    passed_at: 2026-09-06T11:45:00-04:00
    allowed_next_action: kb-finalize docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
  - gate_id: complete-to-ship
    owner_skill: kb-finalize
    gate_scope: implementation
    status: passed
    required_evidence: [final npm test, resolved multi-agent review, refreshed project memory]
    proof: [npm ci, npm test, docs/context/eval-map.md, docs/context/memory-maintenance.md]
    blockers: []
    passed_at: 2026-09-06T12:20:00-04:00
    allowed_next_action: kb-complete docs/plans/2026-09-06-000-kb-ui-surface-catalog-manifest.md
slices:
  - id: slice-001
    title: Define and validate UI surface declarations
    path: docs/plans/2026-09-06-001-spec-ui-surface-contract-plan.md
    blockers: []
    verification: tdd
    test_level: unit
    functional_risk: narrow
    model_tier: medium
    model_tier_reason: The schema must encode the product boundary precisely enough to reject default-layout loopholes.
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
    status: done
    owner: agent
    blocked_reason: ""
    resume_when: ""
    next_agent_action: Create the schema, fixtures, and deterministic checker.
    human_action: ""
    can_continue_other_slices: false
    notes: "scope-forecast: loaded 6 expected files plus fixtures; review amendment: checker now compiles the published schema, uses explicit fixture envelopes, and reports invalid input paths; protected oracle updated with explicit reason and SHA; proof: npm ci and npm test; qa-browser: skipped — no UI-reachable behavior changed; memory-impact: durable; areas=ui-surface contract and verification command; refresh=pending"
  - id: slice-002
    title: Publish worked UI surface and rendering references
    path: docs/plans/2026-09-06-002-docs-ui-surface-reference-plan.md
    blockers: [slice-001]
    verification: verification-only
    test_level: none
    functional_risk: narrow
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
    status: done
    owner: agent
    blocked_reason: ""
    resume_when: ""
    next_agent_action: Add the surface taxonomy, platform lanes, and validated reference declarations.
    human_action: ""
    can_continue_other_slices: false
    notes: "scope-forecast: loaded 4 expected path groups; review amendment: consumer example records catalog provenance and documents catalog-owned versus vendored checker use; proof: npm test; qa-browser: skipped — reference documentation has no UI-reachable behavior; memory-impact: durable; areas=surface taxonomy and platform lanes; refresh=pending"
  - id: slice-003
    title: Route UI craft through surface selection
    path: docs/plans/2026-09-06-003-skill-ui-surface-selection-plan.md
    blockers: [slice-001, slice-002]
    verification: integration
    test_level: functional-cli
    functional_risk: narrow
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
    status: done
    owner: agent
    blocked_reason: ""
    resume_when: ""
    next_agent_action: Add the selection step and expose the new check in the documented verification path.
    human_action: ""
    can_continue_other_slices: true
    notes: "scope-forecast: loaded 3 expected files; scope-check: forecast=3 changed=2 implementation files discovered=0 unexplained=0; scope-forecast-unused: README.md - its prepared root README update remains on the separate local branch codex/root-readme-catalog-entrypoint; test-level: functional-cli; functional-risk: narrow; proof: npm test; qa-browser: skipped — no rendered application behavior changed; memory-impact: durable; areas=UI-craft route and verification command; refresh=done"
---

# KB: UI surface catalog

## Origin

Brainstorm: `docs/brainstorms/2026-09-06-ui-surface-catalog-requirements.md`

## Workflow Shape

`pipeline-change` — the work adds a catalog contract, deterministic proof,
reference material, and a cross-runtime skill routing rule.

## Slice Overview

| # | Slice | Blocked By | Verification | HITL | Status |
|---|---|---|---|---|---|
| 1 | Define and validate UI surface declarations | - | tdd | no | done |
| 2 | Publish worked UI surface and rendering references | slice-001 | verification-only | no | done |
| 3 | Route UI craft through surface selection | slice-001, slice-002 | integration | no | done |

## Finalization record

- review-mode: multi-agent; P0=0 P1=6(resolved) P2=6(resolved) P3=1(resolved)
- follow-up-resolution: resolved 13, logged 0, blocked 0
- proof: `npm ci` and `npm test` exited 0 after review fixes. The 11-node-test
  suite covers schema parity, consumer input, and invalid command paths.
- functional proof: CLI behavior is covered by consumer-path and invalid-path
  command tests; browser proof is not applicable to this catalog-only change.
- compound: `docs/solutions/best-practices/ui-surface-contract-single-source-2026-09-06.md`
- learn: no new instinct promoted; two resolved-review observations were recorded.
- evolve: skipped; completion count is 1.
- kb-map-refresh: done - project, testing, and evaluation-map context refreshed.
- memory-maintenance: one stale-doc signal recorded; compact skipped because no startup bloat was found.
- cleanup: no feature screenshots; `todo.md` retains no active task from this work.
