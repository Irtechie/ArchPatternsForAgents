/**
 * audit-theme-divergence.mjs
 *
 * Themes must differ in KIND, not just in colour.
 *
 * This exists because four themes were measured sharing 57% of their rich-element
 * vocabulary, with three of the four having zero elements unique to them. The cause
 * was a contract that mandated one shared data payload, plus a checker that rewarded
 * breadth of rich elements. Both pushed every theme toward one-of-everything.
 *
 * Neither check-ui-craft.mjs nor audit-a11y-names.mjs can see this: each grades a
 * single page in isolation, and every one of those four pages passed. Convergence is
 * only visible ACROSS the registry.
 *
 * Two gates:
 *   1. Per theme  - the elements a genre must refuse are absent.
 *   2. Registry   - the vocabulary shared by every theme stays below a ceiling.
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const RICH =
  "table caption thead tbody tfoot colgroup dl dt dd details summary time meter progress figure figcaption output blockquote cite fieldset legend code kbd samp pre abbr dfn ol".split(" ");

/*
 * NOTE ON THE COUNT THIS PRINTS.
 * These are "vocabulary tags", deliberately NOT the same number check-ui-craft.mjs
 * prints as "rich elements". This list carries dl/dt/dd/ol individually because
 * the question here is how much vocabulary two themes share; the per-page checker
 * has its own list because its question is whether one page reaches for real
 * elements at all. They disagree by 0-4 per page and both are correct.
 * Two checks printing the same label with different values is how a wrong number
 * ends up in documentation, so the labels differ.
 */

/**
 * Share of the rich vocabulary allowed to be common to EVERY theme.
 * A default chosen to sit below the 57% that triggered this script, not a validated
 * constant. Treat a breach as a prompt to look, never as a finding on its own.
 */
const MAX_COMMON = 0.35;

const CHANNELS = ["chrome", "msedge", "chrome-beta"];
async function launch() {
  for (const channel of CHANNELS) {
    try {
      return await chromium.launch({ channel });
    } catch {}
  }
  throw new Error("No Chrome or Edge found. Install one, or set a channel in CHANNELS.");
}

const reg = JSON.parse(readFileSync("themes/index.json", "utf8"));
const themes = reg.themes.filter((t) => t.page && existsSync(join("themes", t.page)));
if (themes.length < 2) {
  console.error("Need at least two themes with pages to compare.");
  process.exit(1);
}

const browser = await launch();
const page = await browser.newPage();
const present = {};
const failures = [];

for (const t of themes) {
  await page.goto(pathToFileURL(join("themes", t.page)).href, { waitUntil: "load" });
  present[t.id] = new Set(
    await page.evaluate((tags) => tags.filter((tag) => document.querySelector(tag)), RICH)
  );

  const banned = (t.forbidden ?? []).filter((tag) => present[t.id].has(tag));
  if (banned.length) {
    failures.push(`${t.id}: renders ${banned.join(", ")} — forbidden for genre "${t.genre}"`);
    console.log(`  FAIL  ${t.id.padEnd(22)} renders forbidden: ${banned.join(" ")}`);
  } else {
    console.log(`  ok    ${t.id.padEnd(22)} ${String(present[t.id].size).padStart(2)} vocabulary tags, genre "${t.genre}"`);
  }
}
await browser.close();

const ids = themes.map((t) => t.id);
const union = RICH.filter((tag) => ids.some((id) => present[id].has(tag)));
const common = RICH.filter((tag) => ids.every((id) => present[id].has(tag)));
const ratio = union.length ? common.length / union.length : 0;

console.log(`\n  vocabulary  ${union.length} across the registry, ${common.length} in every theme = ${Math.round(ratio * 100)}% common`);
console.log(`  shared      ${common.join(" ") || "— none —"}`);

for (const id of ids) {
  const only = [...present[id]].filter((tag) => ids.filter((o) => present[o].has(tag)).length === 1);
  console.log(`  unique      ${id.padEnd(22)} ${only.join(" ") || "— none —"}`);
}

if (ratio > MAX_COMMON) {
  failures.push(
    `registry: ${Math.round(ratio * 100)}% of the vocabulary is common to every theme (ceiling ${Math.round(MAX_COMMON * 100)}%)`
  );
  console.log(`\n  FAIL  themes share too much vocabulary — they differ in finish but not in kind`);
}

if (failures.length) {
  console.error(`\n${failures.length} divergence failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\n${themes.length} themes differ in kind, not just in colour.`);
