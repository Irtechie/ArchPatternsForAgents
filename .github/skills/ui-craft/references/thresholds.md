# Thresholds and their evidence

Every number the checker uses comes from measuring nine shipped UniversalUI
owner sites at `ce75e79` (2026-08-21) and four generated theme components.
None is a preference.

**These are unvalidated defaults.** They have never been tested for precision or
recall against a labelled set. Report them as prompts to look, never as
findings.

## Measured baselines

Shipped owner sites:

| Owner | div/span | Distinct | Rich | grid-template | vars | clamp |
|---|---|---|---|---|---|---|
| agent127 | 23% | 16 | 0 | 8 | 16 | 9 |
| healthops | 22% | — | 0 | 7 | 14 | 14 |
| homeops | 26% | 14 | 0 | 4 | 14 | 7 |
| personalwiki | 28% | 14 | 0 | 4 | 12 | 8 |
| learnops | 27% | 22 | 1 | 3 | 13 | 0 |
| financeops | 28% | 45 | 11 | 41 | 24 | 21 |
| jobfinder | 30% | — | 0 | 10 | 12 | 9 |
| lifeops | 30% | — | 0 | 11 | 11 | 11 |
| fleetcontroller | 46% | 18 | 1 | 17 | 20 | 0 |

Generated theme components:

| Component | div/span | Distinct | Vocabulary |
|---|---|---|---|
| gritty-cyberpunk/override-toggle | 83% | 5 | `div h1 input label span` |
| pristine-minimalism/orbital-pane | 86% | 3 | `div span svg` |
| nocturnal-forge/allocation-dial | 91% | 3 | `div span svg` |
| deep-lab-tech/oscilloscope-matrix | 95% | 3 | `div span svg` |

## Thresholds

| Check | Level | Threshold | Why |
|---|---|---|---|
| Drag interaction, no native control | FAIL | any | No keyboard, no value, no role. Strictly worse than a hidden control. |
| Control `display:none` / `visibility:hidden` | FAIL | any | Removes it from tab order *and* the accessibility tree. |
| Motion without `prefers-reduced-motion` | FAIL | any `@keyframes`, `animation:`, or `transition: transform` | Vestibular hazard; the guard is one media query. |
| div/span share | FAIL | > 45% | Estate tops out at 46% (fleetcontroller, a true positive). Every generated component sits at 83–95%. |
| Rich semantic elements | WARN | 0, or < 3 | See denominator caveat below. |
| `grid-template` count | WARN | < 8 | Below this, layout is usually one repeated shape. FinanceOps has 41. |
| Custom properties | WARN | < 7 | Estate range 11–24. A named palette needs 7–11. |
| `clamp()` | WARN | 0 | Fixed rather than fluid type and spacing. |
| Constrained measure | WARN | 0 `max-width` in ch/rem/em | The most common single cause of an unconsidered page. |
| Layered ground | INFO | fewer than 2 linear + 1 radial gradient | Convention, not a defect. |

## The denominator caveat

Rich-element absence is **WARN, never FAIL**. The script cannot see content
shape, and a site whose views genuinely hold no tabular, ranged, temporal or
disclosable data is not defective for omitting `<table>`, `<meter>` and `<time>`.
Agent127 scores zero here and is one of the two sites held up as exemplary.

This is the same rule that governs drift counts elsewhere in this repo: a count
proves nothing without the population that could have exhibited the defect.

## Blind spots

Declared, because a check that cannot see a location will otherwise have its
silence read as evidence.

| Not seen | Consequence |
|---|---|
| **Accessible name quality** | A label-wrapped control takes its name from the label's text. If that text is the word painted on the skin, the control is announced as "SAFE" instead of "Engage override" — structurally perfect, semantically wrong. Found by comparing two conformant candidates, not by this script. |
| Runtime DOM | Elements built by string concatenation or `innerHTML` are invisible. |
| Element *volume* per shape | Ten `<table>`s and one `<table>` score the same. |
| Whether a `<table>` was the right call | Semantics of the data are not inspected. |
| Contrast, colour blindness, focus-visible styling | No colour analysis at all. |
| ARIA attributes | A correct `role`/`aria-*` custom control still trips the drag-driven FAIL, and a missing `aria-hidden` on a decorative layer is not flagged. |
| Non-CSS styling | Inline `style=` and CSS-in-JS are not counted. |

## Corrections already applied

Recorded because each was a false positive that survived until it was run
against real code.

| Bug | Fix |
|---|---|
| `\bjsxs?\(` missed `_jsx(` — `_` is a word character, so the boundary never matched. FinanceOps read as 1 element instead of 588. | Resolve factory aliases from each file's own imports. |
| `<([a-z])` matched the `<b ` in an expression like `a<b `, inventing elements in built JS. | Apply that pattern only to `.jsx`, `.tsx`, `.html`. |
| `.d.ts` files counted as unread blind spots. | Excluded; they emit nothing. |
| `\bbutton\b` matched the class `.financeops-site__decision-room__icon-button`. | `(?<![\w-])…(?![\w-])`. A class named for a control is not one. |
| A bare `transition:` flagged as a motion hazard. LearnOps has three colour fades and zero keyframes. | Require `@keyframes`, `animation:`, or a `transform` transition. |
| "Controls reachable: yes" on a dial that had no control at all. | Added the drag-driven-with-no-native-control check. |
