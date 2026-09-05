---
manifest_schema: 3
pre_slice_review_contract: true
objective_contract: true
model_tier_contract: true
workspace_isolation_contract: true
proof_governor_contract: true
blocker_lifecycle_contract: true
workflow_shape: multi-slice-documentation
status: ready
objective: "Deliver a language-independent architecture-pattern catalog and adoption documentation without claiming application conformance."
requirements_source: "docs/plans/2026-09-04-architecture-patterns/requirements.md"
requirements_sha256: "285B137D5CE6566044E9A08F42B27DE2483FB861B45DC4C8CCBB3BEBF648DEB2"
pre_slice_review:
  status: not-required
  source: "docs/plans/2026-09-04-architecture-patterns/requirements.md"
  mode: requirements-wide
  not_required_reason: "Reversible documentation-only scope with explicit invariants, counterexamples, acceptance criteria, and no unresolved application implementation decision."
plan_run_worktree_policy: "Use the manifest-owned codex/patterns-paper-cuts worktree; preserve unrelated work."
delivery_authority:
  push_topic: true
  open_pr: true
  merge_remote_default: true
  push_remote_default: false
  integrate_remote_default: false
done_check: "All fourteen slice review receipts exist; the catalog index maps ARCH-000 through ARCH-012; the final receipt maps R1-R10 and states that application conformance remains unverified."
---

# Architecture pattern catalog manifest

## Scope

This manifest owns only catalog documentation, examples, review receipts, project memory, and the catalog index under `docs/architecture-patterns`. It does not authorize application code, application migration, infrastructure, services, dependencies, or runtime conformance claims.

## Ordered slices

| ID | Plan | Blockers | Expected proof |
|---|---|---|---|
| 00 | `docs/plans/2026-09-04-architecture-patterns/00-foundation-plan.md` | — | `docs/architecture-patterns/proof/00-review.md` |
| 01 | `docs/plans/2026-09-04-architecture-patterns/01-domain-authority-plan.md` | 00 | `docs/architecture-patterns/proof/01-review.md` |
| 02 | `docs/plans/2026-09-04-architecture-patterns/02-repository-contract-plan.md` | 00, 01 | `docs/architecture-patterns/proof/02-review.md` |
| 03 | `docs/plans/2026-09-04-architecture-patterns/03-model-port-plan.md` | 00, 01 | `docs/architecture-patterns/proof/03-review.md` |
| 04 | `docs/plans/2026-09-04-architecture-patterns/04-context-envelope-plan.md` | 00, 01, 03 | `docs/architecture-patterns/proof/04-review.md` |
| 05 | `docs/plans/2026-09-04-architecture-patterns/05-grounded-retrieval-plan.md` | 00, 02, 04 | `docs/architecture-patterns/proof/05-review.md` |
| 06 | `docs/plans/2026-09-04-architecture-patterns/06-decision-memory-plan.md` | 00, 01, 04 | `docs/architecture-patterns/proof/06-review.md` |
| 07 | `docs/plans/2026-09-04-architecture-patterns/07-authorized-tool-command-plan.md` | 00, 01, 02, 03 | `docs/architecture-patterns/proof/07-review.md` |
| 08 | `docs/plans/2026-09-04-architecture-patterns/08-bounded-workflow-plan.md` | 00, 03, 07 | `docs/architecture-patterns/proof/08-review.md` |
| 09 | `docs/plans/2026-09-04-architecture-patterns/09-durable-job-plan.md` | 00, 02, 07, 08 | `docs/architecture-patterns/proof/09-review.md` |
| 10 | `docs/plans/2026-09-04-architecture-patterns/10-attention-loop-plan.md` | 00, 01, 06, 09 | `docs/architecture-patterns/proof/10-review.md` |
| 11 | `docs/plans/2026-09-04-architecture-patterns/11-operational-evidence-plan.md` | 00, 02 | `docs/architecture-patterns/proof/11-review.md` |
| 12 | `docs/plans/2026-09-04-architecture-patterns/12-evaluation-boundary-plan.md` | 00, 03, 11 | `docs/architecture-patterns/proof/12-review.md` |
| 13 | `docs/plans/2026-09-04-architecture-patterns/13-adoption-and-composition-plan.md` | 00–12 | `docs/architecture-patterns/proof/13-review.md` |

## Gate ledger

| Gate | Status | Evidence | Allowed next action |
|---|---|---|---|
| requirements-to-plan | passed | Rebased requirements preserve R1-R10, scope, counterexamples, and proof boundary. | validate plan structure |
| plan-to-work | passed | 2026-09-04 local structural validation found 14 slice plans, complete required metadata, all slice IDs referenced, and a local requirements source. | `kb-work docs/plans/2026-09-04-000-kb-architecture-pattern-catalog-manifest.md` |
| work-to-complete | pending | All slice proof receipts and catalog checks required. | none |
| complete-to-ship | pending | Final exact-tree proof and semantic review required. | none |

## Protected claims

- Documentation completeness is not application conformance.
- Behavioral conformance, live caller readiness, and model-output quality require distinct, owner-local evidence.
- A catalog reference or file path is not proof of historical derivation or adoption.
