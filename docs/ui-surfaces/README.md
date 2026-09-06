# UI surface catalog

This catalog helps an agent choose the shape of a user interface before it
chooses components, a theme, or a rendering library. It is a companion to
`ui-craft`, not an architecture-pattern card and not a framework mandate.

The problem it addresses is structural: a page made from a repeated card grid
or an unearned table can be visually polished and still fail to support the
work. A card and a table remain useful structures. They are not default
information architectures.

## Choose the work before the widgets

Use [`references/`](references/) as worked examples. A consuming application
stores its own declaration, conventionally at `docs/ui/surfaces/<surface>.json`.
It names the user's primary verb, dominant structure, rationale, rendering lane,
semantic control plane, and proof required before the surface is accepted.

The default is to invoke this repository's installed checker against the
consumer declaration:

```powershell
node <path-to-ArchPatternsForAgents>/scripts/check-ui-surface-catalog.mjs docs/ui/surfaces/<surface>.json
```

To vendor the checker, copy both the `.mjs` checker and the schema, retain their
relative paths, and add the catalog's declared `ajv` dependency to the consumer
package before running it. The consumer owns that vendored copy and its future
updates.

[`consumer-declaration.example.json`](consumer-declaration.example.json) is a
plain consumer-owned declaration rather than a catalog test fixture.
Catalog fixtures are explicitly marked with `"fixture": true`; a consumer may
use an ordinary top-level `expected` field without changing how it is validated.

When a declaration adopts this catalog, record `catalog_reference` as shown in
the example: its identifier and version state the intended contract, the
locator identifies the source, and the schema SHA-256 pins the exact schema.
That provenance records the selection basis; it does not prove rendered
conformance.

| Surface kind | Primary work | Good dominant structures |
|---|---|---|
| `explore` | find relationships, patterns, or evidence | map, canvas, timeline, graph, dossier |
| `operate` | inspect and change a live system | topology, inspector workbench, queue, command surface |
| `decide` | compare evidence and commit a decision | staged review, scenario view, comparison sheet |
| `create` | compose a durable artifact | document workspace, editor, diagram, storyboard |
| `monitor` | notice change and diagnose a signal | trace, event stream, schedule, signal readout |

The dominant structure gets the visual hierarchy and interaction budget. A
table, card, or metric can support it only when it represents its own actual
data shape.

## The layout boundary

The declaration checker enforces two narrow rules:

- `card-grid` is a primary structure only for `heterogeneous-items`: neighbouring
  items differ materially in fields or action.
- `table` is a primary structure only for `shared-columns`: rows genuinely share
  a stable set of comparable columns.

The declaration must state why its primary structure exists. A real inspector,
canvas, timeline, document workspace, or staged review is a better starting
point than an empty prohibition against cards.

## Rendering ladder

High-fidelity work means deliberate information design and interaction, not
automatically a 3D scene. Choose the narrowest rendering lane that represents
the work well, and provide an accessible fallback whenever visual state carries
meaning.

| Lane | Earn it when | Preserve |
|---|---|---|
| `semantic-dom` | documents, forms, settings, review, readable evidence | native semantics and keyboard operation |
| `expressive-2d` | diagrams, timelines, dense signals, maps, flow | text equivalents and non-pointer controls |
| `gpu-scene` | spatial relationships, simulation, large interactive geometry, immersive inspection | a semantic inspector and a 2D or DOM fallback |
| `native-composition` | desktop windowing, platform animation, or device integration meaningfully improves operation | platform accessibility and keyboard paths |

Do not put a GPU scene behind a normal data table just to make it look more
technical. Do use a GPU scene when geometry, scale, or spatial interaction is
the information itself.

## Proof boundary

Run the deterministic declaration check:

```powershell
npm run check:surfaces
```

That proves a declaration is complete and rejects unearned primary card grids
and tables. It cannot prove the application looks good or performs the intended
workflow. A consumer application must additionally prove semantic controls,
keyboard operation, rendered behavior, and visual judgment at the client
boundary.

See [platform lanes](platform-lanes.md) for non-binding renderer and application
recommendations. See [the UI-craft skill](../../.github/skills/ui-craft/SKILL.md)
for semantic HTML, accessibility, layout, motion, and finish rules.
