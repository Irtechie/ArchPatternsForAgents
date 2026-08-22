# Themes

Reusable aesthetic profiles for UI work. Another project asks this repo for a
theme, applies its tokens and technique, and authors its own markup from the
`ui-craft` element rules.

## Use one

1. Read `index.json`. Pick a theme `id` by its `use_when`, not by its looks.
2. Apply the theme's `ground`, `accents`, `type` and `technique`.
3. Author markup from
   [`.github/skills/ui-craft/SKILL.md`](../.github/skills/ui-craft/SKILL.md) Rule 1.
   **Do not copy the DOM of a `visual-reference` component.**
4. Verify:
   ```
   node .github/skills/ui-craft/scripts/check-ui-craft.mjs <your-artifact-dir>
   ```

## Conformance levels

| Level | Meaning |
|---|---|
| `conformant` | Markup and operability pass the checker. Copy structure and style. |
| `visual-reference` | The look is right; the markup is not. Copy the finish, not the DOM. |

Every component currently here is `visual-reference`. That is a finding, not an
oversight — see below.

## The measured reason this split exists

Three themed components were generated from a detailed creative-director prompt
and then measured with the checker. A fourth followed:

| Component | div/span | Distinct elements | Vocabulary |
|---|---|---|---|
| `gritty-cyberpunk/override-toggle.html` | 83% | 5 | `div h1 input label span` |
| `pristine-minimalism/orbital-pane.html` | 86% | 3 | `div span svg` |
| `nocturnal-forge/allocation-dial.html` | 91% | 3 | `div span svg` |
| `deep-lab-tech/oscilloscope-matrix.html` | 95% | 3 | `div span svg` |
| **Shipped UniversalUI owner sites (9)** | **22–40%** | **14–45** | — |

Four for four. The aesthetic prompt made the CSS excellent and the HTML
measurably worse than the estate it was meant to improve on. The cause is a
prohibition that reads as broader than intended: *"do not use standard
components"* is followed as *"do not use standard elements."* So a frequency
matrix became nested `div`s, a metric with a label became a `div` and a `span`,
one toggle set `input { display: none }`, and the dial was built from drag
handlers with no form control at all.

Ranked by severity, worst first:

| Failure | Consequence |
|---|---|
| Dial with no native control | No keyboard, no value, no role. Nothing to announce. |
| `input { display: none }` | Skinned but unreachable by Tab, absent from the a11y tree. |
| Motion with no `prefers-reduced-motion` | Vestibular hazard. One media query fixes it. |
| 83–95% `div`/`span` | Meaning carried only by class names and CSS. |

**The rule that resolves all of it: the semantic element is the substrate, the
theme is the finish.** A machined toggle is still `<input type="checkbox">`, a
dial is still `<input type="range">`, a readout matrix is still `<table>`. Skin
them; never replace them. Nothing about the visual result reveals when this was
violated, which is why it is checked rather than reviewed.

## Add a theme

Create `themes/<id>/`, add the component, then append to `index.json` with
`measured` and `defects` filled in **from an actual checker run** — not from
reading the file. A component whose numbers were estimated rather than measured
is worse than one with no entry, because it will be trusted.

Promote a component to `conformant` only when the checker reports no `FAIL`.

## The first conformant component

`gritty-cyberpunk/override-toggle-conformant.html` is the same toggle on a real
substrate. It scores 15% div/span, 15 distinct elements, 5 rich elements, zero
`FAIL` — against the original's 83%, 5, 0 and three `FAIL`s. **The visuals are
unchanged.** That is the point: aesthetic direction and semantic substrate were
never in tension.

What changed: the checkbox is clipped rather than `display: none`; `:checked`,
`:focus-visible` and `:disabled` drive every themed state so the visual state
cannot drift from the real one; the visual layer is `aria-hidden` so the control
is announced as "Engage cybernetic system override" rather than as the word
painted on the handle; `<output>` is a live region, so state changes are spoken;
telemetry is `<dl>`/`<output>`/`<code>`/`<time>`; brackets moved to
`::before`/`::after`; and `prefers-reduced-motion` guards the glitch and the
spring travel.

The accessible-name fix came from comparing two independent conformant attempts,
**not** from the checker — which measured both as passing. That gap is now
recorded in
[`references/thresholds.md`](../.github/skills/ui-craft/references/thresholds.md)
under blind spots. A structurally perfect control can still be announced by the
wrong name.
