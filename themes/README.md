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

1. Read `index.json`. Pick a theme `id` by its `genre` and `use_when`, not by its
   looks. The `genre` decides what kind of surface it is, and therefore what data
   belongs on it — check the theme's `forbidden` list before you plan a layout.
2. Apply the theme's `ground`, `accents`, `type` and `technique`.
3. Author markup from
   [`.github/skills/ui-craft/SKILL.md`](../.github/skills/ui-craft/SKILL.md) Rule 1.
   **Do not copy the DOM of a `visual-reference` component** — follow its
   `use_instead`.
4. Verify. All must exit 0:
   ```
   node .github/skills/ui-craft/scripts/check-ui-craft.mjs <your-dir-or-file>
   node scripts/audit-a11y-names.mjs <your-page.html>
   ```

## Need a control, not a theme?

Read `index.json` → `controls.kinds`. Ask by **kind** — toggle, dial, fader,
gated action — and you get the fixed semantic substrate plus a pointer to a
conformant instance inside a working page, addressed as
`themes/<page>#<element-id>`:

| Ask for | Substrate | Go to |
|---|---|---|
| toggle | `input[type=checkbox]` | `gritty-cyberpunk/page.html#armSwitch` |
| dial | `input[type=range]` | `nocturnal-forge/page.html#driftDial` |
| fader | `input[type=range]` | `nocturnal-forge/page.html#structureFader` |
| exclusive choice | `input[type=radio]` in `fieldset` | `deep-lab-tech/page.html#profile-strict` |
| gated action | `button[disabled]` | `gritty-cyberpunk/page.html#commitButton` |
| option list | `select` | `pristine-minimalism/page.html#time-window` |

A dial and a fader are the same substrate with a different finish. That is the
whole point of the layer split, and it is why the index is keyed by kind rather
than by theme.

This exists because it was previously broken. Ask the registry for "a dial" and
the only thing named dial was `nocturnal-forge/allocation-dial.html` — 91%
`div`/`span`, built from drag handlers, containing **no form control at all**.
Every `visual-reference` component now carries a `use_instead` pointing at
something real, and `scripts/audit-control-index.mjs` fails if any pointer stops
resolving or if an entry's element is not the substrate it claims.

## Conformance levels

| Level | Meaning |
|---|---|
| `conformant` | Markup and operability pass the checker. Copy structure and style. |
| `visual-reference` | The look is right; the markup is not. Copy the finish, not the DOM — and follow `use_instead` to a conformant equivalent. |

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
| `nocturnal-forge` | 91%, 3 distinct, 0 rich | **0%**, 28 distinct, 9 rich |
| `pristine-minimalism` | 86%, 3 distinct, 0 rich | **0%**, 19 distinct, 7 rich |
| `gritty-cyberpunk` | 83%, 5 distinct, 0 rich | **7%**, 32 distinct, 12 rich |

Three of those four pages were then rebuilt a second time, and the numbers above
are the rebuild. The first version of each passed both per-page checks and was
still wrong: the four shared **57%** of their element vocabulary and three had no
element unique to them. See [`GALLERY.md`](GALLERY.md) for the full before/after.
The counts fell because a restraint theme is now permitted to be small.

The variable was the constraint, not the prompt. Nothing was made uglier by
being semantic, which is the second time the same claim has survived a test.

Three defects in those pages were found only by rendering them and looking, and
two of the three were mine: a preview script that overwrote real values while
priming controls, so a dial displayed `22` beside its own caption reading `14`
— *the screenshot lied*; full-page capture stitching viewport tiles, so
`position: fixed` textures painted only the first tile; and an `feTurbulence`
grain that bled outside its element, because `feBlend` unions filter regions.
None of the three was visible to either checker. **Render it and look at it.**
