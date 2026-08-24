/**
 * audit-visual-repetition.mjs
 *
 * Card soup is a VISUAL failure, and every markup check in this repo is blind to it.
 *
 * `check-ui-craft.mjs` grades element vocabulary and div ratio. A page can score 0%
 * div/span with 19 distinct elements — genuinely excellent markup — and still render
 * as a stack of interchangeable rounded rectangles. That is exactly what happened:
 * the single-metric theme passed both existing checks while presenting three
 * co-equal figures as three identical 340x220 glass boxes.
 *
 * Rule 1 already names the offence: "A card is legitimate for exactly one thing: a
 * heterogeneous item whose fields differ from its neighbours'. If neighbouring cards
 * have the same fields, that is a table wearing a costume." This script measures it
 * instead of trusting a reviewer to notice.
 *
 * What it does NOT penalise: panels as such. Measured across the registry, the
 * control-panel theme carried NINE panels and read as designed, because all nine were
 * different sizes. The data explorer carried ZERO, using corner brackets rather than
 * filled boxes. Repetition is the defect, not enclosure.
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

/**
 * Largest permitted cluster of visually identical panels.
 * Two side-by-side reads as a deliberate comparison; three begins to read as a grid
 * of interchangeable units. Observed at the time of writing: 0, 1, 1 and 3 across the
 * four themes, the 3 being the page this script was written to catch.
 * An unvalidated default. A breach is a prompt to look, never a finding on its own.
 */
const MAX_CLUSTER = 2;

/** Ignore anything too small to read as a card. */
const MIN_W = 120;
const MIN_H = 60;

const CHANNELS = ["chrome", "msedge", "chrome-beta"];
async function launch() {
  for (const channel of CHANNELS) {
    try {
      return await chromium.launch({ channel });
    } catch {}
  }
  throw new Error("No Chrome or Edge found.");
}

const arg = process.argv[2];
const reg = JSON.parse(readFileSync("themes/index.json", "utf8"));
let targets = reg.themes
  .filter((t) => t.page && existsSync(join("themes", t.page)))
  .map((t) => ({ id: t.id, file: join("themes", t.page) }));
if (arg) {
  const hit = targets.filter((t) => t.id.includes(arg) || t.file.includes(arg));
  targets = hit.length ? hit : [{ id: arg, file: arg }];
}

const browser = await launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
const failures = [];

for (const t of targets) {
  await page.goto(pathToFileURL(t.file).href, { waitUntil: "load" });
  const r = await page.evaluate(
    ({ MIN_W, MIN_H }) => {
      const sigs = [];
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width < MIN_W || rect.height < MIN_H) continue;
        const filled = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
        const bordered = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
        const edged = cs.boxShadow !== "none" || cs.backdropFilter !== "none";
        // A "panel" is any visually bounded box. Rounded corners are NOT required:
        // the first version of this check demanded border-radius >= 4 and therefore
        // missed three identical sharp-cornered cards on the confirm-and-execute page.
        if (filled || bordered || edged) {
          // Round dimensions to 20px so near-identical boxes collapse into one cluster.
          sigs.push(
            [
              Math.round(parseFloat(cs.borderTopLeftRadius) || 0),
              cs.backgroundColor,
              cs.boxShadow.slice(0, 40),
              cs.borderTopWidth + cs.borderTopColor,
              Math.round(rect.width / 20) * 20,
              Math.round(rect.height / 20) * 20,
            ].join("|")
          );
        }
      }
      const counts = {};
      for (const s of sigs) counts[s] = (counts[s] ?? 0) + 1;
      const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const [sig, n] = ranked[0] ?? ["", 0];
      const [, , , , w, h] = sig.split("|");
      return { total: sigs.length, cluster: n, dims: w && h ? `${w}x${h}` : "—" };
    },
    { MIN_W, MIN_H }
  );

  if (r.cluster > MAX_CLUSTER) {
    failures.push(`${t.id}: ${r.cluster} visually identical ${r.dims} panels`);
    console.log(`  FAIL  ${t.id.padEnd(22)} ${String(r.total).padStart(2)} panels, ${r.cluster} identical at ${r.dims}`);
  } else {
    console.log(`  ok    ${t.id.padEnd(22)} ${String(r.total).padStart(2)} panels, largest identical cluster ${r.cluster}`);
  }
}
await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} repetition failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    `\nRepeated identical panels are a table wearing a costume. Give the items real\n` +
      `hierarchy, or use the element the data shape actually calls for.`
  );
  process.exit(1);
}
console.log(`\n${targets.length} page(s): no run of more than ${MAX_CLUSTER} identical panels.`);
