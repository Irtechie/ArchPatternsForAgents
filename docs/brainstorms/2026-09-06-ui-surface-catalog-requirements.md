# UI surface catalog requirements

## Objective

Extend the repository's UI-craft guidance with a platform-aware surface catalog
that gives agents positive alternatives to generic card grids and dashboard
tables. The catalog must help an application select an interaction topology,
rendering lane, and proof obligations before it begins composing components.

## User outcomes

- An agent selects the surface from the user's work: explore, operate, decide,
  create, or monitor.
- A surface has one dominant structure such as a canvas, timeline, inspector,
  queue, document workspace, topology, or staged review; cards and tables are
  supporting elements when their data shape warrants them.
- The rendering choice is made from the client interaction, not the backend
  implementation language. A Rust service can have a WebGPU-capable web client;
  a C# service can have a native desktop client.
- High-fidelity graphics are encouraged when they clarify spatial state,
  simulation, dense information, or direct manipulation. They are not
  decoration added to a non-spatial workflow.
- An agent can point to official framework lanes without claiming that a library
  is mandated by the architecture catalog.

## Initial scope

1. Create `docs/ui-surfaces/` as a companion catalog, separate from the
   architecture-pattern cards.
2. Define a small, machine-checkable surface declaration with the user verb,
   primary structure, rendering lane, supporting elements, prohibited defaults,
   accessibility requirements, and proof obligations.
3. Add reference entries for exploration, operation, decision, creation, and
   monitoring surfaces.
4. Add a platform/language guide. It must distinguish a service implementation
   language from the client renderer and name non-binding implementation lanes.
5. Update `ui-craft` so an agent declares its intended surface before selecting
   markup, layout, or a theme.

## Rendering decisions

The catalog uses a capability ladder, not a universal graphics mandate:

| Rendering lane | Use when | Example direction |
|---|---|---|
| semantic DOM, CSS, and SVG | text, forms, documents, sparse data, accessible controls | editor, staged approval, dossier |
| expressive 2D canvas or SVG | timelines, diagrams, dense telemetry, map-like views | dependency explorer, event trace |
| GPU scene | spatial relationships, simulation, large interactive geometry, immersive inspection | topology, facility layout, 3D product/configuration view |
| native composition | a desktop application benefits from platform-level windowing or animation | desktop operator workbench |

For JavaScript and TypeScript web clients, the recommended GPU lane is Three.js
with a capability-checked WebGPU path and a WebGL 2 fallback. React Three Fiber
is an optional React renderer for the same Three.js scene model. For Rust,
Tauri is a desktop shell option that can host a web client while Rust owns local
commands or service logic; it is not a reason to put rendering inside a backend.
For C#, ordinary application surfaces remain appropriate for WinUI, Avalonia, or
other native UI stacks; a game engine is outside this catalog's default lane.

## Constraints

- Do not create an architecture card for visual style or a framework choice.
- Do not require Three.js, React, Tauri, WebGPU, or any external runtime.
- Do not imply that a GPU scene is more appropriate than an accessible semantic
  surface when the work is primarily textual, tabular, or form-oriented.
- Keep a semantic, keyboard-operable control plane outside any decorative or
  GPU-rendered layer.
- Treat framework links as current reference evidence and keep recommendations
  explicitly non-binding.
- No profanity belongs in this requirements document, derived plans, or future
  brainstorm artifacts.

## Acceptance criteria

- A reader can choose a surface kind and rendering lane without guessing from a
  visual aesthetic alone.
- A declaration that makes a card grid or a table the primary structure without
  an explicit data-shape rationale fails deterministic validation.
- The catalog includes at least one positive alternative for each of explore,
  operate, decide, create, and monitor.
- The UI-craft skill directs an agent to the surface catalog before it applies a
  theme.
- The new deterministic check and the existing `npm test` suite pass.

## Question gate

| Question | Resolution |
|---|---|
| Should this release add live Three.js, Tauri, or native application demos? | No. The first release defines selection and proof, supplies worked surface references, and keeps external framework dependencies out of this static catalog. A host-specific demo is a follow-on once a consuming application supplies a real workflow. |
| Does every surface require 3D graphics? | No. GPU rendering is earned by the interaction and data geometry. High fidelity also includes deliberate typography, 2D graphics, motion, and direct manipulation. |
| Does a backend language prescribe its UI renderer? | No. The service/client seam decides that independently. |

## Sources consulted

- Three.js documents a `WebGPURenderer` that can use WebGPU and fall back to
  WebGL 2: <https://threejs.org/docs/pages/WebGPURenderer.html>.
- React Three Fiber documents itself as a React renderer for Three.js:
  <https://r3f.docs.pmnd.rs/>.
- Tauri documents support for web frontends with Rust, Swift, or Kotlin bindings:
  <https://tauri.app/start/>.
