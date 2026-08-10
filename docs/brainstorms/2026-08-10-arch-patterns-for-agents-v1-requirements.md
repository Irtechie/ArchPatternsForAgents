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

## Core design decision: the entry schema is a detection schema

The industry-standard pattern schema (context, forces, resulting context, consequences) is written to teach a human who has time to read prose. It is the wrong shape here, because neither an agent mid-session nor a reviewer scanning a diff will read prose.

Every catalog entry must carry, in addition to the descriptive fields:

| Field | Purpose |
|---|---|
| `signature` | What the pattern looks like in code when correctly present. Concrete and observable. |
| `violation_indicators` | The specific code shapes that mean it was done willy-nilly. E.g. for Transactional Outbox: outbox row written outside the aggregate's transaction. For CQRS: write model queried from a read path. |
| `check` | How to test for it. Tiered: `grep` heuristic, static rule, or executable fitness function. Not every entry gets a fitness function in V1; every entry gets at least a heuristic. |
| `scope` | Which decision this pattern is an answer to. Same-scope patterns compete; cross-scope patterns compose. |
| `invariants` | The properties that must hold for the pattern to be meaningfully present. |

Descriptive fields retained: context, use/avoid conditions, quality effects (conditional, never scored), costs, failure modes, evidence, licensing.

Rule: **an entry without at least one violation indicator and one check is rejected.** If you cannot say what breaking it looks like, the entry cannot identify slop, and it does not earn its place.

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

Classical patterns delegate deviation-detection to a human reviewer's judgment. That worked because an experienced reviewer could look at code and feel that something was off. An LLM has no such reliable feel, and more importantly, its judgment cannot be audited. So for each pattern, the tacit reviewer knowledge must be made explicit and checkable.

Translation procedure, applied per entry:

1. State what the reviewer would notice — the thing that makes them say "that's wrong."
2. Reduce it to an observable code shape (`violation_indicators`).
3. Express it as the cheapest check that can fail: grep heuristic, static rule, or fitness function (`check`).
4. Record what the check cannot see, so its silence is not mistaken for conformance.

Step 4 is mandatory. A check with unstated blind spots is worse than no check, because it converts "unverified" into "verified."

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
- *Detection* — seed a repository with known violations of a selected pattern; measure how many the entry's violation indicators locate, and the false-positive rate on clean code. This is the primary V1 metric, because identification is the primary V1 job.
- *Repeatability* — the same description run N times yields the same pinned decisions. This measures the willy-nilly problem directly.
- *Drift* — give an agent a decision record and a real task; count violations of its own record in the resulting code.

**Dropped as unmeasurable in V1:** calibration (no probabilistic outputs, no observed outcomes), excess-complexity regret (requires building the counterfactual), unsafe-recommendation rate (undefined). Reinstate only with a labelled rubric.

**Demoted to unit tests, not evidence:** hard-constraint violation rate, scenario coverage, trade-off disclosure, alternative diversity. These check that the selector obeys its own contract.

## Human approval

The proposal waits for a human. The reviewer is a developer — the repository owner — so the summary must be **short**, not jargon-free. Stripping the terminology needed to evaluate an architectural trade-off produces a rubber stamp, which is worse than no gate because it manufactures a record of consent.

`kb-compact` applies as brevity and ranked structure, not as vocabulary removal.

## Slices

1. **Minimal catalog + schema + layout** — 8–12 entries spanning at least three scopes, including competing and composable pairs, each with signature, violation indicators, a check, and stated blind spots. One file per pattern plus a small `index.json`. Schema and admission tests.
2. **Detection pass** — run the violation indicators against seeded violations and against a pinned Ops revision. Measure hits and false positives. Mine findings back into indicators.
3. **Companion integration** — resolve the catalog from `working-skill-repo`, emit a pinned decision record, register it as a protected oracle, and verify conformance through a `kbcheck` check on a real task. Measure drift and repeatability. Prove the graceful-degradation path when the companion is absent.

Deferred until 1–3 produce results:
- Broad Ops-family cross-validation (low marginal information, shared author).
- Python/TypeScript/Rust reference consumers (JSON Schema plus one consumer proves language-neutrality).
- Versioned release contract, evidence registry, generated indexes (a tag and a CHANGELOG suffice until the skill repo's consumption is stable).

## Assumptions

- Patterns are language-neutral; strong types and explicit schemas are mandatory at boundaries.
- Quality effects stay conditional and evidence-backed. No universal scores.
- The catalog's value is repeatability and identifiability, not novel knowledge the model lacks. This is stated deliberately: it means LLM-authored entries are acceptable, and it means "we beat an unprompted LLM on architecture insight" is *not* a success criterion.
- V1 produces architecture knowledge and decision records only.

## What changed and why

Against the pre-repo plan:

- **Entry schema gained detection fields.** Without them the catalog can describe patterns but cannot identify slop, which is the stated purpose.
- **Ontology cut to three edge types**; constraint solver deferred. No consumer exists to justify it, and it costs context-window budget at the point of use.
- **Ops repos reclassified** from blinded evaluation cases to source material. The blinding was not mechanised, the catalog was to be extended from the same repos used to evaluate it, and leave-one-out cannot control a shared-author confound.
- **Four metrics dropped, four demoted.** Replaced with detection rate, repeatability, and drift, which are countable in V1.
- **Seven slices to three.** Portability, release contract, and broad cross-validation deferred behind evidence.
- **Approval summary redefined** as short-for-a-developer rather than jargon-free-for-a-layperson.
- **Repo-visibility gate removed.** Invitation accepted 2026-08-10; `Irtechie/ArchPatternsForAgents` is live, private, empty.

## Decisions needed before `kb-plan`

1. Is the selector deterministic code, an LLM, or the hybrid proposed above?
2. Which repository is mined first for violation indicators, and at which pinned revision?
3. Size budget for `index.json` — the always-loaded artifact.
4. Which real task is used for the slice-3 drift measurement.
5. How the skill repo resolves the companion: submodule, pinned clone, or configured path. This decides whether pattern versions can be pinned per project.
