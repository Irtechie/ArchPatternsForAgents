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

The correct primitive is the inverse. **Each pattern declares the finite set of roles it admits.** Roles are enumerable; violations are not. Four detectors then fall out mechanically:

| Signal | Meaning |
|---|---|
| Code filling **no** role in the pattern | Bloat. It has no home. This is the slop detector. |
| **N components filling one role** | Duplication. "Why do we have four of these?" becomes a query, not an opinion. |
| A role with **no filler** | Incomplete, or the pattern was the wrong choice. |
| A **declared** role or contract that **nothing reads** | Ceremonial architecture. The declaration exists, drifts, and costs maintenance while changing no behaviour. Added after observing it in UniversalUI — see "Ceremonial architecture" below. |

The fourth detector was not in the original design. It was added because inspecting the host repository found a schema declared in sixteen files that no code path reads. It is the purest form of the target problem: structure that looks like architecture, is maintained like architecture, and does nothing.

This is why the catalog is worth building even though the model already knows what MVC is. Knowing a pattern is not the same as holding a finite role inventory to diff a repository against. The second is checkable; the first is vibes.

Every entry therefore carries:

| Field | Purpose |
|---|---|
| `roles` | The finite set of responsibilities the pattern admits. The load-bearing field. |
| `role_signature` | How to recognise a component filling each role — observable, not descriptive. |
| `cardinality` | Per role: exactly-one, one-per-aggregate, many. This is what makes duplication detectable rather than arguable. |
| `check` | The query or script that maps code to roles. Tiered: grep heuristic, graph query, or fitness function. Must name the **independent evidence source** it compares against; a check whose expected and observed values share a source is rejected. |
| `blind_spots` | What the check cannot see, so silence is never read as conformance. |
| `scope` | Which decision this pattern answers. Same-scope patterns compete; cross-scope compose. |
| `exemplar` | The canonical implementation of each role, for imitation. Versioned and protected: a wrong exemplar replicates into every consumer that copies it. See "the codebase is the prompt" below and the observed instance under "The exemplar defect". |
| `enforcement` | Per role and per declared field: what code path actually reads it. A role with no reader is ceremonial, and the entry must say so rather than implying enforcement it does not have. |

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

**Resolved: hybrid, with all non-determinism placed before the human checkpoint and none after it.**

The property being bought is *repeatability of the decision*. Unrepeatable selection is the original disease wearing a lab coat. But pure determinism cannot read prose, and something must turn "a website that does these five things" into structured constraints. So the only real question is where the seam goes.

| Stage | Actor | Deterministic |
|---|---|---|
| Prose → hard constraints + 3–7 quality scenarios | LLM | No — but the output is written down and human-correctable |
| **Confirm the extracted facts** | Human | checkpoint |
| Hard-filter, candidate generation, conflict detection, cardinality | Code | **Yes** |
| Trade-off narrative and plain-language consequence | LLM | No — cosmetic; cannot change the decision |
| Accept or send back | Human | gate |

Given the same confirmed facts, the same patterns are selected every time. The unreliable step happens before anything is pinned and is inspected before it matters.

Mechanics:

- Quality scenarios follow SEI ADD form: source, stimulus, environment, artifact, response, threshold.
- The hard-filter eliminates patterns whose avoid-conditions are triggered. This step is code, not judgement.
- For each open decision, present 2–4 **materially different** alternatives from the surviving set — different mechanisms for the same decision, never unrelated patterns dressed as alternatives.
- Never collapse a trade-off into a single unexplained score.
- Conflicts block with a minimal explanation. No last-file-wins.
- Model architecture as semantic roles and typed edges, not mandatory folders. One small component may fill several roles.

### The reviewer is not assumed to be an architect

Harness users are developers, not necessarily architects. A checkpoint that asks "Hexagonal or Clean?" demands precisely the judgement the reviewer may not have, and will be rubber-stamped — which is worse than no gate, because it manufactures a record of consent.

Therefore the human confirms **facts, not patterns**:

- Extraction asks questions observable about the project without architectural vocabulary — "will users see data that other users must not see?", "must anything keep working offline?", "who is allowed to approve a change to live data?" — never "what is your tenancy isolation model?"
- Code selects from the confirmed facts.
- The selection is presented as a plain-language consequence: what this means for the shape of the code and what it forbids.
- The escape hatch is **"that is not what I am building,"** which returns to the facts. It is never a pattern menu.

Two consequences follow, both load-bearing:

1. **Catalog admission gets stricter.** Every entry's applicability must be expressible in terms a non-architect can verify about their own project. An entry whose applicability can only be stated in jargon is not usable by the intended audience and does not ship. This is the same forcing function as the filter rules, sharpened.
2. **The deviation-justification burden leaves the user.** A non-architect cannot weigh evidence tiers. The agent carries that burden; the user sees only the outcome and may reject it.

Cost, stated plainly: the deterministic middle needs authored filter rules per pattern, and that authoring is the real bottleneck. A pattern whose rule cannot be written was not understood well enough to include. Useful, but it will slow catalog growth.

The extraction step is not new machinery — `kb-brainstorm` already performs requirements discovery. This is its output, structured. That also keeps selection from becoming a 46th skill.

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

Reclassified. FinanceOps, LearnOps, LifeOps, HealthOps and HomeOps are **source material and a declared family**, read-only, at pinned revisions — not a blinded evaluation set.

They serve two purposes. First, they are where role inventories come from, grounded in code that actually got written rather than in the literature. Second, they are a family sharing one declared contract (`universal_ui.owner_integration.v1`) with observed, documented divergence, which makes them a genuine answer key for the family conformance check — the drift is a fact about the files, independent of anyone's opinion about good architecture.

What they are **not** is evidence of selector quality. There is no ground truth for "the correct architecture of FinanceOps," all five share one author, and any catalog extended from them and then evaluated against them is fitting the test set. Leave-one-project-out does not fix a shared-author confound at n=5 and will not be claimed.

Note the distinction that makes slice 2 legitimate: "does this contract diverge across members" is a checkable fact. "Is this the right architecture" is not, and is not being asked.

Verification: `git status` clean on all five at the end. This is a precondition, not a finding.

## The host repository, and a correction to slice 2

`Irtechie/UniversalUI` was never inspected until now. It should have been first: it *owns* the contract the Ops repositories contribute to, and a plugin host's roles are defined by the host, not by any contributor. Pinned revision `8a0a5514` (2026-08-10). Inspecting it produced the strongest evidence in this document, and it invalidates part of the plan.

### Ceremonial architecture: a declared contract that nothing reads

`universal_ui.owner_integration.v1` is declared in eight `integration.json` files in the host and one in each contributing owner repository. **No code reads any of them.** This is not my inference; the host's own architecture notes state it, having derived it by `git grep` over `apps/` and `tests/`:

| Field | Host reads | Ruling (host's own words) |
|---|---|---|
| `integration.json` (whole file) | **0** | "Documentation only." |
| `cssRootClass` | **0** | "Inert." |
| `provider.kind` | **0** | "Keep; inert but true." |
| `sdkVersion` | **0** | "Drop it; it is inert *and* false." |
| `legacyRoute` | dead code only | "Inert today." |

The real binding is a different mechanism entirely: `OWNER_ARTIFACT.json` plus `scripts/verify-owner-intake.mjs`, which compares vendored bytes against the owner repository by git blob SHA, with providers resolved from **a hardcoded table in `apps/parity-server/server.py`**.

**This forces a correction.** Slice 2 previously named the observed `integration.json` divergence — `proof` as object versus string, `pythonRoot` versus `packageRoot`, manifest location — as its ground-truth answer key. That was wrong. Those fields are inert, so a checker reporting them loudly would be producing exactly what the host author warns against elsewhere: "a confident but meaningless drift report." Divergence in a field nothing reads has no consequence to detect.

The corrected answer key is better than the original, because it is a fact about behaviour rather than about text:

- **Ground truth:** `integration.json` is documentation-only; the load-bearing contract is `OWNER_ARTIFACT.json` + intake verification + the hardcoded provider table.
- **The check must discover that**, i.e. distinguish a declared contract from an enforced one, and rank findings by whether anything reads the field.
- This is verifiable independently, because the host's architecture docs state the answer and were written by someone other than the checker.

`legacyRoute` sharpens the check's required precision. Its only consumer is a component that itself has no call site, so a reference-counting grep finds a reader and wrongly calls it live. The detector needs **reachability, not reference** — a two-hop graph query over `READS_CONFIG`, not a text match.

### The exemplar defect: the strongest evidence for this project

The document previously asserted, as design reasoning, that agents imitate the nearest existing example and therefore divergence is self-amplifying. That assertion is no longer theoretical. From the host's contract document, on why `provider.kind` disagrees across owners:

> "This document previously showed `python-in-process`, which is why the active set disagrees: the owners that followed this example diverged from the six that followed the shipped host copies. **The example was the defect, not those owners.**"

An earlier draft of this document recorded FinanceOps' `python-in-process` as FinanceOps drifting. That reading was wrong, and the host's ruling is the correct one: a single incorrect example propagated silently into every consumer that copied it, splitting the family precisely along which source each owner copied from.

Consequences, all load-bearing:

1. **`exemplar` is confirmed as a required, versioned field.** A wrong exemplar is not a documentation bug; it is a defect that replicates. Exemplars need the same protected-oracle treatment as targets.
2. **Divergence must be attributed, not just counted.** "Which source did this copy from" is more useful than "these differ," and is recoverable from the divergence split itself.
3. **Contributor conformance is the wrong default question.** Ask what the contributors copied, and whether *that* was right.

### Check independence

One principle from the host, stated generally enough to adopt verbatim:

> "Verify a gate against an independent command that does not share the gate's code path. A status line and the expression that sets it are not independent evidence."

This binds directly on conformance checks. A role-mapping check that derives its expectations from the same declaration it is checking proves nothing — it will confirm that a file agrees with itself. Every entry's `check` must state what independent evidence it compares against, and admission should reject checks whose expected and observed values share a source.

### Related: fields advertised but never recomputed

Also from the host, an observed instance with a named remedy: HomeOps' `cssRootClass` "was hardcoded and went stale the moment it rescoped its stylesheet, so the envelope advertised a root class no selector used." Remedy: "Derive such fields from source, and fail the build when the source and the claim disagree." This is a reusable entry in the catalog's failure-mode vocabulary — *asserted-but-not-derived* — and it is distinct from ceremonial architecture, because here something does read the field; it is simply not recomputed.

### What this repository is not

Worth stating plainly, because the evidence invites the wrong conclusion: UniversalUI is a well-run repository. It found these problems itself, documented them honestly with the technique that caught each one, and ruled on them. The gap is not diligence.

The gap is that the knowledge lives in prose, in `docs/context/architecture/`, at a length no agent will load mid-session — and nothing prevents the next agent from carefully maintaining `integration.json` in the belief that it matters. That is precisely the case for a machine-checkable catalog, and it is a stronger case than a badly-run repository would have made.

## Test plan

**Entry admission (blocking)**
- Reject entries lacking evidence, trade-offs, contraindications, licence provenance, or verifiable invariants.
- Reject entries lacking a role inventory with cardinalities, a check, blind spots, or an exemplar.
- Reject entries whose applicability conditions cannot be stated as questions a non-architect can answer about their own project.

**Composition correctness**
- Reject incompatible authority claims, e.g. CRUD and Event Sourcing over the same aggregate.
- Allow orthogonal composition, e.g. Modular Monolith + CQRS + approval-gated effects.
- Simple CRUD inputs must not draw DDD, CQRS, Event Sourcing, queues, agents, or microservices.

**Behavioural (the ones that can fail informatively)**
- *Counterfactual sensitivity* — a materially changed requirement changes the recommendation.
- *Paraphrase invariance* — reworded requirements do not. This applies to the **extraction** step, not the filter: reworded prose must yield the same structured facts. Under the resolved seam the filter is deterministic and this test would be vacuous applied to it, but applied to extraction it has a real failure mode and is worth running.
- *Bloat detection* — take a real codebase with a known pattern, map every component to a role, and count the components that map to none. Compare against a human pass over the same code. This is the primary V1 metric, because "code with no home in the pattern" is the operational definition of slop.
- *Dead-declaration detection* — for each declared contract field, determine whether any code path reaches it. Must distinguish inert from live, and must not be fooled by a reference from unreachable code (`legacyRoute` is the trap case). Scored against the host's own published rulings.
- *Exemplar attribution* — where family members disagree, identify which exemplar each copied from. Scored against the known `provider.kind` split.
- *Duplication detection* — count roles filled by more components than their cardinality allows. Verify against known duplication.
- *Repeatability* — the same description run N times yields the same pinned decisions. This measures the willy-nilly problem directly.
- *Drift* — give an agent a decision record and a real task; count violations of its own record in the resulting code.

**Dropped as unmeasurable in V1:** calibration (no probabilistic outputs, no observed outcomes), excess-complexity regret (requires building the counterfactual), unsafe-recommendation rate (undefined). Reinstate only with a labelled rubric.

**Demoted to unit tests, not evidence:** hard-constraint violation rate, scenario coverage, trade-off disclosure, alternative diversity. These check that the selector obeys its own contract.

## Human approval

The proposal waits for a human, and that human is a developer who may not be an architect. This cuts against the obvious instinct in both directions.

Stripping all terminology produces a summary that cannot support a real trade-off judgement, and the reviewer rubber-stamps it. Keeping full architectural vocabulary produces a summary the reviewer cannot evaluate, and the reviewer rubber-stamps it. Both failures manufacture a record of consent.

The resolution is that the approval question is not "is this the right architecture." It is:

1. **Are these facts about your project correct?** — answerable by anyone who knows what they are building.
2. **Are these consequences acceptable?** — stated as concrete restrictions on the resulting code, not as pattern names.

Architectural terms may appear as labels for the reader's benefit, but no approval question may *require* understanding one in order to answer. `kb-compact` applies as brevity and ranked structure.

## Slices

1. **Minimal catalog + schema + layout** — seed with **Plugin Host with Owner Contributions**, whose role inventory is lifted from the host's *enforced* mechanism (`OWNER_ARTIFACT.json`, `scripts/verify-owner-intake.mjs`, the provider resolution table), not from the inert `integration.json`. Plus 6–10 further entries across at least three scopes. Each carries roles, cardinalities, role signatures, a check with a declared independent evidence source, blind spots, and a versioned exemplar. One file per pattern plus a small workload-keyed `index.json`. Schema and admission tests.
2. **Enforcement-vs-declaration pass** — over UniversalUI at `8a0a5514` and the five Ops repositories. Report, for each declared contract field, whether any code path reaches it. Ground-truth answer key, stated in the host's own architecture docs and therefore independent of this checker: `integration.json`, `cssRootClass`, `provider.kind`, `sdkVersion` and the release envelope are inert; `legacyRoute` is transitively dead behind a component with no call site; `OWNER_ARTIFACT.json` and the provider table are load-bearing. The check must also attribute the `provider.kind` split to the exemplar that caused it. If the check cannot reproduce these rulings, the approach does not work and the project stops here.
3. **Companion integration** — resolve the catalog from `working-skill-repo`, emit a pinned decision record to `docs/context/decisions/architecture.md`, point `PROJECT.md` at it, register it as a protected oracle, and verify conformance through a `kbcheck` check on a real task. Measure drift and repeatability. Prove the graceful-degradation path when the companion is absent.

Deferred until 1–3 produce results:
- Broad Ops-family cross-validation (low marginal information, shared author).
- Python/TypeScript/Rust reference consumers (JSON Schema plus one consumer proves language-neutrality).
- Versioned release contract, evidence registry, generated indexes (a tag and a CHANGELOG suffice until the skill repo's consumption is stable).

## Repo topology: correcting an earlier recommendation

An earlier draft argued that agent-authored systems should default to a modular monolith, on the grounds that `kb-map` anchors to one Git root and graph routing indexes a single repository. Inspecting FinanceOps, HealthOps and LifeOps shows that argument was aimed at the wrong target.

The Ops repositories are not one application split up for preference. They are **one repository per bounded context** — separate products in separate life domains — each internally segmented into domain modules (`src/ledger`, `src/market_regime`, `src/provenance_bundle`, `src/scorecard`, `src/life_state`, `src/control_center`), each carrying its own `AGENTS.md`, `todo.md`, and `docs/context/`. Every repository is a coherent product and a valid `kb-map` root. The boundary follows the domain. That is the correct use of a repository boundary, and the monolith recommendation is withdrawn.

The real cost of segmentation is different, and worse, and it is visible in the code.

### Observed: a real pattern, silently drifted

All five repositories are contributions to a host, `Irtechie/UniversalUI`, declared through an `integration.json` manifest. All three inspected declare the same contract version, `universal_ui.owner_integration.v1`. So a genuine architectural pattern already exists here — plugin host with owner contributions — and it is versioned.

Under that single schema version, at pinned revisions on 2026-08-10 (FinanceOps `974ee76`, HealthOps `4edf33b`, LifeOps `1806739`):

| Divergence | FinanceOps | HealthOps | LifeOps |
|---|---|---|---|
| Manifest location | `packages/*-universal-ui/` | **repo root** | `packages/*-universal-ui/` |
| `provider.kind` | `python-in-process` | `python-read-provider` | `python-read-provider` |
| Python root key | `pythonRoot` | `packageRoot` | absent |
| `proof` type | object, 5 keys | object, 6 keys | **plain string** |
| `cssRootClass` | `financeops-site` | absent | `.lifeops-owner-site` (leading dot) |
| Second contribution export | `legacyContributionExport` | `legacyContributionExport` | `contributionV1Export` |
| `mountExport` | top level | top level | moved inside `routes[]` |
| `contributionId`, `supportedHostRange`, `repository` | absent | present | absent |
| Path separators | forward slash | **backslash** | forward slash |
| Host-contract module | absent | `host-contract-types.ts` | `host-contract.ts` |
| Contribution tests | 1 | **none** | 2 |

`proof` being an object in two repositories and a string in a third, under an identical declared schema version, is not a stylistic difference. It is a contract violation that nothing detected, because nothing validates the contract.

Separately, `LifeOps/apps/healthops` contains a nested copy of HealthOps' own project memory — `AGENTS.md`, `todo.md`, `docs/context/PROJECT.md`, `.kb/snapshots`, and its brainstorm documents. The same product exists both as its own repository and vendored inside another, giving two sources of truth for one thing.

### What this proves

This is the thesis of the project, demonstrated on real code rather than argued from the literature:

1. **The pattern existed and was named.** A versioned schema, a declared host, a defined contribution shape. Knowledge was not the missing ingredient.
2. **It drifted anyway**, because nothing could check conformance. Each repository is internally consistent and locally plausible. The drift exists only in the space *between* them.
3. **No single-repo tool can see it.** `kb-map` is anchored to one root by design and forbids sibling-repo lookup. Graph routing indexes one repository. Every existing check is structurally blind to the most expensive duplication in the system.

### Consequence for V1

Role cardinality must be checkable **across a declared repository family**, or the highest-value detection available in this codebase is impossible by construction.

- A pattern entry may declare `scope: family` for roles shared across repositories.
- A family is declared explicitly — an opt-in list of repositories plus the contract they share — so this never becomes uncontrolled cross-repo crawling. A named set, checked deliberately, not a search.
- The family check answers one question: for each role in the shared contract, do all members fill it the same way, and where do they diverge?
- Findings carry evidence class. Key-name and type divergence are `structural`. "This looks inconsistent" is `llm-inferred` and reported as such.

This also supplies the catalog's first real entry, drawn from working code instead of a textbook: **Plugin Host with Owner Contributions**, its role inventory taken from `universal_ui.owner_integration.v1` — manifest, provider entry point, wire schema, browser bundle, mount export, contribution export, style scope, proof commands — with a family-level cardinality of exactly-one-per-member for each role.

### The remaining topology point, stated correctly

Repository boundaries should follow bounded contexts, as they do here. What does not follow automatically is that shared roles get replicated per repository. `packages/<owner>-universal-ui` exists five times, filling one role five ways. Shared published package versus replicated-and-validated is a genuine trade-off with a defensible answer either way — but it should be an explicit decision with a check behind it, and it is currently neither.

## Deviation policy

Code may extend beyond the selected pattern, and a project may decline the library's recommendation entirely. Neither is forbidden. Both must be **recorded rather than silent**, and the burden of justification scales with the strength of the evidence being overridden.

A closed system that cannot be exceeded gets abandoned the first time real work does not fit. That is the failure mode this policy exists to avoid. The opposite failure mode is the one it must be engineered against.

### The rubber-stamp problem

An escape hatch requiring only a free-text justification is not a gate. Language models produce fluent, plausible rationales on demand and at no cost, so a prose field becomes a generator of permission slips. Every deviation would be justified, and the justifications would all read well.

So justification is **typed, not narrated**. The deviating actor selects a reason from a closed set, and some reasons demand evidence rather than assertion:

| Reason code | Evidence required | Effect |
|---|---|---|
| `no-pattern-covers-this` | The decision, stated in scope terms | Raises an `uncovered_decision`; feeds catalog growth |
| `pattern-cost-exceeds-benefit` | Which specific roles are being dropped and why they are unused at this scale | Allowed; counted |
| `measured-constraint` | An actual measurement — benchmark, profile, or limit hit | Allowed; measurement is attached and checkable |
| `external-constraint` | The framework, vendor, platform, or contract that forces it | Allowed; names the constraint |
| `known-debt` | A review trigger | Expires. Unreviewed debt resurfaces rather than becoming permanent by default |

Free-form prose is permitted only as a supplement to a reason code, never as a substitute. A deviation with no reason code fails the check exactly as an unexplained one would.

### Burden scales with evidence

This is where the `evidence` field stops being decoration. Each pattern carries an evidence tier, and the tier sets the bar for declining it:

- **Strong** — long track record, independent corroboration, well-documented failure modes when omitted. Declining requires a reason code plus evidence, and it is surfaced in the approval summary.
- **Moderate** — established but context-dependent. Reason code, recorded, not surfaced.
- **Weak or provisional** — plausible, thinly evidenced, possibly a local habit. Declining costs nothing and is not recorded as a deviation at all.

A weakly-evidenced pattern that demands justification to skip is just dogma with a schema. The gradient is what keeps this a helping hand rather than a bureaucracy.

### Deviation is an amendment, not an exception

The mechanism already exists in the skill repo. The decision record is a protected oracle, and `kb-check`'s rule is that the target "must still match the recorded SHA unless the plan explicitly updated the oracle."

So a deviation is not a note filed alongside the architecture. It is an **amendment to the architecture**, which changes the record, which changes the SHA, which is a visible and reviewable act. The agent cannot drift quietly; it can only amend loudly. That is the whole difference between a guardrail and a suggestion, and it costs nothing new to build.

### Counting, escalation, and the feedback loop

Individual deviations are cheap and fine. Their *distribution* is the signal.

- Deviations are counted per module and per pattern in a register inside the decision record.
- When deviations against one pattern in one module exceed a threshold, the system stops accepting further justifications and requires **re-selection**. Four justified deviations from a pattern are not four exceptions; they are evidence that a different pattern was the right answer. Continuing to justify at that point is how a codebase ends up shaped like nothing at all.
- A high deviation rate against a *strongly*-evidenced pattern across several projects is a finding about the **catalog**, not the code. Either the entry's role inventory is wrong, or its context conditions are miscoded.

This converts the escape hatch into the catalog's primary growth input. `no-pattern-covers-this` deviations are the queue of candidate entries, and they arrive with real usage behind them rather than being invented from the literature.

## When the architecture check runs

The catalog is consulted at planning time, not on demand. Three distinct moments, asking three different questions.

| Moment | Question | Outcome |
|---|---|---|
| **Initial planning**, greenfield | Which composition fits this workload? | Pin a decision record. No scaffold until it exists. |
| **Planning on existing work** | Is the pinned architecture still right for what we are about to add? | Proceed, or trigger re-selection. |
| **Adding a member to a family** | Does this new member match the family contract? | Conform, or record a typed deviation. |
| **Remediation** — "this is spaghetti, get it onto a pattern" | What is this code closest to, and what is the cheapest route there? | Pin a target, baseline the gap, ratchet it down. |

The second and third are new here, and the third is the one that matters most for the observed drift. Every divergence in `universal_ui.owner_integration.v1` entered the system at the moment a new Ops repository was created or extended. There was no point in the workflow that asked "does this match the contract the other members already implement." The check has to fire *when a member joins or changes*, because that is the only moment the answer is cheap.

### Remediation mode

The most common real case: the code exists, it is a mess, and it needs to get onto a pattern. This mode is where the role inventory pays off hardest, because mapping components to roles turns "this is spaghetti" into a concrete list of things with no home.

**Selection criteria invert.** In greenfield, candidates are ranked by fit. In remediation, they are ranked primarily by **migration distance** — map the existing components against each candidate's role inventory and count what already lands. The pattern with the smallest unmapped residue that still fixes the actual pain wins. The theoretically superior pattern that requires rewriting everything is the wrong answer, because it will not be finished, and an unfinished migration leaves the codebase in two architectures at once, which is worse than the one mess it started with.

Migration distance is computable, not a judgment call. That makes it the one genuinely new capability this mode needs.

**Three outcomes per unmapped component, not one.** "Fills no role" is the slop signal, but it does not always mean migrate:

| Residue | Test | Action |
|---|---|---|
| Unmapped and unreachable | No inbound references or calls | **Delete.** Not a migration target. |
| Unmapped and duplicated | Another component fills the same role | **Consolidate** onto the canonical exemplar. |
| Unmapped and load-bearing | Reachable, unique, no role fits | **Migrate**, or record `no-pattern-covers-this` |

The first row matters more than it looks. A large share of spaghetti is not badly-patterned code, it is *excess* code — and migrating it is worse than deleting it, because migration makes excess permanent by giving it a home.

**Execution belongs to `kb-simplify`, not here.** That skill already ranks simplification targets by change frequency and code health and executes one at a time in a confirm loop. This mode produces the target pattern, the migration distance, and the ranked residue; `kb-simplify` burns it down. No new execution machinery.

**The ratchet.** Big-bang migration does not land. So the mechanism is:

1. Pin the target pattern in the decision record.
2. Baseline the current gap as a recorded deviation count, per module.
3. Require the count to move in one direction only. New code conforms; existing code migrates opportunistically as it is touched.
4. The baseline is a protected oracle, so lowering the bar is a visible amendment rather than a quiet edit.

**Guard against the ratchet becoming a filing cabinet.** If the count never falls, the exercise has documented the spaghetti rather than fixing it. A remediation record therefore carries either a burn-down expectation or an explicit, dated decision to accept the gap as permanent. "Accepted" is a legitimate answer. "Still baselined, untouched, eighteen months later, nobody decided anything" is not, and should be surfaced as staleness rather than silently persisting.

### Two questions that get conflated

Planning against an existing codebase must separate them:

- **Conformance** — does the code still match the pinned record? A drift question, answered by a check, with structural evidence.
- **Fitness** — is the pinned record still the right choice given the new requirement? A judgment question, answered by re-selection.

Conflating them produces the worst outcome: code drifts, the drift is noticed, and the architecture is quietly amended to match whatever was built. That is drift with paperwork. Conformance failures are fixed in the code by default; amending the record is a separate, deliberate act.

### Re-selection must be possible but not free

If planning can silently re-pick the architecture on every run, the pin means nothing and the whole mechanism is theatre.

So changing a pinned record uses the deviation machinery already defined: a typed reason code, evidence proportional to the pattern's evidence tier, and a resulting change to the protected-oracle SHA, which makes it visible in review. Re-selection is a normal, expected event — it just cannot be a quiet one.

### Proportionality

A heavyweight architecture ritual on every plan will be skipped, and a skipped gate is worse than no gate because it still implies coverage. This follows the harness's existing principle that normal lookup stays cheap.

Default path is cheap: does a decision record exist, does the `PROJECT.md` pointer resolve, does the fast conformance check pass. That is it.

Escalate to full re-selection only on a trigger: no record exists, the requirement crosses a scope the record does not cover, conformance failures exceed the deviation threshold, or a new family member is being added. Everything else proceeds without loading the catalog at all.

## Ownership split: what changes where

Three repositories, three different kinds of change. Keeping them straight is what stops this leaking into the harness.

| | Repository | What it holds | Change size |
|---|---|---|---|
| **Catalog** | `ArchPatternsForAgents` (this repo) | Pattern entries, role inventories, cardinalities, checks, schema, workload index, family checker | All new; standalone |
| **Harness** | `working-skill-repo` | Selection step, conformance check type, oracle registration, pointer read | Small, generic, additive |
| **Consumers** | The Ops projects and any future project | One `docs/context/decisions/architecture.md` each, plus a family declaration | Data only; no code |

### The harness changes are generic, not Ops-specific

Nothing proposed for `working-skill-repo` encodes anything about Ops. Four additions, each of which applies to any project:

1. **Selection** — consult the companion index, propose per-scope alternatives, emit the pinned decision record. Better as a mode of `kb-brainstorm`/`kb-plan` than as a new skill; see the bloat note below.
2. **`kb-check`** — a new conformance check type, reading the project's decision record and the companion's checks. Follows the existing conditional-tooling convention: companion present means run the check, companion absent means substitute and record which command produced the proof.
3. **`kb-plan`** — register the decision record as a protected oracle on affected slices. This is the existing mechanism applied to a new artifact type, not a new mechanism.
4. **`kb-map`** — surface the `docs/context/decisions/architecture.md` pointer during lookup. `PROJECT.md` is already the routing surface; this is one more row.

If the companion repository never exists, all four degrade to "name and pin your architecture decision," which is still an improvement and still portable.

### Slices 1 and 2 require no harness change at all

Worth stating plainly, because it bounds the risk. The catalog, the role inventories, and the family conformance check can all be built and run entirely inside this repository against read-only clones. Only slice 3 — integration — touches `working-skill-repo`.

So the premise gets tested before the harness is modified. If family conformance does not find the known drift, the project stops and the harness was never touched.

### Harness bloat is a real cost

`working-skill-repo` already carries roughly forty-five skills. Every addition competes for the agent's attention and for the description-matching that decides which skill loads. Adding a forty-sixth skill for architecture selection is not obviously correct.

Prefer extending existing lanes: selection is a phase of `kb-brainstorm`/`kb-plan`, conformance is a check type in `kb-check`. A separate skill is justified only if selection turns out to need its own multi-step workflow that does not fit inside planning.

### Open: where the family checker lives

The family check crosses repository boundaries, which conflicts with an existing harness invariant. `kb-map`'s Project Root Rule anchors to one Git root and explicitly forbids searching sibling repositories — a rule that exists for a good reason, since it stops an agent picking up stale memory from an unrelated project.

Options:

- **In this repository, as a standalone tool** run deliberately against a declared family, emitting a report the harness can consume. Preserves the single-root invariant completely. Recommended.
- **In the harness, as an explicitly opt-in mode** that suspends the single-root rule for a named repository list. More convenient, but weakens a guardrail that is currently absolute, and absolute guardrails are easier to trust.
- **In the contract owner** — for this specific case, `UniversalUI` owns `universal_ui.owner_integration.v1` and could validate its own contributors. Correct for that one contract, but not a general mechanism.

Recommendation: the general role-and-cardinality family checker lives here; a contract-specific validator may additionally live with its contract owner. The harness consumes results and never crawls sibling repositories itself.

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
- **Remediation mode added** as the fourth call-out. Candidates ranked by computable *migration distance* rather than fit, unmapped residue triaged into delete / consolidate / migrate, execution handed to `kb-simplify`, and progress held by a one-directional ratchet with an anti-staleness guard.
- **Deviation policy added.** Extending beyond a pattern or declining the library is allowed but recorded, with typed reason codes rather than free prose, a justification burden that scales with evidence tier, deviation counting with forced re-selection past a threshold, and `no-pattern-covers-this` as the catalog's growth queue.
- **Monolith default withdrawn.** Inspecting the Ops repos showed the segmentation follows bounded contexts, with each repository a coherent product and valid `kb-map` root. The earlier recommendation was aimed at the wrong target.
- **Family scope added.** Observed drift across `universal_ui.owner_integration.v1` in three repositories — including `proof` typed as an object in two and a string in a third — is invisible to every single-repo check by construction. Role cardinality must be checkable across a declared repository family.
- **Slice 2 re-aimed** at family conformance, using that observed drift as a ground-truth answer key, since contract divergence is a checkable fact where "correct architecture" is not.
- **First catalog entry identified from working code**: Plugin Host with Owner Contributions.
- **Repo-visibility gate removed.** Invitation accepted 2026-08-10; `Irtechie/ArchPatternsForAgents` is live, private, and now seeded.
- **Ontology cut to three edge types**; constraint solver deferred. No consumer justifies it yet, and it costs context budget at the point of use.
- **Ops repos reclassified** from blinded evaluation cases to source material. The blinding was not mechanised, the catalog was to be extended from the same repos used to evaluate it, and leave-one-out cannot control a shared-author confound.
- **Four metrics dropped, four demoted.** Replaced with detection rate, repeatability, and drift, which are countable in V1.
- **Seven slices to three.** Portability, release contract, and broad cross-validation deferred behind evidence.
- **Approval summary redefined** again: not jargon-free-for-a-layperson, and not short-for-an-architect either. No approval question may *require* understanding an architectural term to answer, because harness users are developers who are not necessarily architects.
- **Selector seam resolved**: non-determinism sits entirely before the human checkpoint. The human confirms extracted facts; code makes the selection.
- **Host repository inspected** at `8a0a5514`, having been skipped until now. It should have been first — a plugin host's roles are defined by the host, not by a contributor.
- **Fourth detector added — ceremonial architecture.** A declared contract that nothing reads. Found empirically: `universal_ui.owner_integration.v1` is declared in sixteen files and read by zero code paths, per the host's own `git grep` audit.
- **Slice 2 corrected, second time.** Its answer key was the observed `integration.json` divergence. That field set is inert, so reporting it would be a confident but meaningless drift report. Re-aimed at enforcement-versus-declaration, whose answer key is published by the host and independent of this checker.
- **"Codebase is the prompt" upgraded from assertion to observation.** The host documents a doc example that was wrong, propagating into every owner that copied it, splitting the family by copy source: "The example was the defect, not those owners." An earlier draft of this document misread that same split as contributor drift.
- **`exemplar` promoted** to versioned and protected, and **`enforcement` added** to the entry schema.
- **Check independence required.** A check whose expected and observed values share a code path confirms only that a file agrees with itself.

## Decisions needed before `kb-plan`

**Resolved**

- *Ownership split* — agreed 2026-08-10. Catalog in this repository, small generic additions to the harness, decision-record data only in consumer projects. Slices 1 and 2 require no harness change.
- *Family checker* — implementation lives in this repository and is invoked as a planning-time call-out, not run ad hoc. The harness never crawls sibling repositories itself, so `kb-map`'s single-root rule stays absolute; it passes an explicitly declared family to the companion tool and consumes the report.
- *Selector architecture* — agreed 2026-08-10. Hybrid, with the seam at the human checkpoint: LLM extracts structured facts from prose, the human confirms the **facts**, deterministic code selects, an LLM writes the explanation, and the human accepts or sends it back. Reviewers are not assumed to be architects, so no approval question may require architectural vocabulary to answer, and catalog entries whose applicability cannot be stated in project-observable terms are rejected.
- *First repository mined, and revision* — `Irtechie/UniversalUI` at `8a0a5514`, not FinanceOps. The seed pattern is a plugin host, and the host defines the roles; a contributor only shows one instance of conforming to them. FinanceOps at `974ee76c` remains the first *contributor* mined, and that revision is independently corroborated by the host's recorded intake binding.

**Open**

1. Size budget for `index.json` — the always-loaded artifact.
2. Which real task is used for the slice-3 drift measurement.
3. How the skill repo resolves the companion: submodule, pinned clone, or configured path. This decides whether pattern versions can be pinned per project.
4. Whether selection is a new skill or a phase of `kb-brainstorm`/`kb-plan`. Default to the latter unless it needs its own workflow.
5. The deviation threshold that forces re-selection, and whether it is counted per module, per pattern, or both.
