# Substrate contract for theme pages

Every theme in this registry ships a full page at `themes/<id>/page.html`. This
file is what those pages agree on, and what they are free to disagree on.

## Three layers

| Layer | Fixed across themes? | Owned by |
|---|---|---|
| **Substrate** — the semantic element behind a control | **Yes, always** | this contract |
| **Composition** — which controls exist, how many, their hierarchy | No | the theme |
| **Finish** — colour, texture, type, motion, ornament | No | the theme |

A rotary dial and a horizontal fader are the same substrate,
`<input type="range">`, with different finishes. A channel bank of twelve
faders and a single hero dial are the same substrate with different
*compositions*. Only the first of those three is negotiable, and it is
negotiable in exactly one direction: never.

Nocturnal Forge should not have Deep Lab Tech's control set. That is the point
of a theme. What it may not do is stop using real controls to get there.

## The substrate table

| The control is… | The element is… | Never |
|---|---|---|
| a toggle, override, arm/disarm | `<input type="checkbox">` | a `div` with a click handler |
| a dial, fader, allocation, throttle | `<input type="range">` | a `div` with drag handlers |
| a mode, profile, channel picker | `<select>` or `<input type="radio">` | a list of clickable `div`s |
| a command, action, run trigger | `<button type="button">` | an `<a href="#">` |
| rows and columns of data | `<table>` with `<caption>`, `<th scope>` | nested `div`s |
| key/value readouts | `<dl>` / `<dt>` / `<dd>` | `div.label` + `div.value` |
| a bounded measurement | `<meter>` | a `div` with a width percentage |
| task completion | `<progress>` | a `div` with a width percentage |
| a live value that reflects a control | `<output for="…">` | a `span` updated by JS |
| a moment or duration | `<time datetime="…">` | a `span` |
| an identifier, path, hash | `<code>` | a `span.mono` |
| expandable detail | `<details>` / `<summary>` | a `div` with a height transition |
| a chart | inline `<svg>` with `<title>` + `<desc>` | a charting library |

## Non-negotiables

1. **Never `display: none` a control to skin it.** Clip it:
   `position: absolute; width: 1px; height: 1px; clip-path: inset(50%);
   overflow: hidden; white-space: nowrap;` — it stays focusable and in the
   accessibility tree.
2. **Drive every themed state from a native pseudo-class** — `:checked`,
   `:focus-visible`, `:disabled`, `:indeterminate`. If JS toggles a class to
   paint state, the paint can disagree with the real state.
3. **Mark the decorative layer `aria-hidden="true"`.** A label-wrapped control
   takes its accessible name from the label's text content, so a word painted
   on a knob will become the control's name unless the visual layer is hidden
   and a real label is supplied.
4. **Style `:focus-visible`, never suppress it.** Theme the outline.
5. **Guard motion.** Any `@keyframes`, `animation:` or `transition: transform`
   needs a `@media (prefers-reduced-motion: reduce)` branch.
6. **Announce changes with `<output>`**, which is a live region by default.
7. **Single file.** Inline `<style>` and `<script>`; fonts by CDN `<link>` with
   a real fallback stack. These pages must open from `file://` with no build.

## The shared payload

All four pages show the *same console with the same numbers*, so that a human
comparing them is choosing a style rather than comparing content. Compose it
however the theme demands — omit what does not fit, but invent nothing.

**Title:** Architecture Conformance Console
**Owner:** Irtechie / ArchPatternsForAgents
**Commit:** `ce75e79` · **Run:** 12 · **Time:** `2026-08-21T21:40`

Metrics:

| Label | Value | Range |
|---|---|---|
| Declared conformance | 7 | of 9 repos |
| Detector coverage | 82 | % of tree |
| Undeclared drift | 14 | findings, of 40 budget |
| Generic markup | 15 | % div/span |

Estate:

| Repository | Pattern | div/span | Elements | Checked | State |
|---|---|---|---|---|---|
| `financeops` | plugin-host | 22% | 45 | 2026-08-21 | pass |
| `agent127` | llm-assisted | 24% | 31 | 2026-08-21 | pass |
| `healthops` | plugin-host | 29% | 18 | 2026-08-20 | thin |
| `learnops` | plugin-host | 33% | 16 | 2026-08-20 | thin |
| `fleetcontroller` | undeclared | 46% | 12 | 2026-08-21 | **fail** |

Drift per run, twelve runs, 2026-06-14 → 2026-08-21:
`38, 33, 30, 26, 24, 21, 34, 19, 17, 16, 15, 14`
The spike at run 7 is `fleetcontroller` landing before its pattern entry did.

Activity:

- `21:40` — Run 12 complete. 14 findings across 9 repositories. `exit 0`. 100%
- `20:05` — Blind spot declared: accessible-name quality is unchecked, found by
  human comparison rather than by the detector. 62%
- `17:22` — False positive retired: word-boundary match on `.icon-button`
  corrected to `(?<![\w-])`. 100%

Creed, for wherever the theme wants it:
**The element is the substrate. The theme is the finish.**

## Proof

A page is not done until this exits 0:

```
node .github/skills/ui-craft/scripts/check-ui-craft.mjs themes/<id>
```

Targets, in priority order:

- **0 FAIL.** Non-negotiable.
- div/span **at or below 25%**. The shipped estate runs 22–40%; these pages are
  greenfield and have no excuse.
- **8 or more** rich semantic elements from the substrate table.
- **8 or more** `grid-template` declarations — density comes from a real
  layout, not from repeating one shape.
- **12 or more** custom properties, and `clamp()` for fluid type.

Thresholds are prompts to look, never findings. If a target is wrong for a
theme, say so in the theme's entry in `index.json` rather than quietly missing
it.
