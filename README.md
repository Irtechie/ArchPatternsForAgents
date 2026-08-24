# ArchPatternsForAgents

Machine-checkable patterns for coding agents, so that architecture and interface
decisions are **constrained and verified** rather than improvised per session.

The working premise, which everything here is built to test: an agent given only
a description of good work will produce plausible-looking output that fails on
the parts nobody measures. Given a contract plus a checker it must satisfy
itself, it produces work that holds up. So far that has been true every time it
has been tested.

## What's here now

### `themes/` — UI theme registry

Four aesthetic profiles, each with a full working page and a rendered image.
They are four **different kinds of surface**, not one console in four colours: a
data explorer, an irreversible-action gate, a control panel, and a single-metric
readout. Each declares a `genre` and, crucially, a `forbidden` element list — the
control panel may not render an estate table, the single-metric page may not
render a gauge.

**Start at [`themes/GALLERY.md`](themes/GALLERY.md)** to pick a look, then read
[`themes/index.json`](themes/index.json) for the machine-readable entry.

Need one control rather than a whole look? `index.json` has a `controls` index
keyed by kind — toggle, dial, fader, gated action — resolving to a conformant
element inside a working page.

### `.github/skills/ui-craft/` — the skill

The rules an agent follows when authoring a view, plus the checker that grades
the result. Portable: copy the directory into any repo.

The governing rule is **the element is the substrate, the theme is the finish**.
A machined toggle is still `<input type="checkbox">`; a dial is still
`<input type="range">`. Aesthetic direction and semantic substrate are
independent, and treating them as a trade is the most expensive mistake in this
area.

### `scripts/` — the checks

| Command | What it proves | Scope |
|---|---|---|
| `npm run check:pages` | element vocabulary, layout density, tokens, operability | one file |
| `npm run a11y` | every control has a real, computed accessible name | one page |
| `npm run controls` | every control-index pointer resolves to its declared substrate | registry |
| `npm run divergence` | each genre avoids its forbidden elements; shared vocabulary stays under a ceiling | registry |
| `npm run repetition` | no page renders a run of identical panels | registry |
| `npm run verify` | every theme has a page and a preview image | registry |
| `npm test` | all six |

The registry-wide checks exist because **a per-page check can never see a
monoculture.** All four themes once passed the per-page checks individually while
sharing 57% of their element vocabulary — sameness only exists across a set.

`npm install` pulls `playwright-core` only. The scripts drive whichever Chrome
or Edge is already installed and download no browser.

## Using this from another project

Point your agent here and tell it to use `ui-craft`:

1. Read [`themes/GALLERY.md`](themes/GALLERY.md), choose a theme by eye.
2. Read [`.github/skills/ui-craft/SKILL.md`](.github/skills/ui-craft/SKILL.md)
   for the element and layout rules.
3. Read [`themes/_shared/substrate-contract.md`](themes/_shared/substrate-contract.md)
   for what the markup must satisfy.
4. Copy the **finish** from the chosen theme's `page.html`; author your own
   markup from Rule 1.
5. Run the checks against your artifact. Do not self-report.

## Why the checks exist rather than review

Four themed components were generated from a detailed, high-quality creative
brief and measured afterwards. All four came back at **83–95% `div`/`span`**,
against a shipped-estate range of 22–46%. One hid its checkbox with
`display: none`, making a beautiful control unreachable by Tab. One built a dial
from drag handlers with no form control at all — no keyboard, no value, no role.

**Nothing about the visual result revealed any of it.** They looked excellent.
That is precisely why this is checked rather than reviewed.

Rebuilt against a contract, with the same briefs, the same four themes measured
0–7%. See [`themes/README.md`](themes/README.md) for the full before and after.

Then the checks caught a failure one level up. All four rebuilt pages passed
every per-page check — and shared **57%** of their element vocabulary, with three
of the four having no element unique to them. A threshold I wrote ("8 or more
rich elements") is a *breadth* metric, so the cheapest way to satisfy it is one
of everything. Escaping card soup into checklist soup is not an escape. The fix
was a fourth layer, **genre**, with an explicit `forbidden` list per theme;
common vocabulary is now 18%.

And the checks are not sufficient either. Real defects in these pages were found
only by rendering them and looking: a preview that displayed a value
contradicting its own caption, and a page at 0% `div`/`span` with 19 distinct
elements that still rendered as three interchangeable glass boxes. **Render it
and look at it.**
