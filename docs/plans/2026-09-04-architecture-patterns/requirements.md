# Language-independent architecture patterns: requirements

Date: 2026-09-04
Authority: user's P2D request in this conversation, rebasing the prepared packet onto the existing ArchPatternsForAgents catalog repository.
Status: execution requirements; proposed pattern design, not a claim about existing application conformance.

## Outcome
Create a small catalog that lets a maintainer or agent identify where a responsibility belongs, how it crosses repositories, which pattern an application adopted, and whether a change violates that pattern. Produce reusable specifications first; do not build a new application framework.

## Parent architecture
Explicit domain ownership with contract-mediated collaboration across independently owned repositories. Each domain owns its business decisions, authoritative state, and public semantics. Consumers own their integration code. Provider repairs belong in the provider repository. Shared documentation does not become a shared runtime, shared business database, or application monorepo.

Roles can be modules, processes, or services. Do not create one repository or service per pattern. Repository segmentation follows responsibility and independent lifecycle; deployment topology and implementation language are separate decisions.

## Requirements
R1: Every pattern has a stable ID/version, invariant, problem, use/avoid conditions, roles, data/control flow, boundary contract, authority, failure/recovery, tradeoffs, counterexample, and observable proof scenarios.
R2: Specifications remain meaningful without naming a language or framework. Python and TypeScript mappings demonstrate this without pretending equivalent runtime guarantees. Rust or other bindings can be added later when a real consumer needs them.
R3: Each pattern names at least one plausible addition that violates it and how a maintainer would detect that addition.
R4: Applications record composition and lineage locally: immutable catalog reference, adopted version, role-to-code mapping, proof, deviations, and status. Adoption is not proof of historical derivation.
R5: Catalog version changes never silently change application declarations. Changed invariants are breaking changes; cosmetic corrections are not.
R6: Verification distinguishes documentation completeness, behavioral conformance, live caller readiness, and probabilistic output quality.
R7: Consumers retain independent repositories and owner-local tests. No copied business rules, cross-repo private source imports, or foreign database writes.
R8: One bounded authoring plan per pattern, explicit blockers, ordered work, scope, negative examples, and acceptance evidence.
R9: Optional patterns stay optional. A small application can use three patterns without taking the other nine.
R10: The final catalog includes one composed example and a target-local adoption recipe. No app is declared migrated, compliant, or safe without source and runtime evidence appropriate to that claim.

## Scope and authority
This P2D run authors documentation, examples, and review receipts under `docs/architecture-patterns` in this existing catalog repository. No runtime code, infrastructure, ports, dependencies, application migration, skills installation, or automatic application-task launch is part of the implementation scope. Standard P2D Git delivery applies after implementation and review.

The former governance-folder packet was staging material. This repository is the identified pattern-catalog owner, so the packet is rebased here rather than creating a second catalog authority. Catalog publication remains a Git delivery concern; application adoption remains owner-local and deferred.

## Evidence and cheapest sufficient outcome
- Local source inspected: E:/Dev/Tools/working-skill-repo/config/architecture-components.json and cmd/kbcheck/architecture_drift.go. Existing drift checking recognizes declared, undeclared, phantom, and undocumented components. It does not establish pattern lineage or behavioral adherence. Extend/reuse that owner only if a future application needs machine enforcement.
- E:/Dev/Operations/codex-setup/AGENTS.md assigns cross-project plans here and implementation to owning repositories. Its old llmcommune paths are stale; current user instructions identify E:/Dev/AI/remote/FleetController as canonical.
- Existing reliability-repo documentation describes an evidence wiki, not this proposed pattern catalog.
- Prior decision-memory research supplies the ownership/projection distinction; its old runtime-status claims have not been reverified and are not used as current facts.
- Anthropic distinguishes predefined workflows from agents choosing their own course: https://www.anthropic.com/engineering/building-effective-agents . This supports keeping fixed workflows and bounded agent loops distinguishable.
- AWS describes safe retry semantics using idempotent APIs: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/ . This supports explicit request identity and uncertain-outcome handling.
The twelve-part taxonomy is our proposed design, not a standard attributed to those sources.

Cheapest sufficient outcome: documentation and owner-local adoption records. No new framework, registry service, generator, validator, SDK, or plugin. Existing component checks are useful prior art but insufficient alone for R1-R6.

## Assumptions and deferred choices
Safe assumption: “this architecture pattern” means the ownership-and-seams discussion; no specific source was supplied or found in the bounded lookup. A supplied source can replace this parent without application changes.
Verified decision: `E:\ArchPatterns` is the current Git-owned catalog workspace; this rebased packet is its documentation-authoring contract.
Deferred: concrete application binding, catalog release mechanism, language-specific static checks, and runtime test commands. Those require an actual target and source inspection.
No unresolved intent question prevents the documentation-authoring scope.

## Acceptance and self-check
All R1-R10 map to the execution index. Every pattern plan contains a behavioral outcome, negative scenario, expected failure result, and non-goal. The dependency graph is acyclic. Pattern and application status cannot be inferred from prose alone. No code generation or application changes are required to finish the catalog.
Requirements-wide external review: not required; scope is reversible documentation authoring with explicit contracts, negative cases, and no unresolved security or product authority decision. This is a self-check, not independent review.
