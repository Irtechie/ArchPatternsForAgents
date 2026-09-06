# ArchPatternsForAgents

Practical, evidence-oriented architecture patterns for AI-enabled applications
and coding agents.

This repository is not a framework or a runtime. It is a catalog of bounded
patterns that let an application make its ownership, contracts, failure modes,
and proof obligations explicit. It also contains a machine-checked UI-craft
registry for agents building interfaces.

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

## UI craft registry

The [`themes/`](themes/README.md) directory is a separate, complementary
resource: four distinct UI surface profiles with real semantic controls and
machine checks. Use it when an agent needs to build a usable interface without
collapsing into generic card layouts or inaccessible `div`-based controls.

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
| [`themes/`](themes/README.md) | UI profiles, gallery, contracts, and machine-readable registry |
| [`.github/skills/ui-craft/`](.github/skills/ui-craft/SKILL.md) | Portable UI-authoring guidance and checker |
| [`scripts/`](scripts) | Deterministic checks for the theme registry |
| [`docs/context/`](docs/context/PROJECT.md) | Project map, decisions, research, and operational context |

## License

UNLICENSED. This is a private repository.
