# Theme gallery

Four finishes on the same console, showing the same data. Pick by eye, then
read that theme's `page.html`.

Every page here passes both checks with zero failures, so whichever you choose
you are copying a real substrate rather than a picture of one.

| | Theme | Character | Pick it for |
|---|---|---|---|
| [▦](#deep-lab-tech) | **Deep Lab Tech** | densest | matrices, live signals, anything scanned rather than read |
| [▣](#gritty-cyberpunk) | **Gritty Cyberpunk** | highest stakes | destructive actions, arm/disarm, consequence |
| [◍](#the-nocturnal-forge) | **The Nocturnal Forge** | most tactile | machine control, one dominant value, dark rooms |
| [◌](#pristine-hyper-minimalism) | **Pristine Hyper-Minimalism** | quietest | one number read at a glance |

---

## Deep Lab Tech

A rack-mounted instrument. Phosphor amber on charcoal, corner brackets instead
of boxes, millimetre-paper ground, inline SVG trace with a real bloom filter.

**Composition** — the densest page in the registry: a full estate table, nine
`<meter>` gauges, a four-fader detector channel bank, radio profile selection,
and expandable notes.

[`themes/deep-lab-tech/page.html`](deep-lab-tech/page.html)

![Deep Lab Tech](deep-lab-tech/preview.png)

---

## Gritty Cyberpunk

A security terminal where actions feel dangerous. Abyssal black, CRT scanlines,
toxic green that only ignites on activation, chromatic-aberration glitch on
commit.

**Composition** — one large arm/disarm override switch that gates the page
accent, a command entry line, a register-dump table, and a log feed. Fewer
controls than the lab rack, each one consequential.

[`themes/gritty-cyberpunk/page.html`](gritty-cyberpunk/page.html)

![Gritty Cyberpunk](gritty-cyberpunk/preview.png)

---

## The Nocturnal Forge

A late-night workshop. Warm tungsten on charcoal, powder-coated metal texture
from `feTurbulence`, heavy inset and outset shadow arrays, a `conic-gradient`
track that burns orange as it fills.

**Composition** — one hero rotary dial carrying the primary value, three heavy
latch switches, and a small number of large supporting readouts. The dial is an
`<input type="range">` under the skin, so arrow keys move it.

[`themes/nocturnal-forge/page.html`](nocturnal-forge/page.html)

![The Nocturnal Forge](nocturnal-forge/preview.png)

---

## Pristine Hyper-Minimalism

A private orbital deck. A saturated four-colour `oklch` mesh behind glass panes
that actually refract it, extreme type scale, spring-eased tilt.

**Composition** — the restraint theme: one enormous hero metric, three quiet
secondary figures, exactly two controls, an airy table with no gridlines.

[`themes/pristine-minimalism/page.html`](pristine-minimalism/page.html)

![Pristine Hyper-Minimalism](pristine-minimalism/preview.png)

---

## What the pages are actually demonstrating

Each page shows the identical payload from
[`_shared/substrate-contract.md`](_shared/substrate-contract.md), so what
differs between these four images is style, not content.

Three layers, and only one of them is fixed:

| Layer | Fixed across themes? | Example |
|---|---|---|
| **Substrate** — the semantic element | **always** | dial and fader are both `<input type="range">` |
| **Composition** — which controls, how many, hierarchy | no | Forge has one dial; Lab Tech has a twelve-cell rack |
| **Finish** — colour, texture, type, motion | no | tungsten vs phosphor |

Measured, not asserted:

| Theme | div/span | Distinct elements | Rich elements | grid-template | Custom props |
|---|---|---|---|---|---|
| Deep Lab Tech | **0%** | 49 | 24 | 28 | 23 |
| Gritty Cyberpunk | **3%** | 45 | 18 | 23 | 20 |
| The Nocturnal Forge | **0%** | 41 | 17 | 23 | 21 |
| Pristine Hyper-Minimalism | **2%** | 35 | 14 | 22 | 24 |
| *the same four themes, as single components, before the contract* | *83–95%* | *3–5* | *0* | *0–1* | *6–8* |
| *shipped owner sites, for reference* | *22–46%* | *12–45* | *0–11* | *3–41* | *11–24* |

The last two rows are the finding. The same aesthetic briefs, given to the same
kind of agent, produced 83–95% `div`/`span` when the brief was only about the
look. Fixing the substrate first and handing over an identical brief produced
0–3%, with no loss of aesthetic. Nothing in these four pages was made uglier by
being semantic.

## Regenerating

```bash
node scripts/shoot-themes.mjs            # all themes
node scripts/shoot-themes.mjs forge      # one theme
node scripts/shoot-themes.mjs --verify   # assert every theme has a page and an image
```

Uses whatever Chrome or Edge is already installed; it downloads no browser.

## Adding a theme

1. Create `themes/<id>/page.html` following
   [`_shared/substrate-contract.md`](_shared/substrate-contract.md).
2. Prove it:
   ```bash
   node .github/skills/ui-craft/scripts/check-ui-craft.mjs themes/<id>/page.html
   node scripts/audit-a11y-names.mjs themes/<id>/page.html
   ```
   Both must exit 0.
3. Add the theme to `index.json`, then `node scripts/shoot-themes.mjs <id>`.
4. Add a section here.

A theme with no image is not choosable, so `--verify` treats a missing preview
as a failure.
