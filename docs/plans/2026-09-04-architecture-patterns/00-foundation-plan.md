---
slice_id: "00"
title: "Define pattern grammar and parent architecture"
status: ready
owner: later-executor
owning_component: "docs/architecture-patterns (documentation; component table absent)"
blockers: []
blocker_status: clear
resume_condition: "None"
verification: verification-only
test_level: document-contract
functional_risk: low-documentation-only
execution_class: documentation
model_tier: medium
model_requirements: ["file tools", "bounded specification authoring"]
escalation_triggers: ["existing canonical catalog conflicts with this location"]
token_budget: 4500
cost_tier: 2
cheaper_option_ruled_out: "Existing component table has no pattern contract or adoption grammar; extend the documented ownership concepts."
hitl: false
expected_files: ["docs/architecture-patterns/README.md", "docs/architecture-patterns/pattern-template.md", "docs/architecture-patterns/ownership-and-seams.md", "docs/architecture-patterns/proof/00-review.md"]
proof_check: {kind: artifact, path: "docs/architecture-patterns/proof/00-review.md"}
---

# Define the parent and reusable pattern grammar

## Outcome
Later pattern authors can produce compatible, language-neutral cards without inventing their own formats.

## Ordered work and acceptance
1. Read requirements.md and this directory's README. Create docs/architecture-patterns/README.md describing its specification-only purpose and linking the twelve planned cards. Pass: implementation remains with application owners, and no catalog runtime dependency exists.
2. Write ownership-and-seams.md with ID ARCH-000, draft version 0.1.0, and status proposed. State one domain authority per decision, consumer-owned adapters, provider-owned contracts and repairs, independently owned repositories, and evidence at the consumer boundary. Pass: roles can share a process without losing ownership; multiple repos do not automatically earn conformance.
3. Write pattern-template.md with: ID, version, status, parent reference, problem, use/avoid conditions, invariant IDs, roles/owners, source-of-truth and derived-state table, data/control flow, boundary inputs/results/errors, trust/authorization, failure/recovery, positive example, counterexample, proof scenarios, language mappings, tradeoffs, composition, and change history. Pass: each field has a purpose and an example instruction.
4. Specify card IDs ARCH-001 through ARCH-012 using plan numbers. Parent relation is composition/constraint, not code inheritance. Distinguish uses, adapted-from, and historically-derived-from. Pass: no historical origin can be claimed merely by selecting a pattern.
5. Specify version policy: immutable released reference plus content hash; changed invariants increment major version once stable, draft changes remain visibly unaccepted; migration is explicit; no silent latest references. Pass: consumers can retain an older declaration honestly.
6. Review a miniature instance of the template against the parent. Include two violated invariants and demonstrate that the review detects them. Write proof/00-review.md; name missing/unverified evidence explicitly.

## Failure cases
A card containing only diagram boxes fails completeness. A card requiring a framework to explain its invariant fails neutrality. A card equating a directory name with verified conformance fails evidence review.

## Execution rules
Read the adjacent requirements.md and the foundation outputs first. Work only in the named documentation files and this plan's execution receipt. Preserve unrelated work. Do not create services, packages, dependencies, application code, commits, or deployments. If the target already exists, compare and update it; never overwrite unreviewed work. No subagents are required.

The specified budget is a planning estimate for produced text, not authorization to create a token-budget goal. If a contract cannot be made coherent without a new product decision, record the exact conflict and stop this slice. Do not reinterpret the invariant merely to pass review.
