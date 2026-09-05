---
slice_id: "13"
title: "Application lineage, composition, and adoption handoff"
status: ready-after-blockers
owner: later-executor
owning_component: "docs/architecture-patterns (documentation; component table absent)"
blockers: ["00","01","02","03","04","05","06","07","08","09","10","11","12"]
blocker_status: pending
resume_condition: "All pattern cards and review receipts pass"
verification: verification-only
test_level: document-contract
functional_risk: low-documentation-only
execution_class: documentation
model_tier: medium
model_requirements: ["file tools", "cross-document consistency", "structured example validation"]
escalation_triggers: ["application source edits needed", "invariant conflict between cards", "permanent catalog publication needed"]
token_budget: 5500
cost_tier: 2
cheaper_option_ruled_out: "Reuse pattern cards and existing component declarations; a new registry or enforcement tool is unnecessary."
hitl: false
expected_files: ["docs/architecture-patterns/adoption-record.md", "docs/architecture-patterns/composed-example.md", "docs/architecture-patterns/application-adoption-plan-template.md", "docs/architecture-patterns/proof/13-review.md"]
proof_check: {kind: artifact, path: "docs/architecture-patterns/proof/13-review.md"}
---

# Know what an application adopted and what it changed

## Outcome
An application can record its architectural composition, distinguish derivation from conformance, and identify which owner-local proof must be refreshed after a change.

## Adoption record contract
Document an application-local record at docs/architecture/pattern-adoptions.json. It includes:
- schema version, application/repository identity, assessed revision, and review date;
- each pattern ID, exact version, immutable source locator and hash, and relation (uses, adapted-from, historically-derived-from);
- chosen scope and role-to-existing-component/code/public-contract mappings;
- authoritative state owner and external provider references;
- preserved invariant IDs and explicitly changed/rejected invariant IDs with rationale and local decision reference;
- evidence references with command, environment, relevant source/config/model revision, timestamp, observed result, and coverage limits;
- status proposed, adopted-unverified, verified-at-revision, diverged, or retired;
- recheck triggers and an explicit migration/supersession record.

A hash proves identity, not behavior. A verified receipt applies only to its tested revision/environment and invariant scope. A pattern-breaking deviation marks that pattern diverged; it cannot be relabeled as harmless customization. A compatible local specialization preserves every claimed invariant. Historical derivation requires an origin record; otherwise use uses or adapted-from.

## Ordered work and acceptance
1. Author adoption-record.md and a syntactically valid JSON example inside it. Pass: no field asserts fictional application compliance; use a plainly synthetic application and example references.
2. Write composed-example.md for a synthetic research assistant: UI -> application domain -> context/retrieval and model port -> validated tool command -> provider; asynchronous work returns a job identity. Show where each role lives across independently owned repos, without one repo per pattern. Pass: one authoritative writer per datum, and every cross-repo interaction has an owner.
3. Show how a three-pattern read-only app can omit tools, jobs, memory, and attention. Pass: readers can adopt only what they need without inheriting a platform.
4. Introduce four bad changes: foreign DB write, duplicate business decision, provider SDK spread, and undocumented invariant waiver. Map each to an invariant and evidence that detects it. Pass: structural checks and semantic review are distinguished honestly.
5. Write application-adoption-plan-template.md. Its executor first reads the named target's AGENTS, current source and dirty state, existing component map/tests, selects one real workflow, records current behavior, binds only needed cards, and writes a target-local implementation plan with actual files and real proof commands. No placeholders qualify as runnable application implementation plans. Pass: it cannot claim adoption merely by adding JSON.
6. Describe review on changes: determine affected declared roles, inspect relevant invariant changes, rerun owner-local tests and real boundary checks where needed, then update evidence. Existing architecture-drift may supply structural proof; do not invent a command that does not exist.
7. Write proof/13-review.md covering all R1-R10, all twelve cards, negative examples, JSON parse result, composition consistency, and unverified application/runtime boundaries.

## Required scenarios
- Upstream pattern version changes: existing consumer remains pinned until explicit migration.
- Local code changes after proof: old proof is historical, not current verification.
- Broken invariant with a written rationale: status diverged, not verified.
- Remote catalog unavailable: a recorded immutable specification copy or pinned source remains readable; application execution does not depend on a registry call.
- Novel app responsibility: produce an owner-local design decision; do not force it into the closest named pattern.
- Pure documentation review: receipt explicitly says no application execution or live conformance was verified.

## Execution rules
Read the adjacent requirements.md and the foundation outputs first. Work only in the named documentation files and this plan's execution receipt. Preserve unrelated work. Do not create services, packages, dependencies, application code, commits, or deployments. If the target already exists, compare and update it; never overwrite unreviewed work. No subagents are required.

The specified budget is a planning estimate for produced text, not authorization to create a token-budget goal. If a contract cannot be made coherent without a new product decision, record the exact conflict and stop this slice. Do not reinterpret the invariant merely to pass review.
