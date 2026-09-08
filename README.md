# ArchPatternsForAgents

A language-independent catalog for making architectural drift visible in
AI-assisted applications.

This is not a framework or runtime. It gives an application concrete seams to
check: who owns a decision, which contract crosses a boundary, where an LLM may
help, and where deterministic code or a hard control must remain responsible.

## Why use architecture patterns?

An AI-generated change can solve the immediate problem while putting a decision
in the wrong module, duplicating another service's rules, or adding a fallback
that hides a broken integration. Repeated over time, those locally plausible
changes make the system harder to understand and repair.

These patterns give maintainers and agents an explicit basis for judging a
change: **what belongs here, what must remain true, and what evidence would
show that the boundary has been broken.** The goal is to make drift conspicuous
before it becomes accepted architecture.

| Mechanism | How it helps expose drift and unnecessary complexity |
|---|---|
| One authoritative owner per decision | A caller acquiring a second copy of a provider's business rule becomes a visible ownership violation. |
| Explicit contracts between repositories | Cross-repository imports of private code, foreign database writes, and workarounds for provider failures have a named boundary to be reviewed against. |
| Small, optional patterns | Each additional role must serve a real workflow; adopting a pattern does not require another service, repository, or framework. |
| Invariants and concrete counterexamples | Review can identify a specific broken guarantee instead of debating whether code merely looks untidy. |
| Versioned adoption records | An application can identify which specification it uses, where it implements it, and where it has deliberately diverged. |
| Failure scenarios and boundary proof | A fluent answer or a passing mock cannot conceal an unverified side effect or a broken consumer connection. |
| Declared deterministic and probabilistic operations | A failed parser or API integration cannot silently become a model guessing the missing result. |

Skills guide how an agent performs work. Architecture patterns describe the
system that work must preserve. Use both: the skill can direct the workflow,
while the adopted pattern supplies the ownership rule and proof obligation.

## Find drift quickly

For one real workflow, answer four questions:

1. **Who owns the decision or state?** If more than one module owns it, the
   duplication is the first drift candidate.
2. **What seam does the caller cross?** It should depend on a public contract,
   not private implementation or foreign state.
3. **What must remain deterministic?** Parsing, arithmetic, known transitions,
   and defined retrieval should not silently become model guesses when they
   fail.
4. **What proves the boundary?** Run the owner's local test and a consumer
   probe that would fail if the seam drifted.

Use an adoption record to tie those answers to implementation locations,
deliberate deviations, and verification evidence. The record is not a claim of
conformance; it makes a later review faster and more specific.

The contracts are language-independent. Python, Rust, JavaScript, or TypeScript
can implement the same responsibility boundary; each implementation still has
to prove its actual transaction, cancellation, concurrency, and transport
behavior. Separate repositories make ownership crossings explicit, but the
separation only helps when responsibilities and contracts remain coherent.

Use this catalog when you want agents to extend an application without having
to rediscover its architecture on every task, and when maintainers need to
understand why a component exists and how to diagnose it later. It is especially
useful where model inference, tools, durable state, and independently owned
services meet.

**Documentation alone does not prevent drift.** These cards supply the rules
to inspect and test; they do not automatically enforce application architecture
or remove the need to read code. Their value depends on keeping adoption records
connected to implementation, running relevant checks, and reviewing whether the
responsibility still belongs where the change puts it.

## Start here

Read the [architecture-pattern catalog](docs/architecture-patterns/README.md).
Start with [ARCH-000: ownership and seams](docs/architecture-patterns/ownership-and-seams.md),
which establishes the parent boundary: each domain has an authoritative owner,
and repositories cross explicit seams rather than copying authority.

Each optional card defines:

- an invariant that must remain true;
- the owner and consumer boundary;
- expected failure behavior;
- a deliberately bolted-on counterexample; and
- owner-local and consumer-boundary proof scenarios.

The current catalog spans domain authority, repository contracts, model ports,
context and retrieval, decision memory, authorized tools, bounded workflows,
durable jobs, attention and operational evidence, evaluation boundaries, and
deterministic execution before probabilistic inference.

## Adopt a pattern in an application

1. Pick the smallest useful composition of cards for one real workflow.
2. Implement the ownership boundary and contracts in that application's own
   codebase; this repository supplies no shared runtime.
3. Record the card version, immutable locator, content hash, implementation
   locations, deliberate deviations, and verification evidence in an
   [application adoption record](docs/architecture-patterns/adoption-record.md).
4. Run the relevant deterministic tests and consumer-boundary probes.

An adoption record is evidence bookkeeping, not a conformance claim. A
documentation review verifies a card is complete; it does not prove that an
application works. Likewise, model-quality evaluation is distinct from
behavioral and live-boundary proof. See the catalog's [proof boundary](docs/architecture-patterns/README.md#proof-boundary).

For an end-to-end illustration, see the
[composed example](docs/architecture-patterns/composed-example.md). To draft a
new card consistently, use the [pattern template](docs/architecture-patterns/pattern-template.md).

## Keep the architecture useful as the code changes

For each meaningful change, identify the affected owner and adopted invariants,
inspect the implementation at that boundary, and refresh the relevant proof.
Evidence from an older revision remains historical evidence; it is not an
automatic claim about the new code. Changing the declaration to match a
violation does not resolve the violation.

The following practices strengthen adoption in a consuming application. They
are review practices to implement locally, not checks already supplied by this
catalog:

- **Make additions justify their cost.** Before adding a component, dependency,
  background process, or fallback, name the required behavior and explain why
  an existing owner cannot provide it more simply. Include what it replaces
  and how the old path will be removed.
- **Make exceptions temporary and owned.** Record a deviation's reason, owner,
  review trigger, and removal or migration condition. Otherwise a temporary
  workaround can quietly become permanent architecture.
- **Test that violations are detectable.** Where practical, use a deliberately
  invalid fixture or forbidden interaction to show that the relevant boundary
  check fails. A green check is weak evidence if it also accepts the failure
  it is supposed to catch.
- **Practice diagnosis and recovery.** Trace a representative failure from the
  consumer's symptom to the owning decision and recovery action. Keep enough
  context for a maintainer to do that without the original coding conversation.

Keep this proportional: adopt only the patterns needed by a real workflow and
retire declarations, adapters, and checks when their responsibilities disappear.
The catalog itself should not become a reason to accumulate more structure.

## UI surface catalog and craft registry

For interface work, start with the [UI surface catalog](docs/ui-surfaces/README.md).
It makes an agent name the user's primary work, dominant interaction structure,
rendering lane, semantic requirements, and proof obligations before selecting a
theme or a component library. A card grid or table is allowed when the data
shape earns it, not as the default page structure.

The [`themes/`](themes/README.md) directory is a separate, complementary
resource: four distinct UI surface profiles with real semantic controls and
machine checks. Use it after selecting a surface when an agent needs a visual
direction without collapsing into generic card layouts or inaccessible
`div`-based controls.

Start with [`themes/GALLERY.md`](themes/GALLERY.md), then read the
[UI-craft skill](.github/skills/ui-craft/SKILL.md). The governing rule is that
the element is the substrate and the theme is the finish: visual direction must
not replace semantic, keyboard-operable HTML.

## Verify the checked-in UI registry

```powershell
npm ci
npm test
```

`npm test` runs the semantic-page, accessibility-name, control-index, theme
divergence, visual-repetition, and preview checks. Those checks verify the UI
registry; they do not establish conformance of a consumer application to an
architecture card.

## Repository layout

| Path | Purpose |
|---|---|
| [`docs/architecture-patterns/`](docs/architecture-patterns/README.md) | Architecture cards, adoption format, composed example, and review receipts |
| [`docs/ui-surfaces/`](docs/ui-surfaces/README.md) | Surface declarations, worked structures, renderer lanes, and consumer checker |
| [`themes/`](themes/README.md) | UI profiles, gallery, contracts, and machine-readable registry |
| [`.github/skills/ui-craft/`](.github/skills/ui-craft/SKILL.md) | Portable UI-authoring guidance and checker |
| [`scripts/`](scripts) | Deterministic checks for themes and UI-surface declarations |
| [`docs/context/`](docs/context/PROJECT.md) | Project map, decisions, research, and operational context |

## License

UNLICENSED. This is a private repository.
