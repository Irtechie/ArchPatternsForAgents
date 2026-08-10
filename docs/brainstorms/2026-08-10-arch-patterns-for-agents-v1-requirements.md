# ArchPatternsForAgents — V1 Requirements

Status: draft for review
Date: 2026-08-10
Successor to: the pre-repo `<proposed_plan>` (superseded; changes recorded in "What changed and why")

## Problem

Coding agents make architecture decisions willy-nilly. Given the same product description twice, an agent produces two different structures. Within a single long session it drifts from whatever structure it started with. And because no decision was ever named, there is no reference against which a reviewer can say "this is wrong" — only "this feels off."

The cost is not that agents pick bad patterns. Frontier models know Transactional Outbox and Bounded Context perfectly well. The cost is that they pick **unnamed, unpinned, unrepeatable** ones, so nothing downstream can check the work.

## Goal

A reusable catalog of concrete architecture patterns that does two jobs:

1. **Prescribe** — before code is written, a decision is named and pinned, so the agent is not inventing structure per file.
2. **Identify** — after code exists, a reviewer or a check can compare it against the named decision and locate the slop.

Job 2 is the one that gives the catalog its shape. A pattern entry that cannot be used to identify a violation is a textbook article, not a tool.

## Non-goals for V1

- Automatic, unsupervised recommendation. A human accepts or revises the proposal.
- Application code, project scaffolds, folder templates, or framework choices.
- Copying the catalog into `working-skill-repo`. This repo is the **companion**; the skill repo consults it and never vendors it.
- Modifying the Ops repositories in any way.

## Core design decision: roles, not rules

The industry-standard pattern schema (context, forces, resulting context, consequences) is written to teach a human who has time to read prose. It is the wrong shape here, because neither an agent mid-session nor a reviewer scanning a diff will read prose.

My first attempt at a fix was to enumerate *violations* per pattern. That was also wrong, for an instructive reason: you cannot enumerate all the ways code can be wrong, so an enumerated list silently licenses everything it forgot to mention.

The correct primitive is the inverse. **Each pattern declares the finite set of roles it admits.** Roles are enumerable; violations are not. Three detectors then fall out mechanically:

| Signal | Meaning |
|---|---|
| Code filling **no** role in the pattern | Bloat. It has no home. This is the slop detector. |
| **N components filling one role** | Duplication. "Why do we have four of these?" becomes a query, not an opinion. |
| A role with **no filler** | Incomplete, or the pattern was the wrong choice. |

This is why the catalog is worth building even though the model already knows what MVC is. Knowing a pattern is not the same as holding a finite role inventory to diff a repository against. The second is checkable; the first is vibes.

Every entry therefore carries:

| Field | Purpose |
|---|---|
| `roles` | The finite set of responsibilities the pattern admits. The load-bearing field. |
| `role_signature` | How to recognise a component filling each role — observable, not descriptive. |
| `cardinality` | Per role: exactly-one, one-per-aggregate, many. This is what makes duplication detectable rather than arguable. |
| `check` | The query or script that maps code to roles. Tiered: grep heuristic, graph query, or fitness function. |
| `blind_spots` | What the check cannot see, so silence is never read as conformance. |
| `scope` | Which decision this pattern answers. Same-scope patterns compete; cross-scope compose. |
| `exemplar` | The canonical implementation of each role, for imitation. See "the codebase is the prompt" below. |

Descriptive fields retained: context, use/avoid conditions, quality effects (conditional, never scored), costs, failure modes, evidence, licensing.

Rule: **an entry without a role inventory and cardinalities is rejected.** If you cannot say what parts the pattern has and how many of each, it cannot identify bloat, and it does not earn its place.

## Why classical patterns transfer to LLMs — and which parts don't

This has to be answered explicitly, because it decides which patterns are worth carrying and how their rationale gets rewritten.

MVC and MVVM were justified by three things: human cognitive load, parallel work by different specialists, and testability through isolating logic from the UI framework. For an agent consumer the first is weak and the second is nearly irrelevant. Carrying those rationales across unexamined is cargo cult.

But those patterns have a fourth property nobody had to write down, because for humans it was ergonomics rather than a constraint: **predictable location**. An agent's binding constraint is retrieval — it can only modify what it can find and fit in context, and it will not read the whole repository. A pattern guaranteeing "this kind of logic lives in exactly one predictable place" is functioning as a retrieval index. For a human that was convenience. For an agent it is load-bearing.

There is also a force with no human analogue: **the codebase is the prompt.** An agent writing code deep into a session imitates the nearest existing example; it is not consulting a document. This inverts how duplication behaves. A human seeing four copies of a method gets annoyed and consolidates. An agent seeing four copies infers that four copies is the house style, and writes a fifth.

That is the actual explanation for simple applications with enormous codebases. It is not laziness. It is entropy compounding through imitation with nothing anchoring the structure. Which is why a canonical exemplar per role is not documentation — it is a control input, and it belongs in the entry.

Each entry therefore re-scores its rationale on axes that matter for the real consumer:

- **Locatability** — can the agent find the right place without reading the repo?
- **Blast radius** — how much must be held in context to change one thing safely?
- **Canonical exemplar** — is there exactly one obvious thing to imitate?
- **Checkability** — can conformance be decided by a query rather than by judgment?

Consequences worth stating up front: patterns whose value was *team coordination* (backend-for-frontend to separate two teams, microservices for organisational scaling) score materially lower for a single-agent consumer than the literature implies. Patterns creating predictable location and narrow interfaces score higher. MVC survives — on locatability and testability, not on cognitive load — and that changes when you would pick it.

## The glossary front door

The entry point is a task-shaped question — "I'm building a website that does these five things" — not a taxonomy to browse. This mirrors a convention the skill repo already uses: `kb-map` selects a **task-shaped traversal recipe** before expanding structural evidence, from a protected fixture at `evals/graph-routing/traversal-recipes.json`.

The glossary offers **compositions**, not atoms: two or three named, pre-validated pattern bundles fitting a stated workload, each with its combined role inventory. Per-scope alternatives live one level down, for tuning a chosen composition. Nobody asking "how do I build this" should be handed twenty-five atomic patterns to assemble themselves.

Entries may point outward — to reference repositories, upstream documentation, or existing implementations — rather than restating them. The value here is the role inventory and the check, not a re-hosted copy of Fowler.

## Ordering: the pattern is chosen before the first file

Retrofitting a pattern onto code that already exists is more expensive than writing the code, because every existing file is a fact to be renegotiated. The pattern must therefore be selected before any scaffold, page, route, or framework choice is committed.

The pre-repo plan already stated this as "prove no page or framework scaffold is selected before the architecture gate passes." An earlier review of mine dismissed that criterion as vacuous. That was wrong: it is not testing that the system avoids something it cannot do, it is the ordering constraint the whole approach rests on. It is reinstated as a hard gate.

The cost is accepted explicitly: choosing up front spends tokens before any code exists. That is the trade being made.

One real risk runs the other way. Committing to a pattern before requirements are understood produces cargo-cult structure — which is also slop, merely tidier. The mitigation is already in the selection rules: the do-nothing baseline is always a rankable candidate, and a decision with no evidence behind it is recorded as `uncovered` rather than guessed.

## Where the chosen pattern lives

An agent will not rediscover the architecture by reading the repository; that is the context-bloat problem that motivates the whole exercise. So the chosen pattern must sit on the retrieval path the agent already walks.

`kb-map` defines that path: it anchors to the project root and reads `todo.md`, then `docs/context/PROJECT.md`, which it describes as "the routing surface" and "a route map, never a work log." The standard layout it enforces already includes `docs/context/decisions/` and `docs/context/architecture/`.

Placement:

- The pinned decision record lives at `docs/context/decisions/architecture.md` in the target project, with the composition name, selected patterns, pinned catalog versions, and the role-to-location map.
- `PROJECT.md` carries a one-line pointer to it, so every `kb-map lookup` surfaces the pattern without loading the catalog.
- The role-to-location map is the part that earns its keep: it tells the agent where a given responsibility belongs before it starts searching, which is cheaper than any retrieval.

## Consumer and integration

The consumer is `Irtechie/working-skill-repo`. This repo is its companion pattern source. Inspection of the skill repo at HEAD establishes four constraints that the catalog must be designed around, rather than discovered later.

**1. The enforcement lane already exists.** `kb-check` states its rule as "prefer executable truth over model judgment — if a script can check it, run the script," and orchestrates through `cmd/kbcheck`. Pattern conformance is therefore a new *check type* in an existing harness, not a new mechanism. Do not build a parallel enforcement path.

**2. The anti-drift mechanism already exists, and it is the right one.** `kb-check` and `kb-plan` implement **protected oracles**: a behaviour target pinned by SHA, where "the test, fixture, scorer, snapshot, schema, or contract file used as the behavior target must still match the recorded SHA unless the plan explicitly updated the oracle. This prevents the model from moving the target after implementation starts."

That is precisely the willy-nilly problem, already solved for behaviour. V1's job is to extend it to **structure**. The pinned architecture decision record is registered as a protected oracle on the slice, so an agent that drifts must either match the record or visibly amend it. Amendment becomes an explicit, reviewable act instead of silent improvisation.

**3. There is precedent for a companion repo that degrades gracefully.** `kb-check` notes that `cmd/kbcheck` "belongs to this bundle's source repo and does not ship with an installed skill," and specifies a conditional fallback where a missing harness "never lowers the bar — it changes which command you run, not whether you prove the slice." The pattern catalog follows the same contract: when the companion is unavailable, the skill still demands a named, pinned architecture decision; it just cannot supply the menu or the automated checks.

**4. References are loaded lazily and in fragments.** `kb-plan` instructs loading `references/manifest-template.md` "only while writing the manifest." This is a hard layout constraint: the catalog cannot be one large document. Required layout —

- `patterns/<scope>/<pattern>.md` — one file per entry, loaded only when that decision is live
- `index.json` — the only always-loaded artifact: scope, pattern name, one-line discriminator. Must stay small enough to sit in context for a whole session.
- `schema/pattern.schema.json` — admission contract
- `checks/` — executable violation detectors, invoked by `kbcheck`

**Integration surface in the skill repo (thin, specified here, built there):**

| Skill | Change |
|---|---|
| selection | Resolve companion `index.json`, propose per-scope alternatives, emit the pinned decision record into the target project |
| `kb-plan` | Register the decision record as a protected oracle on affected slices |
| `kb-check` | New conformance check: code vs. record, using the companion's violation indicators |
| `kb-review` / `repo-critic` | Consult the record so deviations are named against a standard rather than described as a feeling |

## Translating human patterns for machine verification

This is the core work, and it is what makes the repo more than a restatement of Fowler.

Classical patterns delegate deviation-detection to a human reviewer's judgment. That worked because an experienced reviewer could look at code and feel that something was off. An LLM has no such reliable feel, and more importantly its judgment cannot be audited. So the tacit reviewer knowledge must be made explicit and queryable.

Translation procedure, applied per entry:

1. Enumerate the roles the pattern admits, and the cardinality of each.
2. Give each role an observable signature (`role_signature`).
3. Express the role mapping as the cheapest check that can fail: grep heuristic, graph query, or fitness function (`check`).
4. Record what the check cannot see (`blind_spots`), so its silence is not mistaken for conformance.
5. Name the canonical exemplar for each role, since the agent will imitate whatever it finds nearest.

Step 4 is mandatory. A check with unstated blind spots is worse than no check, because it converts "unverified" into "verified."

**Reuse the existing graph vocabulary.** `kb-map`'s graph routing already emits typed edges — `IMPLEMENTS`, `OVERRIDES`, `REFERENCES`, `CALLS_STATIC`, `CALLS_OBSERVED`, `READS_CONFIG`, `GENERATES`, `BUILDS`, `TESTS`, `DOCUMENTS` — and already grades evidence as `exact`, `observed`, `structural`, `heuristic`, or `llm-inferred`, with the rule that "LLM-inferred edges are never exact."

Role mapping should be expressed in those terms rather than inventing a parallel mechanism, and every conformance finding must carry its evidence class. A role assignment derived from `IMPLEMENTS` edges is structural evidence. One derived from the model's opinion is `llm-inferred`, and must be reported as such rather than presented as a verified violation. This is the difference between "the pattern says you're off track" and "the model feels you're off track," and the distinction has to survive into the output.

## Relationships

V1 ships three edge types only:

- `alternative_to` — same scope, competing answer
- `requires` — selecting A obliges B
- `conflicts_with` — A and B cannot both hold authority

Deferred until three real packets demonstrate the need: `precedes`, `composes_with`, `refines`, and the constraint solver (`any-of`, `exactly-one`, cardinality, ordering). At ~25 nodes a constraint solver enforces authoring typos, not architecture. Add edges when a packet cannot be expressed without them.

## Scopes

Patterns are partitioned by the decision they answer. Only same-scope patterns are ranked against each other.

1. Domain logic organisation
2. Deployment and modularity
3. Dependency boundaries
4. State and history authority
5. Integration and workflow
6. Presentation
7. Effects and safety
8. Proof and observability

Any decision that does not fall in a scope must be reported as `uncovered`, never silently forced into the nearest scope. See "Coverage failure" below.

## Seed catalog

**Domain and application structure** — Transaction Script; Layered/N-tier; Domain Model with Service Layer; Bounded Context; Modular Monolith; Hexagonal/Ports and Adapters; Web-Queue-Worker

**State, history, provenance** — Current-state CRUD authority; W3C PROV lineage; Append-only audit record; Selective Event Sourcing; CQRS; Materialized Read Model; Transactional Outbox; Idempotent Consumer

**Integration and workflow** — Anti-Corruption Layer; Pipes and Filters; Publish-Subscribe; Asynchronous Request-Reply; Durable Orchestrator

**Presentation, safety, proof** — Separated Presentation; Policy Decision Point / Policy Enforcement Point; Human-in-the-Loop Approval Checkpoint; Correlated Traces/Metrics/Logs; Architecture Fitness Functions

Every scope must contain a **do-nothing baseline** — plain current-state CRUD, direct call, no additional structure — so "add no pattern" is always a rankable candidate rather than an omission.

Expansion pack (not V1): microservices, Saga, retry, circuit breaker, backend-for-frontend, quarantine, compensating transaction, scoped capability tokens, health endpoints, SLO/error budgets, behavioural LLM evaluation.

## Selection

- Capture hard constraints plus 3–7 measurable quality scenarios (source, stimulus, environment, artifact, response, threshold), per SEI ADD.
- Deterministically hard-filter patterns whose avoid-conditions are triggered by the stated constraints. This step is code, not judgement.
- For each open decision, present 2–4 **materially different** alternatives from the surviving set — different mechanisms for the same decision, never unrelated patterns dressed as alternatives.
- Never collapse a trade-off into a single unexplained score.
- Conflicts block with a minimal explanation. No last-file-wins.
- Model architecture as semantic roles and typed edges, not mandatory folders. One small component may fill several roles.

**Open decision — is the selector deterministic code or an LLM?** This is unresolved and it changes the test plan. Current position: the *filter* is deterministic, the *comparison and narrative* are LLM-authored from catalog fields, and the *decision* is the human's. This must be confirmed before `kb-plan`.

## Output: the decision record

The selector emits a pinned, committed decision record — small enough to re-inject into an agent's context, not a document nobody re-reads. Contents:

- selected patterns with pinned catalog versions, per scope
- rejected alternatives and the complexity cost avoided
- data, source, and provenance ownership
- deterministic vs. LLM authority boundaries
- effect and approval rules
- required checks, inherited from each selected entry
- any `uncovered` decisions
- a `kb-compact` approval summary

Constraint: the re-injectable portion has a hard token budget. A 6,000-token packet will not survive a long session; a 600-token one might. Budget to be set in `kb-plan`.

## Coverage failure

The realistic failure is not a visible no-match. A closed-world catalog of 25 patterns will always return *something*, so the failure mode is a confidently-typed wrong pattern.

Required behaviour: when no pattern's context genuinely matches, or the decision falls outside all eight scopes, the selector emits `uncovered_decision`, hands it to the human, and marks that part of the record as unbacked. Coverage rate is measured on real inbound descriptions, not on synthetic ones authored by the catalog's own author.

## The Ops repositories

Reclassified. FinanceOps, LearnOps, LifeOps, HealthOps and HomeOps are **source material**, read-only, at pinned revisions — not an evaluation set.

They are mined for one thing: real instances of willy-nilly architecture, to generate violation indicators grounded in code that actually got written. That is what they are good for.

They are explicitly **not** evidence of selector quality. There is no ground truth for "the correct architecture of FinanceOps," all five share one author, and any catalog extended from them and then evaluated against them is fitting the test set. Leave-one-project-out does not fix a shared-author confound at n=5 and will not be claimed.

Verification: `git status` clean on all five at the end. This is a precondition, not a finding.

## Test plan

**Entry admission (blocking)**
- Reject entries lacking evidence, trade-offs, contraindications, licence provenance, or verifiable invariants.
- Reject entries lacking a violation indicator or a check.

**Composition correctness**
- Reject incompatible authority claims, e.g. CRUD and Event Sourcing over the same aggregate.
- Allow orthogonal composition, e.g. Modular Monolith + CQRS + approval-gated effects.
- Simple CRUD inputs must not draw DDD, CQRS, Event Sourcing, queues, agents, or microservices.

**Behavioural (the ones that can fail informatively)**
- *Counterfactual sensitivity* — a materially changed requirement changes the recommendation.
- *Paraphrase invariance* — reworded requirements do not. Caveat: if the selector is deterministic over structured scenario input, this is trivially true and proves nothing. Interpret only in light of the open selector decision above.
- *Bloat detection* — take a real codebase with a known pattern, map every component to a role, and count the components that map to none. Compare against a human pass over the same code. This is the primary V1 metric, because "code with no home in the pattern" is the operational definition of slop.
- *Duplication detection* — count roles filled by more components than their cardinality allows. Verify against known duplication.
- *Repeatability* — the same description run N times yields the same pinned decisions. This measures the willy-nilly problem directly.
- *Drift* — give an agent a decision record and a real task; count violations of its own record in the resulting code.

**Dropped as unmeasurable in V1:** calibration (no probabilistic outputs, no observed outcomes), excess-complexity regret (requires building the counterfactual), unsafe-recommendation rate (undefined). Reinstate only with a labelled rubric.

**Demoted to unit tests, not evidence:** hard-constraint violation rate, scenario coverage, trade-off disclosure, alternative diversity. These check that the selector obeys its own contract.

## Human approval

The proposal waits for a human. The reviewer is a developer — the repository owner — so the summary must be **short**, not jargon-free. Stripping the terminology needed to evaluate an architectural trade-off produces a rubber stamp, which is worse than no gate because it manufactures a record of consent.

`kb-compact` applies as brevity and ranked structure, not as vocabulary removal.

## Slices

1. **Minimal catalog + schema + layout** — 2–3 *compositions* keyed to real workloads (e.g. "website with background work and an audit trail"), decomposed into 8–12 pattern entries across at least three scopes. Each entry carries a role inventory, cardinalities, role signatures, a check, blind spots, and an exemplar. One file per pattern plus a small workload-keyed `index.json`. Schema and admission tests.
2. **Bloat detection pass** — map every component of a pinned Ops revision to a role. Count unmapped components and over-filled roles. Compare to a human read of the same code. This is the slice that proves or kills the premise.
3. **Companion integration** — resolve the catalog from `working-skill-repo`, emit a pinned decision record to `docs/context/decisions/architecture.md`, point `PROJECT.md` at it, register it as a protected oracle, and verify conformance through a `kbcheck` check on a real task. Measure drift and repeatability. Prove the graceful-degradation path when the companion is absent.

Deferred until 1–3 produce results:
- Broad Ops-family cross-validation (low marginal information, shared author).
- Python/TypeScript/Rust reference consumers (JSON Schema plus one consumer proves language-neutrality).
- Versioned release contract, evidence registry, generated indexes (a tag and a CHANGELOG suffice until the skill repo's consumption is stable).

## Repo topology is a human-coordination lever, not an architecture lever

Recorded because the instinct "decompose into separate repositories is almost always right" needs qualifying for this consumer.

Repo count and module boundary are different things that get conflated. Multiple repositories buy independent deploy cadence, team autonomy, and access-control separation — all of which are *human and organisational* benefits. Enforced module boundaries buy dependency control and blast-radius limits, which is the architectural benefit. You can have the second without the first.

For an agent consumer, splitting across repositories carries specific and concrete costs, visible in the tooling already in use:

- `kb-map`'s Project Root Rule anchors every lookup to one Git root and explicitly forbids searching sibling repos for memory. Project memory does not span repositories.
- Graph routing indexes a repository. Cross-repo call and impact edges do not exist, so blast-radius analysis stops at the boundary.
- A cross-repo change needs several contexts assembled by hand, which is exactly the retrieval cost the whole design is trying to reduce.

So the default for agent-authored systems is a **modular monolith with enforced internal boundaries**, and repository splits are justified by an independent deploy, access-control, or lifecycle requirement — not by a preference for decomposition. Decomposition remains right; the unit of decomposition is the module, and the boundary is enforced by a check rather than by a repository URL.

This is a candidate catalog entry in the deployment-and-modularity scope, with the trade-off recorded rather than assumed.

## Assumptions

- Patterns are language-neutral; strong types and explicit schemas are mandatory at boundaries.
- Quality effects stay conditional and evidence-backed. No universal scores.
- The catalog's value is repeatability and identifiability, not novel knowledge the model lacks. This is stated deliberately: it means LLM-authored entries are acceptable, and it means "we beat an unprompted LLM on architecture insight" is *not* a success criterion.
- V1 produces architecture knowledge and decision records only.

## What changed and why

Against the pre-repo plan:

- **Detection primitive changed from violations to roles.** Enumerating violations silently licenses whatever the list forgot. Enumerating roles makes bloat ("fills no role"), duplication ("N fill one role"), and incompleteness ("role with no filler") mechanically detectable.
- **Rationale re-scored for the actual consumer.** Classical patterns transfer through *locatability* and *checkability*, not through human cognitive load. Team-coordination patterns are downgraded accordingly.
- **`exemplar` added as a required field**, because an agent imitates the nearest existing code rather than reading documentation, which makes duplication self-amplifying.
- **Glossary front door is workload-keyed and offers compositions**, mirroring the task-shaped traversal recipes `kb-map` already uses. Not a taxonomy to browse.
- **Ordering gate reinstated.** "No scaffold before the architecture gate" was in the original plan; an earlier review of mine wrongly called it vacuous. It is the constraint the approach rests on.
- **Placement specified** — `docs/context/decisions/architecture.md`, pointed to from `PROJECT.md`, so the pattern rides `kb-map`'s existing retrieval path instead of requiring repo rediscovery.
- **Conformance findings carry an evidence class** from the graph-routing vocabulary already in use, so model opinion cannot masquerade as structural proof.
- **Repo topology recorded as a human-coordination lever**, with modular monolith as the agent-consumer default.
- **Ontology cut to three edge types**; constraint solver deferred. No consumer justifies it yet, and it costs context budget at the point of use.
- **Ops repos reclassified** from blinded evaluation cases to source material. The blinding was not mechanised, the catalog was to be extended from the same repos used to evaluate it, and leave-one-out cannot control a shared-author confound.
- **Four metrics dropped, four demoted.** Replaced with detection rate, repeatability, and drift, which are countable in V1.
- **Seven slices to three.** Portability, release contract, and broad cross-validation deferred behind evidence.
- **Approval summary redefined** as short-for-a-developer rather than jargon-free-for-a-layperson.
- **Repo-visibility gate removed.** Invitation accepted 2026-08-10; `Irtechie/ArchPatternsForAgents` is live, private, and now seeded.

## Decisions needed before `kb-plan`

1. Is the selector deterministic code, an LLM, or the hybrid proposed above?
2. Which repository is mined first for violation indicators, and at which pinned revision?
3. Size budget for `index.json` — the always-loaded artifact.
4. Which real task is used for the slice-3 drift measurement.
5. How the skill repo resolves the companion: submodule, pinned clone, or configured path. This decides whether pattern versions can be pinned per project.
