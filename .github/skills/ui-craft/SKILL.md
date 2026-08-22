---
name: ui-craft
description: Build interfaces from real HTML objects, purposeful layout and a named aesthetic theme, instead of generic card grids. Use when authoring or reviewing any UI surface, when a page has become rows of identical boxes, when a design feels drab or template-like, when picking a visual direction, or when choosing how to present structured data. Triggers on "make this look good", "less cards", "drab UI", "beautiful HTML", "design this page", "pick a theme", "UI review", or when adding a view to a UniversalUI owner site.
---

# UI Craft

Drabness is not a colour problem. It is an **element-selection** problem and a
**layout-density** problem, and both are measurable.

## The finding this skill is built on

Measured across nine shipped UniversalUI owner sites (`ce75e79`, 2026-08-21):

| Signal | Result |
|---|---|
| Owners with a named domain palette, fluid `clamp()` padding, root-scoped reset | **9 of 9** |
| Owners using **zero** rich semantic elements | **7 of 9** |
| Distinct `grid-template` declarations | 3 to 41 — a **13x** spread |

Every owner already has good colour tokens. The ones that look generic differ on
what elements they render and how many distinct layouts they compose. Do not
open a palette discussion when the page is a stack of `div`s.

## Rule 1 — the data shape picks the element

Before writing a container, name the shape of the data. The shape has an element.
Reaching for `div` + a class is how a page becomes a card grid.

| Data shape | Element | Not this |
|---|---|---|
| Rows sharing columns | `<table>` with `<caption>`, `<thead>`, `<th scope>` | a card per row |
| Name/value pairs | `<dl><dt><dd>` | two-column `div`s |
| Secondary detail on demand | `<details><summary>` | a modal, or always-visible clutter |
| A moment in time | `<time datetime>` | a formatted string |
| A value in a known range | `<meter>` | a `div` with a width percentage |
| Task completion | `<progress>` | the same, again |
| Image/diagram plus caption | `<figure><figcaption>` | stacked `div`s |
| A computed result | `<output>` | `<span>` |
| Quoted source | `<blockquote><cite>` | italic text |
| Grouped inputs | `<fieldset><legend>` | a heading above inputs |
| Ordered steps | `<ol>` | `<div>`s numbered by hand |
| Code or identifiers | `<code>`, `<pre>`, `<kbd>`, `<samp>` | styled `<span>` |
| Term first used | `<abbr title>`, `<dfn>` | nothing |

The payoff is not purity. A real element carries behaviour, semantics, and
default accessibility you would otherwise rebuild badly: `<details>` has state
without JavaScript, `<table>` gives screen readers row and column relationships,
`<time datetime>` is machine-readable, `<meter>` conveys range without a legend.

**A card is legitimate for exactly one thing: a heterogeneous item whose fields
differ from its neighbours'.** If neighbouring cards have the same fields, that
is a table wearing a costume.

## Rule 2 — layout density, not layout repetition

Aim for a distinct `grid-template` per section that has a distinct information
shape. A page whose every section is the same auto-fill card grid reads as
template output because it is.

- Give each section the layout its content needs. A hero is not a list is not a
  comparison is not a timeline.
- Use asymmetry deliberately: `minmax(0, 1.35fr) minmax(18rem, 0.65fr)` reads as
  designed; two equal columns read as default.
- Vary rhythm. A wide full-bleed section between two narrow ones creates pace.
- **Constrain the measure.** `max-width: 66rem` on prose, `max-width: 14ch` on a
  display heading. Unconstrained text is the most common single cause of a page
  looking unconsidered.

## Rule 3 — the visual recipe already exists; use it

Every shipped owner site converges on this. Copy the structure, change the
palette. Do not invent a fifth approach.

```css
.owner-site {
  /* Named domain palette, 7-11 tokens. Never gray-only. */
  --x-paper: #f4f0e6;   /* ground */
  --x-ink: #1a211d;     /* primary text */
  --x-muted: #5f6962;   /* secondary text */
  --x-line: #c8c2b5;    /* rules and borders */
  --x-green: #1f664c;   /* three or four semantic accents */
  --x-amber: #a56316;
  --x-red: #8c3d35;

  box-sizing: border-box;
  min-height: 100%;
  padding: clamp(1.4rem, 4vw, 4rem);
  color: var(--x-ink);

  /* Layered ground: two hairline grids + a radial glow + base. */
  background:
    linear-gradient(90deg, rgba(31, 102, 76, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(31, 102, 76, 0.08) 1px, transparent 1px),
    radial-gradient(circle at 92% 5%, rgba(207, 159, 70, 0.25), transparent 28rem),
    var(--x-paper);
  background-size: 3rem 3rem, 3rem 3rem, auto, auto;

  font: 500 1rem/1.55 "Segoe UI", ui-sans-serif, system-ui, sans-serif;
}

/* Display type: serif, fluid, tight leading, constrained measure. */
.owner-site h1 {
  max-width: 14ch;
  font: 600 clamp(2.8rem, 7vw, 6.6rem)/0.9 Georgia, serif;
}

/* Eyebrow: small, uppercase, tracked, accent-coloured. */
.owner-site__eyebrow {
  color: var(--x-green);
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}
```

Four moves do most of the work:

1. **Typographic contrast** — serif display against sans body. One axis of
   contrast beats five decorations.
2. **Fluid scale** — `clamp()` on the display size, the root padding, and the
   section gap. Not on body text.
3. **A ground that is not flat** — hairline grid plus one off-centre glow reads
   as ledger paper or a terminal, depending on the palette.
4. **Semantic accents** — green, amber and red carrying *meaning*, so colour is
   information rather than decoration.

## Rule 4 — earn the ornament

Every visual device must encode something. A gradient that means nothing is
noise; a gradient that separates two domains is a legend. If you cannot say what
a decoration tells the reader, delete it.

Corollary: **explain a lot in a little.** Density is the goal, not sparseness. A
table of twelve rows with a caption and aligned numerals communicates more, in
less space, than twelve cards — and it looks composed rather than generated.

## Rule 5 — the element is the substrate, the theme is the finish

Skinning a control never means replacing it. A machined toggle is still
`<input type="checkbox">`, a dial is still `<input type="range">`, a readout
matrix is still `<table>`. Style them with `appearance: none` and pseudo-elements.

This rule exists because it was violated four times out of four. Components
generated from a detailed creative-director prompt measured **83–95% `div`/`span`**
against a shipped-estate range of 22–40%, with vocabularies as narrow as
`div span svg`. One hid its checkbox with `display: none`, making a beautiful
control unreachable by Tab; one built a dial from drag handlers with no form
control at all, so it had no keyboard, no value and no role.

The cause is a prohibition read wider than it was meant: *"do not use standard
components"* becomes *"do not use standard elements."* Aesthetic direction and
semantic substrate are independent, and treating them as a trade is the single
most expensive mistake in this area.

Motion carries the same obligation: any `@keyframes` or transform transition
needs a `prefers-reduced-motion` branch. Glitch, parallax and spring effects are
a vestibular hazard, and the guard is one media query.

Concretely:

- Clip a control, never `display: none` it. `position: absolute; width: 1px;
  height: 1px; clip-path: inset(50%)` keeps it focusable and in the a11y tree.
- Drive theme state from `:checked`, `:focus-visible` and `:disabled` rather
  than from a JS class or inline style, so the paint cannot disagree with the
  real state.
- Mark the decorative layer `aria-hidden="true"`, or the control is announced by
  whatever word is painted on it instead of by its label.
- Style `:focus-visible` deliberately. Never suppress the outline; theme it.
- Announce state changes with `<output>`, which is a live region by default.

`themes/gritty-cyberpunk/override-toggle-conformant.html` is a worked example:
identical visuals, 83% → 15% div/span, three `FAIL`s → zero.

## Themes

Aesthetic direction lives in [`themes/`](../../../themes/), not in this skill.
Read `themes/index.json`, pick an `id` by its `use_when`, apply its `ground`,
`accents`, `type` and `technique`, then author markup from Rule 1.

**Copy the finish, never the DOM** of a component marked `visual-reference` —
that label means its markup failed the checker. Every component in the registry
is currently `visual-reference`.

## Check it

Do not self-report. Run:

```
node .github/skills/ui-craft/scripts/check-ui-craft.mjs <dir>
```

It reports element vocabulary, div ratio, rich-element count, layout density,
token presence and control operability, and exits non-zero on a failing grade.
Thresholds and the evidence behind them are in
[references/thresholds.md](references/thresholds.md).

## Scope

This governs presentation only. It does not decide what data a view receives,
and it never justifies loosening a host contract. When hosted in UniversalUI the
contract wins: exactly one `data-owner-site` marker, all styles nested under the
root class, and no absolute paths, timestamps or session ids in the artifact.
