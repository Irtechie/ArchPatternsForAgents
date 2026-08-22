#!/usr/bin/env node
/**
 * audit-a11y-names.mjs — does every control announce its purpose?
 *
 *   node scripts/audit-a11y-names.mjs                    # every theme page
 *   node scripts/audit-a11y-names.mjs themes/x/page.html # one file
 *
 * Why this exists, separately from check-ui-craft.mjs:
 *
 * The regex checker can see that a control is a real <input> and that it is not
 * display:none. It cannot see what the control is CALLED. A label-wrapped
 * toggle takes its accessible name from the label's text content, so a switch
 * with the word "SAFE" painted on the handle gets announced as "SAFE" rather
 * than "Engage override" — structurally perfect, semantically wrong. That
 * defect shipped past the checker once and was caught only by a human reading
 * two implementations side by side.
 *
 * A browser already implements the accessible name computation. This asks it,
 * rather than approximating the spec with more regex.
 */

import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const THEMES = join(REPO, "themes");

/** Roles that must always carry a meaningful name. */
const MUST_BE_NAMED = new Set([
  "checkbox", "slider", "textbox", "combobox", "radio", "button",
  "spinbutton", "searchbox", "switch", "link",
]);

/**
 * Names that are technically present but say nothing about purpose. These are
 * the near-misses that a presence-only check would wave through.
 */
const USELESS = [
  /^(on|off|safe|active|armed|yes|no|ok|go|set|run|n\/a|--?|\d+(\.\d+)?)$/i,
  /^(gb|mb|kb|%|percent|deg|degrees|px|ms|s)$/i,
  /^(click|click here|here|more|submit|button|input|toggle|switch|value)$/i,
];

const CHANNELS = ["chrome", "msedge"];
const FALLBACKS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);

async function launch() {
  for (const channel of CHANNELS) {
    try { return await chromium.launch({ channel }); } catch { /* next */ }
  }
  for (const executablePath of FALLBACKS) {
    if (!existsSync(executablePath)) continue;
    try { return await chromium.launch({ executablePath }); } catch { /* next */ }
  }
  throw new Error("no Chrome or Edge found. Install one, or set CHROME_PATH.");
}

/**
 * Read the aria snapshot and pull out every control and its computed name.
 * Lines look like:  `- checkbox "Engage override" [checked]`
 */
function parseControls(snapshot) {
  const controls = [];
  for (const raw of snapshot.split("\n")) {
    const line = raw.trim().replace(/^-\s*/, "");
    const m = line.match(/^([a-z]+)(?:\s+"([^"]*)")?/);
    if (!m) continue;
    const [, role, name] = m;
    if (!MUST_BE_NAMED.has(role)) continue;
    controls.push({ role, name: (name || "").trim() });
  }
  return controls;
}

function judge(control) {
  if (!control.name) return "unnamed";
  if (USELESS.some((re) => re.test(control.name))) return "uninformative";
  if (control.name.length < 3) return "uninformative";
  return null;
}

function targets() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (args.length) return args.map((a) => resolve(REPO, a));
  const registry = JSON.parse(readFileSync(join(THEMES, "index.json"), "utf8"));
  return registry.themes
    .map((t) => join(THEMES, t.id, "page.html"))
    .filter((p) => existsSync(p));
}

const files = targets();
if (!files.length) {
  console.error("nothing to audit");
  process.exit(2);
}

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1120 } });

let problems = 0;
let checked = 0;

for (const file of files) {
  const page = await context.newPage();
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.waitForTimeout(300);

  let snapshot;
  try {
    snapshot = await page.locator("body").ariaSnapshot();
  } catch (err) {
    console.error(`cannot snapshot ${file}: ${err.message}`);
    problems += 1;
    await page.close();
    continue;
  }

  const controls = parseControls(snapshot);
  const bad = controls.map((c) => [c, judge(c)]).filter(([, verdict]) => verdict);
  checked += controls.length;

  const label = relative(REPO, file).replace(/\\/g, "/");
  if (!bad.length) {
    console.log(`  ok    ${label}  (${controls.length} controls, all named)`);
  } else {
    problems += bad.length;
    console.log(`  FAIL  ${label}  (${controls.length} controls, ${bad.length} problem)`);
    for (const [c, verdict] of bad) {
      const shown = c.name ? `"${c.name}"` : "(no accessible name)";
      console.log(`          ${verdict.padEnd(14)} ${c.role.padEnd(10)} ${shown}`);
    }
  }
  await page.close();
}

await context.close();
await browser.close();

console.log("");
if (problems) {
  console.log(
    `${problems} control(s) do not announce their purpose.\n` +
    "A control named after the word painted on it, or after its unit, is not named.\n" +
    "Give it a real <label>, and mark the decorative layer aria-hidden=\"true\"."
  );
  process.exit(1);
}
console.log(`${checked} controls across ${files.length} page(s); every one announces its purpose.`);
process.exit(0);
