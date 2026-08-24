# Substrate contract for theme pages

Every theme in this registry ships a full page at `themes/<id>/page.html`. This
file is what those pages agree on, and what they are free to disagree on.

## Four layers

| Layer | Fixed across themes? | Owned by |
|---|---|---|
| **Substrate** — the semantic element behind a control | **Yes, always** | this contract |
| **Genre** — what kind of surface this is, and therefore which data it shows at all | No | the theme |
| **Composition** — which controls exist, how many, their hierarchy | No | the theme |
| **Finish** — colour, texture, type, motion, ornament | No | the theme |

A rotary dial and a horizontal fader are the same substrate,
`<input type="range">`, with different finishes. A channel bank of twelve
faders and a single hero dial are the same substrate with different
*compositions*. Only the first of the four is negotiable, and it is
negotiable in exactly one direction: never.

Nocturnal Forge should not have Deep Lab Tech's control set. That is the point
of a theme. What it may not do is stop using real controls to get there.

**Genre was added after the fact, and the reason is worth keeping.** An earlier
version of this contract fixed a single shared data payload so that four
previews would be comparable. It worked, and it was a mistake: in Rule 1 the
data shape *picks the element*, so freezing the data froze the elements.
Measured result — **57% of the rich-element vocabulary identical across all four
themes, and three of the four had no element unique to them.** Every page
carried `table caption thead tbody dl dt dd time meter figure figcaption output
fieldset legend code ol`, including the theme whose stated job is one number read
at a glance. Four monitoring consoles in four paint jobs is not four themes.

So genre now decides the payload, and each theme declares in `index.json`:

- `genre` and `premise` — what kind of surface this is, and for whom
- `leads_with` — the elements this genre is built around
- `forbidden` — **the elements it must refuse**

`forbidden` is the load-bearing field. Without it themes drift back toward
one-of-everything, because breadth is easy and fit is hard.

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

**This is a menu, not a checklist.** It answers *"I have this data — what element
is it?"* It does **not** say "use eight of these." Reading it as a checklist is
what produced the convergence described above: pages that reached for one of
everything to clear a count, including a fieldset around a single control and a
gauge on a page with nothing to gauge. If the shape is not in your genre's data,
its element does not belong on your page.

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

## The shared domain, and the payload that is not shared

Every page is a surface onto the same subject — architecture conformance across
Irtechie's estate — so the registry reads as one product rather than four
unrelated demos. **The domain is shared. The payload is not.**

Below is the full pool of facts. **Take only the slice your genre needs**, and
present it in the shape your genre implies. Invent nothing; omit freely. A
single-metric surface taking one number and ignoring everything else here is
using this section correctly. A page that renders the whole pool is not.

**Context:** Architecture Conformance · Irtechie/ArchPatternsForAgents ·
commit `ce75e79` · run 12 · `2026-08-21T21:40`

**Headline numbers** — for a surface that leads with a figure:

- Declared conformance **7** of 9 repositories
- Detector coverage **82%** of tree
- Undeclared drift **14** findings, against a budget of 40
- Generic markup **15%** div/span

**The estate** — five repositories, same columns, for a surface that compares:

| Repository | Pattern | div/span | Elements | Checked | State |
|---|---|---|---|---|---|
| `financeops` | plugin-host | 22% | 45 | 2026-08-21 | pass |
| `agent127` | llm-assisted | 24% | 31 | 2026-08-21 | pass |
| `healthops` | plugin-host | 29% | 18 | 2026-08-20 | thin |
| `learnops` | plugin-host | 33% | 16 | 2026-08-20 | thin |
| `fleetcontroller` | undeclared | 46% | 12 | 2026-08-21 | **fail** |

**Machine state** — for a surface that controls something:

- Drift budget ceiling, `0–40`, currently `14`
- Detector channels: structure `82`, naming `64`, boundaries `41`, motion `9` (0–100)
- Enforcement `armed` · Auto-retire false positives `on` · Block on fail `off`

**Series** — drift per run, twelve runs, 2026-06-14 → 2026-08-21:
`38, 33, 30, 26, 24, 21, 34, 19, 17, 16, 15, 14`.
The spike at run 7 is `fleetcontroller` landing before its pattern entry did.

**The pending act** — for a surface that asks you to commit:
Retire detector `naming/icon-button-boundary`, which has produced 31 false
positives across 9 repositories. Irreversible; re-deriving it costs a full
estate rescan. Affects `financeops`, `healthops`, `learnops`.

**Events** — for a surface that reports what happened:

- `21:40` — Run 12 complete. 14 findings across 9 repositories. `exit 0`.
- `20:05` — Blind spot declared: accessible-name quality unchecked, found by
  human comparison rather than by the detector.
- `17:22` — False positive retired: word-boundary match on `.icon-button`
  corrected to `(?<![\w-])`.

**Creed**, for wherever the theme wants it:
**The element is the substrate. The theme is the finish.**

## Proof

A page is not done until all three of these exit 0:

```
node .github/skills/ui-craft/scripts/check-ui-craft.mjs themes/<id>/page.html
node scripts/audit-a11y-names.mjs themes/<id>/page.html
node scripts/audit-theme-divergence.mjs
```

The third is a **registry-wide** check and cannot be satisfied by one page in
isolation — that is the point. Each of the four convergent pages passed the first
two individually.

Targets, in priority order:

- **0 FAIL**, every control accessibly named, no forbidden element. Non-negotiable.
- div/span **at or below 25%**. The shipped estate runs 22–40%; these pages are
  greenfield and have no excuse.
- Every element in your genre's `leads_with` is present and load-bearing.
- **6 or more** rich semantic elements — a **floor, not a score.** Never add an
  element to raise this number. A page that clears it with six well-chosen
  elements beats one that reaches twenty by including a gauge it does not need.
- **8 or more** `grid-template` declarations — density comes from a real
  layout, not from repeating one shape.
- **12 or more** custom properties, and `clamp()` for fluid type.

Thresholds are prompts to look, never findings. If a target is wrong for a
theme, say so in the theme's entry in `index.json` rather than quietly missing
it. The rich-element floor was **8** until it was measured driving four themes to
57% identical vocabulary; that is what a threshold becoming a target looks like.
