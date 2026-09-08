---
manifest_schema: 3
kb_id: architecture-drift-evidence
status: reviewed
objective_contract: true
model_tier_contract: true
workspace_isolation_contract: true
proof_governor_contract: true
pre_slice_review_contract: true
pre_slice_review:
  status: not-required
  source: docs/brainstorms/2026-09-08-architecture-drift-requirements.md
  source_sha256: 8798101828c9cca5112ce4786093d709e0964a81b522ba0f362335b7be48e5c8
  mode: requirements-wide
  not_required_reason: "Bounded local CLI; inputs, report identity, negative tests and no-write boundaries are explicit; integrated CLI review required."
delivery: {mode: pr, merge_authorized_by: "current explicit p2d"}
done_check: "npm test passes; CLI negative scenarios pass; one integrated semantic review resolved; PR accepted if protections permit."
---

# Architecture drift evidence
Source: [requirements](../brainstorms/2026-09-08-architecture-drift-requirements.md).
Plans: [01 executable drift report](2026-09-08-01-drift-checker-plan.md), [02 adoption guidance](2026-09-08-02-drift-adoption-plan.md).

## Scope and workspace
Existing verification-scripts and documentation components; tests are existing test convention. No component, dependency, server or workflow addition. Worktree E:/ArchPatterns-drift-has-receipts, branch codex/drift-has-receipts, base origin/main 44303f1. Main checkout README dirt preserved; not a dependency.
Portable setup: installed recovery survey failed because Get-Command returned two Git binaries as one executable path. Used documented direct Git fallback: git worktree add -b codex/drift-has-receipts E:/ArchPatterns-drift-has-receipts origin/main. Common Git queue is active; native kbcheck/leases absent, no native receipt is fabricated.

## Plan validation and gate

Scope amendment, 2026-09-08: user explicitly requested fixing README and committing both together. Reviewed source README diff and SHA256 578cd1c9ab71614973d1d2df6c3cfe281170bf1026737c3dcd9f412a37948630; copied those exact authorized edits into this worktree, then added harness-independence and drift-tool usage/limits. Root README is now included in slice 02 and final shipping scope. Source checkout remains preserved until integration.
- Requirements R1-R5/R7-R8 -> 01; R6/R8 -> 02.
- DAG: 01 then 02; one mutating implementation worker, coordinator docs only.
- Expected paths exist as owning directories; no new package/dependency.
- Source SHA256 verified above; acceptance/failure cases present in both plans.
- manifest-contract unavailable in this installed consumer; portable field/DAG/path checks performed.
- plan-to-work: passed (2026-09-08), evidence: source hash, bounded two-node DAG, explicit CLI and failure contracts, isolated clean baseline before planning.
- allowed_next_action: kb-work docs/plans/2026-09-08-kb-architecture-drift-manifest.md
- Execution proof and completion gates: pending.

## Work completion
- drift-01: done; npm run test:drift passes 18/19 with one OS-denied file-symlink setup skip; directory-junction proofs passed.
- drift-02: done; actual published policy passed clean/violation/policy-weakening CLI smoke; documentation links passed.
- work-to-complete: passed, 2026-09-08. Evidence: docs/reviews/2026-09-08-drift-proof.json, full npm test exit 0, syntax and diff checks exit 0.
- allowed_next_action: kb-finalize docs/plans/2026-09-08-kb-architecture-drift-manifest.md
- Review/ship gates remain pending.

## Finalization and delivery gate
- Integrated proof: docs/reviews/2026-09-08-drift-proof.json; npm test, syntax and whitespace checks passed.
- One read-only CLI readiness reviewer: docs/reviews/2026-09-08-drift-review.json; zero actionable findings. Source and proof hashes verified.
- follow-up-resolution: resolved 0, logged 0, blocked 0.
- Complete-to-ship: passed, 2026-09-08; allowed_next_action: kb-ship this manifest, then authorized kb-land if repository protections permit.
- Final scope: README.md; package.json; scripts/check-architecture-drift.mjs; tests/check-architecture-drift.test.mjs; docs/architecture-patterns/{README.md,drift-detection.md,drift-policy.example.json}; docs/context/PROJECT.md; this objective's requirements, three plan files, two review receipts; todo.md and todo-done.md.
- RUN: full npm test (18 drift tests passed, 1 OS-denied link setup skipped; 11 surface tests and all existing UI checks passed), syntax checks, actual CLI example, documentation links, diff checks. REUSE: bound unchanged implementation proof after documentation-only completion metadata.
- ship-gate-validator: unavailable in installed consumer; proof/hash/scope/authority inspected directly.
- No deployment or post-merge synchronization configured. No external application conformance claimed.
