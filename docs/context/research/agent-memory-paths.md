# Agent Memory Paths And Retrieval

Checked: 2026-08-25
Budget mode: standard

## Question

Where should an agent's memory physically live? Specifically: is an Obsidian
vault a good memory path, how does it relate to project-scoped agent memory and
global user memory, and does any of this need RAG (SimpleRAG or otherwise)?

## Findings

### 1. The tiers are real, and they are separated by lifetime and blast radius

The convergent pattern across Claude Code, Cursor, and Copilot CLI is not one
memory store but a small number of tiers. The useful way to tell them apart is
not "how big" but **who owns the fact and when does it stop being true**.

| Tier | Path | Owner | Lifetime | Versioned with code |
|---|---|---|---|---|
| Global preference | `~/.claude/CLAUDE.md`, `~/.copilot/` | the human | years | no |
| Project contract | `AGENTS.md`, `CLAUDE.md` at repo root | the repo | as long as the code | **yes** |
| Project memory | `docs/context/**`, `todo.md` | the repo | until the code changes | **yes** |
| Agent scratch memory | `~/.claude/agent-memory/<agent>/` | one agent | task-scoped | no |
| Session context | conversation window | nobody | minutes | no |

The load-bearing line is between rows 3 and 4: **anything that can be falsified
by a commit must be versioned by the same commit.** A fact like "auth lives in
`src/auth/`" is not a memory, it is a claim about the tree, and it goes stale
silently the moment someone moves the directory. That is the single most common
way agent memory turns into a liar.

### 2. Obsidian is a good human path and a bad agent-authoritative path

The vendor writeups are enthusiastic about Obsidian-as-agent-memory, and the
mechanics do work — several community MCP servers expose a vault for CRUD, and
you get frontmatter, backlinks, tags, and Dataview for free. Two caveats that
those writeups mostly skip:

- **Nothing is first-party.** Obsidian ships no official MCP endpoint. The
  REST-API route requires the desktop app to be *running*, which makes it a
  poor dependency for a headless or CI agent.
- **A vault is not versioned with the repo.** This is the disqualifier, not the
  setup cost. A vault has its own history (or none), so a project fact stored
  there cannot be invalidated by the commit that falsifies it.

So the honest split is by **fact type, not by tool preference**:

- Obsidian earns its place for facts that outlive any one repo and that a human
  reads directly: research, vendor comparisons, meeting decisions, "why we chose
  X", cross-project architecture opinion.
- Repo markdown owns anything an agent will act on inside that repo.

If you want both, the cheap wiring is one-directional: the vault may *link into*
repo paths, the repo must never depend on the vault being present. An agent
whose correctness requires a running desktop app is not a portable agent.

### 3. RAG is mostly not the bottleneck, and SimpleRAG is not a thing

Worth stating plainly because it saves real work: **"SimpleRAG" is not a
canonical project.** There is a thin `simplerag` PyPI package and a well-known
teaching repo (`mrdbourke/simple-local-rag`, PDF-oriented), but there is no
standard you would adopt. The term is used loosely for "minimal RAG pipeline".

More importantly, embedding retrieval is no longer the default for code and
markdown, and the reason is structural rather than fashion:

- Code and markdown are **lexically strong**. Identifiers, paths, and headings
  are near-unique tokens, so `ripgrep` plus an agent that can read and rerank
  beats a vector index on precision *and* latency.
- Embeddings introduce a second source of truth that must be re-indexed. A stale
  index is worse than no index, because it answers confidently.
- Frontier coding agents (Claude Code, Codex) moved toward agentic lexical
  search rather than maintaining a vector store per repo.

Vector search earns its keep only past a real threshold: a corpus large and
*semantically diverse* enough that the query vocabulary genuinely does not match
the document vocabulary — natural-language questions over prose, mixed media, or
hundreds of thousands of chunks. A project memory directory of a few dozen
markdown files is nowhere near that line.

If the threshold is genuinely crossed, the ranking for local use is:
**sqlite-vec** (one file, SQL filters, no daemon — the right default when memory
is already file-based), **LanceDB** (scale or multimodal), **ChromaDB**
(fastest to prototype, Python-native), **txtai** (fading ecosystem).

### 4. Memory frameworks solve a different problem than a coding agent has

Mem0, Letta/MemGPT, Zep/Graphiti, and Cognee are real systems with real
benchmarks — but read those benchmarks carefully. LongMemEval (Zep ~64%, Mem0
~49%) measures **conversational recall across sessions**: remembering what a
user said about themselves weeks ago. That is a chat-assistant problem.

A coding agent's memory problem is different in kind. Ground truth is the
working tree, and it is *right there* and cheap to re-read. The agent does not
need to recall what the repo looked like; it needs to not carry forward a belief
the repo has since contradicted. For that, git is already the better memory
system — it has atomic updates, history, blame, and, crucially, review.

Practical read: these frameworks are justified when you are building a *product*
with many users and cross-session personalization. For a repo-scoped coding
agent they add a service dependency, a second source of truth, and an
un-reviewable write path, in exchange for solving a problem you do not have.

Be aware that most comparison articles in this space are vendor-adjacent and
conclude "adopt a memory layer". Weight them accordingly.

### 5. The failure modes are what the design has to defend against

Persistent memory fails in specific, known ways:

- **Stale facts** — memory asserts something the tree no longer supports.
- **Memory poisoning** — untrusted or agent-hallucinated content is written to
  memory and then retrieved later as if it were established.
- **Reference looping** — an agent's own uncertain output is stored, retrieved,
  and treated as corroboration. Self-confirmation.
- **Unbounded growth / context rot** — memory grows until the signal is buried
  and startup cost dominates.
- **Semantic drift** — embeddings written by one model stop matching a newer
  one, silently degrading recall.

These map cleanly onto this repo's premise. Each is a **checkable** property,
not a matter of good intentions:

| Failure mode | Mechanical check |
|---|---|
| Stale facts | every path referenced in `docs/context/**` resolves on disk |
| Poisoning / looping | memory writes are commits, so they pass review |
| Unbounded growth | byte/file ceiling on always-loaded memory |
| Semantic drift | not applicable while there is no embedding index |

The fourth row is an argument for the no-RAG default in its own right: skipping
the index deletes a whole failure class.

## Revision: The Global Tier Was Under-Served (2026-08-25)

The first pass answered "where does *repo* memory live" and let that conclusion
bleed onto every tier. That was wrong. The global human-knowledge tier has a
different dominant failure mode and therefore deserves different machinery.

### Why the global tier is genuinely different

| | Project memory | Global human knowledge |
|---|---|---|
| Ground truth | the working tree | nothing local; the world |
| Cheap to re-derive? | yes — just read the file | no |
| How staleness is caught | a check against disk | nothing catches it |
| Corpus growth | bounded by the repo | unbounded, years |
| Cross-item links matter? | rarely | **the whole point** |
| Right tool | grep + committed markdown | temporal graph |

The decisive row is the third. For repo facts, staleness is *mechanically
detectable* — the path resolves or it does not. For global knowledge ("Obsidian
has no first-party MCP", "embeddings beat grep for code"), nothing on disk can
falsify the claim. It just quietly rots. That is exactly the gap a bi-temporal
graph fills, and it is why the earlier blanket "skip the memory frameworks"
conclusion does not survive contact with this tier.

### Graphiti's bi-temporal model is the right primitive here

Graphiti tracks four timestamps per edge, and the pairing is what matters:

- `valid_at` / `invalid_at` — when the fact was true **in the world**
- `created_at` / `expired_at` — when the system **learned/forgot** it

When new input contradicts an existing edge, Graphiti sets `invalid_at` rather
than overwriting. The old fact stays queryable. This yields two properties that
a flat markdown note cannot express at all:

1. **Supersession instead of accumulation.** "Obsidian ships no first-party
   MCP" does not get deleted when that changes; it gets bounded, and the
   successor edge points at it. Markdown either grows contradictory or loses
   the history.
2. **"What did I believe when?"** A conclusion drawn six months ago can be
   re-examined against what was known at that time, which is the difference
   between an audit trail and a pile of assertions.

This maps directly onto the `Stale When` section every research note here
carries. That section is a hand-written, manually-evaluated `invalid_at`. A
temporal graph makes it a field.

Benchmark context, read narrowly: Zep/Graphiti ~63.8% vs mem0 ~49.0% on
LongMemEval. The headline gap matters less than *where* it comes from — mem0's
reported weakness is specifically temporal reasoning, which is the one axis this
tier is chosen for.

### Cognee and Graphiti overlap; running both is paying twice

Both build a knowledge graph from unstructured input via LLM extraction. They
are not layers that compose, they are two answers to the same question.

Cognee's ECL adds typed ontologies and a `memify` refinement pass. The costs are
concrete, not hypothetical:

- **A graph DB is mandatory** (Kuzu default; Neo4j/Memgraph/Neptune supported)
  for the reasoning features that are the reason to adopt it at all.
- **Ingestion is LLM-bound**: roughly one extraction call per ~1k-token chunk.
  Published estimate ~$26 per 6M tokens ingested, ~6,000 calls. Cold start on an
  existing archive is the expensive moment.
- **Ontology lock-in**: edge reasoning is grounded in Cognee's model.
- **`memify` keeps mutating the graph**, so the store is never quiescent.

Cognee earns this when the *ontology* is the product — typed entities and
multi-hop queries over a domain model. For "keep my accumulated technical
opinions from going stale", the typed ontology is the part you do not need and
the extraction bill is the part you do pay.

**Recommendation: Graphiti alone.** It is the narrower tool aimed precisely at
supersession. Add Cognee only if a specific multi-hop query fails against the
Graphiti graph — and log that query as the trigger.

### The un-reviewable write path is the real risk of any graph memory

The honest counterargument, which the vendor material consistently understates:
**an LLM-extracted graph cannot be code-reviewed.** Extraction quality varies
with model choice; entities get split or merged wrongly; a hallucinated edge is
indistinguishable from a sound one at retrieval time. This is the memory-
poisoning and reference-looping failure mode with a graph shape.

Markdown-in-git has the opposite property — it is slow and dumb but every write
is a reviewable diff.

The mitigation is to keep the human-authored note as the **source of record**
and treat the graph as a **derived index**: notes remain the artifact a human
reads and edits, and the graph is built from them and can be rebuilt from
scratch. Then a bad extraction is a rebuild, not a corruption. Never let the
graph become the only place a fact exists.

### Sharing: partition by tier, not by project

The multi-tenant RAG literature is answering an adversarial question — isolation
between untrusted tenants, filter-bypass attack vectors, per-tenant cost
attribution. For a single human across their own projects, none of that threat
model applies, so the isolation arguments should be discounted heavily.

The one finding that *does* transfer is mechanical: with a shared index,
metadata filters applied **after** ANN search silently drop recall, because the
candidate pool is dominated by out-of-scope vectors. Pre-filtering avoids this
where the store supports it.

But the framing "shared index with filters vs. an index per project" is the
wrong axis, because it assumes every tier wants an index. The better partition:

| Tier | Store | Rationale |
|---|---|---|
| Project memory | **no index** — grep the repo | small, lexical, and re-derivable |
| Global knowledge | **one shared graph** | cross-project links are the value |
| Per-project view | same graph, `project` property | a filter, not a second store |

Global knowledge should be one store precisely *because* connecting an insight
from project A to project B is the entire reason the tier exists. Sharding it
per project would delete the value. Scope becomes an edge property used to bias
retrieval, never a wall.

Practical guard: prefer pre-filtered queries, and when scoping by project,
retrieve unscoped as well and let scope influence ranking rather than eligibility.
Otherwise the filter re-creates the silo the shared store was meant to remove.

### Where mem0 actually sits

"Waste of time" is too blunt. mem0 is a competent extraction-and-recall layer
for **conversational personalization** — remembering user preferences across
chat sessions, with a fast SDK and low lock-in. That is a real product need.

It is simply not this need. Its documented weak axis is temporal reasoning,
which is the only axis that makes the global tier worth building. Choosing mem0
here means adopting a service dependency to solve the part that was already easy
(storing facts) while under-serving the part that is hard (expiring them).

Skip it for this. It would be the right call for a user-facing assistant.

## Correction: Prior Art Exists And Supersedes Most Of The Above (2026-08-25)

**LearnOps is not a concept to evaluate. It is a shipped subsystem** (its own
repo, extracted from LifeOps) already backed by Cognee and Graphiti, with slices
601–608 complete and qualified against a live runtime.

The governing decision already exists in the LifeOps repo at
`docs/context/research/personal-knowledge-plane.md`
(checked 2026-07-25, budget deep), plus seven related notes. Read those before
this section. Two of my recommendations above were wrong, and the existing
design is better on both.

### Where the earlier analysis was wrong

**1. "Cognee and Graphiti overlap; running both pays twice" — wrong here.**

That objection assumed both tools extract from the same raw corpus. The shipped
architecture gives them different inputs and different questions:

| | Cognee | Graphiti |
|---|---|---|
| Input | approved PersonalWiki pages + source metadata | lifecycle **episodes** |
| Answers | "map this topic", "expand to all learning" | "what changed", "what was true then" |
| Shape | semantic breadth, NodeSet-anchored traversal | temporal depth, supersession |

Semantic breadth and temporal depth are genuinely separate needs, and each tool
is strongest at its half. The cost objection (LLM-bound ingestion) still holds
as an operating expense, but "redundant" was incorrect.

**2. "Scope as an edge property, never a wall" — incomplete and unsafe.**

I collapsed two boundaries that must stay separate. The shipped design splits
them correctly:

- **Dataset** = permission, processing, and **deletion** boundary — a real wall.
- **NodeSet** = semantic tag and graph anchor — a filter.

My version would have made privacy a ranking bias. Health, finance, and employer
material need a wall, and "forget this course" needs a deletion boundary that a
tag cannot provide. The correct rule is: **semantics filter, privacy walls.**

### Where it converged (independent agreement, so worth trusting)

- Graph as a **rebuildable projection**, never the sole home of a fact. Stated
  in the goal doc as "Cognee and Graphiti remain rebuildable projections;
  PersonalWiki/domain source records remain truth."
- **One shared plane, not a brain per project.** "One Cognee/Graphiti
  installation or database per project" is explicitly a rejected approach there.
- **No LLM-minted identity.** They go further with SKOS/CASE/PROV-O stable URIs;
  "Letting an LLM-generated label become a durable concept identifier" is
  rejected. This is the un-reviewable-write-path risk, solved properly.
- **Consumers never touch the graph.** Browsers and FleetController read
  sanitized projections only.

### The actual open gap: cross-repo research discovery

The plane defines six publishers — LifeOps, LearnOps, FinanceOps, HealthOps,
HomeOps, PersonalWiki. **Code repositories are not among them.**

The cost of that is not theoretical — **this session is the proof**. A full
research pass was spent re-deriving Cognee/Graphiti/temporal-memory conclusions
that `personal-knowledge-plane.md` already held in better form. The plane could
not be consulted because ArchPatterns has no route into it.

**A seventh publisher was proposed and rejected.** See "Rejected Approaches".
The short version: the demonstrated failure is a **read/discovery** miss, and
the proposal answered it with a **write** system. Diagnosing that correctly
changes the fix entirely.

### The fix: extend the memory preflight across repos

`kb-research` already opens with "First Check Local Memory" — read
`docs/context/PROJECT.md`, check `docs/context/research/README.md`, search
existing notes, check staleness. Every one of those steps is **repo-local**.
That single scoping assumption is the whole bug.

The fix is to make that preflight cross-repo:

- Maintain an index of research notes across personal repos, holding only
  **title, `Applies When` scope, owning repo, and repo-relative path** — enough
  to decide "has this been answered already?" and nothing more.
- `kb-research` consults it before browsing, exactly where it already consults
  the local `research/README.md`.

Properties that make this the right size of fix:

- **No data moves.** The index holds pointers, not findings. Nothing from any
  repo is copied, embedded, or published.
- **No new trust boundary.** No write path, no privacy gate, no receipt
  convergence, no graph.
- **It inverts the flow safely.** The index points *at* notes for an agent to
  read locally in a repo it already has open.

One wrinkle that must be handled, or the fix reproduces the leak it avoids:
**the index cannot live inside a participating repo.** An index committed to
repo A that lists repo B's paths re-creates exactly the cross-repo path
disclosure that had to be scrubbed from this note. It belongs in user-global
agent config (alongside the other global-tier memory), not in any repo tree.

Only after that is in place, and only if it proves insufficient, is read-only
federation (querying the plane without publishing) worth revisiting — and that
still requires a prompt-injection threat model first, because research notes are
LLM-synthesized from fetched web pages and their consumers here are autonomous
agents rather than browsers.

## Sources

**Prior art (read first — supersedes the generic research below).** Referenced by
repo-relative path; resolve against the local checkout of each repo. Absolute
host paths are deliberately not recorded here (see "repository paths are never
identity" in the publication contract).

In the **LifeOps** repo:

- `docs/context/research/personal-knowledge-plane.md` — the governing decision
- `docs/context/research/learnops-learning-wiki-graph-boundaries.md` — Cognee/Graphiti role split
- `docs/context/research/learnops-standards-aligned-evolving-learning-graph.md` — CASE/SKOS/PROV-O identity
- `docs/context/research/model-knowledge-cutoffs-and-grounded-lessons.md` — `modelKnowledgeCutoff` vs `sourceEvidenceCutoff`
- `docs/context/research/three-month-learning-tool-stack.md` — "do not add another canonical notes or graph system"
- `docs/context/goals/cognee-graphiti-shared-knowledge.md` — slices 601–608, complete

In the **LearnOps** repo:

- `docs/contracts/personal-knowledge-publication.md` — the publication contract, four-target receipt model, privacy boundary

**External:**

- orchestrator.dev, "Claude Code & Agent Memory: Best Practices for 2026" — tier model
- deepwiki.com/getzep/graphiti, "Temporal Awareness and Bi-Temporal Model" — `valid_at`/`invalid_at` vs `created_at`/`expired_at`, automatic edge invalidation
- arxiv.org/abs/2501.13956, "Zep: A Temporal Knowledge Graph Architecture for Agent Memory" — primary source for the architecture
- getzep.com, "What Is a Temporal Knowledge Graph?" — supersession rather than overwrite (vendor)
- docs.cognee.ai/setup-configuration — mandatory graph DB, supported backends
- cognee.ai/cost-calculator — ~$26 per 6M tokens ingested; LLM extraction dominates
- stackoverflow.com/q/79968814 — post-filter ANN recall loss on shared multi-tenant indexes
- truto.one, appscale.blog — multi-tenant RAG isolation (adversarial threat model; largely N/A single-user)
- amitray.com, "Claude.md vs Agents.md vs Memory.md, Skills.md, Context.md" — file-role split
- menuagentic.com, "LanceDB vs Chroma vs sqlite-vec vs FAISS" — local vector store shapes; lexical-over-embedding trend
- aliteq.com, "Best Vector Database for Local RAG in 2026"
- affine.pro, "Obsidian MCP: Setup Routes, Limits, and Alternatives (2026)" — no first-party MCP; REST route requires the app running
- masteraikit.com / jonjones.ai — Obsidian-as-agent-memory setup (vendor-adjacent, read critically)
- particula.tech, tokenmix.ai, atlan.com — mem0/Zep/Letta/Cognee comparisons and LongMemEval figures (vendor-adjacent)
- pypi.org/project/simplerag, github.com/mrdbourke/simple-local-rag — what "SimpleRAG" actually refers to

## Applies When

Choosing where agent memory lives for a repo-scoped coding agent, or deciding
whether to add retrieval infrastructure to a markdown knowledge base.

## Stale When

- A first-party Obsidian MCP endpoint ships that does not require the desktop app.
- Copilot CLI or Claude Code formalizes a memory path that supersedes
  `docs/context/**` conventions.
- A memory framework publishes a benchmark on *codebase* tasks rather than
  conversational recall.
- This repo's memory directory exceeds a few hundred documents.

## Rejected Approaches

- **Cognee alongside Graphiti.** ~~Rejected~~ **Reversed 2026-08-25** — this was
  wrong. It assumed both extract from the same raw corpus. In the shipped
  LifeOps plane they take different inputs (approved wiki pages vs. lifecycle
  episodes) and answer different questions (semantic breadth vs. temporal
  supersession). Both are warranted.
- **Scope as an edge property with no hard boundary.** Reversed 2026-08-25 —
  unsafe. Privacy and deletion need a real wall (Cognee *dataset*); only
  semantics should be a filter (*NodeSet*). Semantics filter, privacy walls.
- **Code repos as a seventh knowledge-plane publisher.** Proposed and rejected
  2026-08-25 after adversarial review. Five independent grounds, any one
  sufficient:
  1. **Categorical gate, not a sensitivity ranking.** The publication contract
     names "employer" as a prohibited content class until isolation, deletion,
     residue, rebuild, and recovery qualification passes, and the goal reserves
     onboarding to an *attended* human decision. "Lowest-sensitivity corpus,
     therefore onboard first" reframes a class prohibition as an ordering
     problem — a gate bypass, not an argument.
  2. **No coherent domain owner.** Code repos are absent from the publication
     policy table, and the nearest owner (LifeOps) is explicitly barred from
     publishing employer detail. A research note is a derived opinion about
     third-party systems, not a domain record.
  3. **Dataset separation does not contain it.** Cross-dataset federation is a
     designed feature; entity resolution merges into shared node names below the
     dataset line; embeddings are a derived copy whose residue-free deletion is
     unproven. Ingest, not query, is the exposure event.
  4. **Agent consumers make notes an injection channel.** Notes are LLM-
     synthesized from fetched web pages. Published as authoritative cross-repo
     prior art and consumed by autonomous agents, a poisoned note becomes a
     durable, semantically retrievable instruction channel — and Graphiti
     supersession makes it persist rather than decay.
  5. **The receipt model does not admit it.** No code repo can issue a
     target-origin receipt, so publications either never reach `current` or
     someone weakens the four-target aggregate that protects all six legitimate
     domains. That is a security regression traded for research dedup.

  Disconfirming evidence found during review: the exemplar note (this one)
  already leaked absolute host paths in its body and `Sources`, breaking both
  minimization and "repository paths are never identity" — on the best-case,
  hand-picked, technical-only sample. Fixed, but it stands as evidence that
  "we will simply exclude employer detail" is an intention without enforcement.
- **Scoping the fix to a non-employer repo only.** Rejected: not a reduction —
  leaves the domain-ownership, receipt-model, and containment problems intact
  while adding a per-repo classification judgment that will drift.
- **A graph brain per project.** Rejected: one shared plane; per-project
  installations were already rejected in the LifeOps plane.
- **mem0 for the global tier.** Rejected: optimized for conversational
  personalization; its documented weak axis is temporal reasoning, the exact
  axis this tier exists to serve.
- **Sharding the global graph per project.** Rejected: cross-project connection
  is the value of the tier; scope belongs as an edge property influencing
  ranking, not as a separate store.
- **A graph as the sole home of a fact.** Rejected: LLM extraction is an
  un-reviewable write path. The graph must stay a derived, rebuildable index
  over human-authored notes.

- **Obsidian vault as the authoritative project memory.** Rejected: not
  versioned with the code, so project facts cannot be invalidated by the commit
  that falsifies them; REST route additionally requires the desktop app running.
- **Embedding RAG over `docs/context/**` now.** Rejected: corpus is far too
  small and too lexically strong to beat ripgrep; adds a re-index obligation and
  a semantic-drift failure mode for no measured recall gain.
- **Adopting mem0 / Letta / Zep for this repo.** Rejected: solves cross-session
  conversational personalization, not repo-grounded correctness; introduces an
  un-reviewable write path competing with git.
- **A single flat `MEMORY.md`.** Rejected: mixes facts with different lifetimes
  in one file, so nothing can be expired independently and the file only grows.

## Impact On Current Project

The tier model is a pattern this repo can express in its own idiom — a contract
plus a checker, the same shape as `themes/`:

1. **Memory path contract.** Global preferences in the user home; project
   contract at repo root (`AGENTS.md`); project memory under `docs/context/**`,
   committed with the code that makes it true; scratch outside the repo.
2. **Retrieval default is grep.** No vector index until a documented threshold
   is crossed and the gain is measured, not assumed.
3. **Obsidian is an optional read-side satellite,** never a dependency. The
   vault may link into the repo; the repo may not require the vault.

The checkable properties worth building, in rough order of value:

- `check:memory-freshness` — every path referenced in `docs/context/**` resolves
  on disk. Directly attacks the top failure mode.
- `check:memory-budget` — a byte ceiling on always-loaded memory, since
  unbounded growth is the failure nobody notices until startup is expensive.
- `check:memory-tier` — no file asserts facts belonging to a different tier
  (e.g. repo memory must not encode personal preference).

That first check is the highest-leverage item here and follows the repo's
existing thesis: a memory file that claims a path exists is exactly the kind of
plausible-looking output that fails on the part nobody measures.
