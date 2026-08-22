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

**Start at [`themes/GALLERY.md`](themes/GALLERY.md)** to pick a look, then read
[`themes/index.json`](themes/index.json) for the machine-readable entry.

### `.github/skills/ui-craft/` — the skill

The rules an agent follows when authoring a view, plus the checker that grades
the result. Portable: copy the directory into any repo.

The governing rule is **the element is the substrate, the theme is the finish**.
A machined toggle is still `<input type="checkbox">`; a dial is still
`<input type="range">`. Aesthetic direction and semantic substrate are
independent, and treating them as a trade is the most expensive mistake in this
area.

### `scripts/` — the checks

| Command | What it proves |
|---|---|
| `npm run check:pages` | element vocabulary, layout density, tokens, control operability |
| `npm run a11y` | every control has a real, computed accessible name |
| `npm run verify` | every theme has a page and a preview image |
| `npm test` | all three |

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
0–3%. See [`themes/README.md`](themes/README.md) for the full before and after.

And the checks are not sufficient either. Three real defects in these pages were
found only by rendering them and looking — including a preview that displayed a
value contradicting its own caption. **Render it and look at it.**
