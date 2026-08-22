# Themes

Reusable aesthetic profiles for UI work. Another project asks this repo for a
theme, applies its tokens and technique, and authors its own markup from the
`ui-craft` element rules.

## Pick a look

**[GALLERY.md](GALLERY.md)** — four full pages, the same data, four finishes,
each with a rendered image. Choose by eye there, then come back here for the
rules.

Every theme ships `themes/<id>/page.html`, a complete console demonstrating the
theme at page scale, and `themes/<id>/preview.png`, its rendered image. All four
pages pass both checks with zero failures.

## Use one

1. Read `index.json`. Pick a theme `id` by its `use_when`, not by its looks.
2. Apply the theme's `ground`, `accents`, `type` and `technique`.
3. Author markup from
   [`.github/skills/ui-craft/SKILL.md`](../.github/skills/ui-craft/SKILL.md) Rule 1.
   **Do not copy the DOM of a `visual-reference` component.**
4. Verify. Both must exit 0:
   ```
   node .github/skills/ui-craft/scripts/check-ui-craft.mjs <your-dir-or-file>
   node scripts/audit-a11y-names.mjs <your-page.html>
   ```

## Conformance levels

| Level | Meaning |
|---|---|
| `conformant` | Markup and operability pass the checker. Copy structure and style. |
| `visual-reference` | The look is right; the markup is not. Copy the finish, not the DOM. |

Every **page** here is `conformant`. Every **single component** except one is
`visual-reference`. Both facts are findings, not oversights — see below.

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
**not** from the checker — which measured both as passing. A structurally perfect
control can still be announced by the wrong name.

That gap is now a check rather than a note. `scripts/audit-a11y-names.mjs` loads
each page in a real browser and reads the *computed* accessible name of every
control, so it sees what a screen reader would. It earned its place on its first
run by catching a defect the regex checker passed: a slider with no accessible
name at all, because its wrapping `<label>` contained an `<output>` before the
`<input>` — and `<output>` is itself a labelable element, so the label bound to
the output and the slider got nothing. Presence of a `<label>` is not evidence of
a name.

## Then the pages

The four themes were rebuilt at page scale, each authored against
[`_shared/substrate-contract.md`](_shared/substrate-contract.md) and required to
pass the checker before being handed back. Same aesthetic briefs as the
components above:

| Theme | As a component | As a page |
|---|---|---|
| `deep-lab-tech` | 95% div/span, 3 distinct, 0 rich | **0%**, 49 distinct, 24 rich |
| `nocturnal-forge` | 91%, 3 distinct, 0 rich | **0%**, 41 distinct, 17 rich |
| `pristine-minimalism` | 86%, 3 distinct, 0 rich | **2%**, 35 distinct, 14 rich |
| `gritty-cyberpunk` | 83%, 5 distinct, 0 rich | **3%**, 45 distinct, 18 rich |

The variable was the constraint, not the prompt. Nothing was made uglier by
being semantic, which is the second time the same claim has survived a test.

Three defects in those pages were found only by rendering them and looking, and
two of the three were mine: a preview script that overwrote real values while
priming controls, so a dial displayed `22` beside its own caption reading `14`
— *the screenshot lied*; full-page capture stitching viewport tiles, so
`position: fixed` textures painted only the first tile; and an `feTurbulence`
grain that bled outside its element, because `feBlend` unions filter regions.
None of the three was visible to either checker. **Render it and look at it.**
