#!/usr/bin/env node
/**
 * Measure UI craft signals in a built artifact directory or a source tree.
 *
 * Reports what the ui-craft skill claims to care about, so a UI review is a
 * measurement rather than an opinion. Every threshold is grounded in the nine
 * shipped UniversalUI owner sites at ce75e79; see references/thresholds.md.
 *
 * Element extraction handles three emitters deliberately. An earlier pass of
 * this analysis matched only `jsx("tag"` and reported LearnOps as having zero
 * elements, because its build emits `createElement as h`. A detector that sees
 * one emitter reports a clean bill of health for code it never read, so the
 * patterns below are exhaustive over what the estate actually ships and
 * UNREAD_FILES is reported rather than swallowed.
 *
 * Usage:
 *   node check-ui-craft.mjs <dir>
 *   node check-ui-craft.mjs <dir> --json
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const RICH_ELEMENTS = [
  "table", "thead", "tbody", "tfoot", "caption", "colgroup",
  "details", "summary", "time", "meter", "progress",
  "figure", "figcaption", "output", "blockquote", "cite",
  "fieldset", "legend", "abbr", "dfn", "kbd", "samp", "code", "pre",
];

const GENERIC = new Set(["div", "span"]);

// Every element name HTML defines that we expect to see authored. Guards
// against a typo'd tag being counted as semantic richness.
const KNOWN = new Set([
  ...RICH_ELEMENTS,
  "a", "article", "aside", "b", "br", "button", "dd", "dl", "dt", "em",
  "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i",
  "img", "input", "label", "li", "main", "nav", "ol", "option", "p", "picture",
  "section", "select", "small", "strong", "sub", "sup", "svg", "textarea",
  "tr", "th", "td", "ul", "video", "audio", "canvas", "dialog", "hgroup",
  "mark", "menu", "noscript", "object", "s", "search", "template", "u", "wbr",
  ...GENERIC,
]);

/**
 * Element-creating calls are almost always imported under a local alias that
 * the author never chose and cannot predict: TypeScript's automatic JSX
 * transform emits `import { jsx as _jsx } from "react/jsx-runtime"`, and other
 * builds alias `createElement` to `h`. A hardcoded /\bjsxs?\(/ silently misses
 * `_jsx(` outright, because `_` is a word character and kills the boundary.
 *
 * So resolve the aliases from each file's own imports before matching. This is
 * the same reason the estate's scaffolder reads its React version from the host
 * manifest rather than a literal: a copy that nothing compares to its source
 * drifts, and here the "copy" was my guess at what the emitter is called.
 */
const FACTORY_NAMES = new Set(["jsx", "jsxs", "jsxDEV", "createElement"]);

/** Resolve the local names that create elements in this file. */
function resolveFactories(text) {
  const names = new Set();
  const importRe = /import\s*\{([^}]*)\}\s*from\s*["'][^"']*(?:react|jsx-runtime|preact|htm)[^"']*["']/g;
  let m;
  while ((m = importRe.exec(text)) !== null) {
    for (const clause of m[1].split(",")) {
      const [imported, local] = clause.split(/\s+as\s+/).map((s) => s.trim());
      if (FACTORY_NAMES.has(imported)) names.add(local || imported);
    }
  }
  // Namespace and un-aliased forms, always plausible.
  for (const n of ["React.createElement", "createElement", "jsx", "jsxs", "h"]) names.add(n);
  return names;
}

function elementRegexes(text, ext) {
  const out = [];
  for (const name of resolveFactories(text)) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // (?<![\w$.]) rather than \b, so an aliased _jsx( is reachable while a
    // member call like foo.jsx( is not.
    out.push(new RegExp(`(?<![\\w$.])${esc}\\(\\s*["']([a-z][a-z0-9]*)["']`, "g"));
  }
  // Only in real source. In compiled JS this pattern also matches the `<b `
  // of an expression like `a<b `, inventing elements that were never authored.
  if ([".jsx", ".tsx", ".html", ".htm"].includes(ext)) {
    out.push(/<([a-z][a-z0-9]*)[\s/>]/g);
  }
  return out;
}

/** A file that creates elements but yielded none was not read, only skimmed. */
const CREATES_ELEMENTS = /jsx-runtime|createElement|<[a-z][a-z0-9]*[\s/>]/;

// Accepts a directory or a single file, so one page can be graded on its own
// without inheriting the findings of its neighbours.
function walk(target) {
  let root;
  try { root = statSync(target); } catch { return []; }
  if (!root.isDirectory()) return [target];

  const out = [];
  for (const entry of readdirSync(target)) {
    const full = join(target, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function analyse(dir) {
  const files = walk(dir);
  const code = files.filter((f) =>
    [".js", ".jsx", ".ts", ".tsx", ".mjs", ".html"].includes(extname(f)) && !f.endsWith(".d.ts"));
  const css = files.filter((f) => extname(f) === ".css");

  const elements = [];
  const blindSpots = [];
  const unreadable = [];

  for (const f of code) {
    let text;
    try { text = readFileSync(f, "utf8"); } catch { unreadable.push(f); continue; }
    let found = 0;
    for (const re of elementRegexes(text, extname(f))) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        if (!KNOWN.has(m[1])) continue;
        elements.push(m[1]);
        found += 1;
      }
    }
    // The guard that matters. A file that plainly creates elements but yielded
    // none was not read, and its silence would otherwise be scored as if it
    // contained no generic markup at all.
    if (found === 0 && CREATES_ELEMENTS.test(text)) blindSpots.push(f);
  }

  let cssText = "";
  for (const f of css) {
    try { cssText += readFileSync(f, "utf8") + "\n"; } catch { unreadable.push(f); }
  }
  // Single-file components keep their CSS in a <style> block. Reading only .css
  // files would score them as having no styling at all, so the CSS metrics must
  // come from wherever the styles actually live.
  for (const f of code.filter((p) => [".html", ".htm"].includes(extname(p)))) {
    let text;
    try { text = readFileSync(f, "utf8"); } catch { continue; }
    for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) cssText += m[1] + "\n";
  }

  const count = (re) => (cssText.match(re) || []).length;
  const generic = elements.filter((e) => GENERIC.has(e)).length;
  const richUsed = [...new Set(elements.filter((e) => RICH_ELEMENTS.includes(e)))];

  /**
   * Operability outranks aesthetics. A skinned control that looks machined and
   * cannot be reached by Tab is a worse outcome than a plain one, and nothing
   * about the visual result reveals it — which is exactly why it needs a check
   * rather than a review.
   *
   * Both tests below started as false positives and were tightened against the
   * shipped estate:
   *   - \bbutton\b matched the class .financeops-site__decision-room__icon-button,
   *     because "-" is a word boundary. A class named for a control is not one.
   *   - A bare transition: is not a hazard. LearnOps has three colour fades and
   *     zero keyframes; only real animation or a transform transition moves
   *     enough to matter.
   */
  const CONTROL = String.raw`(?<![\w-])(?:input|select|textarea|button)(?![\w-])`;
  const hiddenControl = new RegExp(
    `[^{}]*${CONTROL}[^{}]*\\{[^}]*(?:display:\\s*none|visibility:\\s*hidden)`, "i").test(cssText);
  const hasMotion = /@keyframes|animation:\s*[\w-]+/i.test(cssText) || /transition:[^;]*transform/i.test(cssText);
  const respectsReducedMotion = /prefers-reduced-motion/i.test(cssText);

  /**
   * The subtler failure. A dial or slider built from div drag handlers reports
   * no hidden control because it never had one, so a hidden-control test alone
   * scores it clean. It is in fact strictly worse: unreachable by Tab, with no
   * value, no role and nothing for assistive tech to announce.
   */
  let jsText = "";
  for (const f of code) {
    try { jsText += readFileSync(f, "utf8") + "\n"; } catch { /* already recorded */ }
  }
  const dragDriven = /(?:pointerdown|mousedown|touchstart)['"]?\s*,/i.test(jsText);
  const nativeControls = elements.filter((e) => ["input", "select", "textarea", "button"].includes(e)).length;
  const customControl = dragDriven && nativeControls === 0;

  return {
    directory: dir,
    filesScanned: { code: code.length, css: css.length },
    unreadable,
    blindSpots,
    operability: { hiddenControl, hasMotion, respectsReducedMotion, customControl },
    elements: {
      total: elements.length,
      distinct: new Set(elements).size,
      generic,
      genericPercent: elements.length ? Math.round((100 * generic) / elements.length) : 0,
      richUsed,
      richCount: richUsed.length,
      vocabulary: [...new Set(elements)].sort(),
    },
    css: {
      customProperties: new Set(cssText.match(/--[a-z][a-z0-9-]*/gi) || []).size,
      gridTemplates: count(/grid-template/g),
      clamp: count(/clamp\(/g),
      layeredBackground: count(/linear-gradient\(/g) >= 2 && count(/radial-gradient\(/g) >= 1,
      constrainedMeasure: count(/max-width:\s*[\d.]+(?:ch|rem|em)/g),
    },
  };
}

/** Thresholds derive from the shipped estate; see references/thresholds.md. */
function grade(r) {
  const findings = [];
  const e = r.elements;
  const c = r.css;

  // Reported before any score, because an unread file makes every ratio below
  // a statement about a subset while looking like a statement about the whole.
  if (r.blindSpots.length) {
    findings.push(["FAIL", `${r.blindSpots.length} file(s) create elements but none were extracted — unrecognised emitter, not a clean result: ${r.blindSpots.slice(0, 3).join(", ")}`]);
    return findings;
  }
  if (e.total === 0) {
    findings.push(["FAIL", "no elements found — check the directory, or the emitter is unrecognised"]);
    return findings;
  }
  // Operability first. These break the control rather than merely dulling it.
  if (r.operability.hiddenControl) {
    findings.push(["FAIL", "a form control is display:none or visibility:hidden — it is skinned but unreachable by Tab and absent from the accessibility tree; use appearance:none, or clip the input rather than removing it"]);
  }
  if (r.operability.customControl) {
    findings.push(["FAIL", "drag interaction with no native form control — a dial or slider must be an <input type=range> underneath the skin, or it has no keyboard, no value and no role"]);
  }
  if (r.operability.hasMotion && !r.operability.respectsReducedMotion) {
    findings.push(["FAIL", "animation or transition with no prefers-reduced-motion branch — glitch, parallax and spring effects are a vestibular hazard"]);
  }
  if (e.genericPercent > 45) {
    findings.push(["FAIL", `${e.genericPercent}% of elements are div/span (estate range 22-40%)`]);
  }
  // WARN, never FAIL. The denominator is invisible to this script: a site whose
  // content genuinely has no tabular, ranged or temporal data is not defective
  // for omitting <table>, <meter> and <time>. Agent127 scores zero here and is
  // one of the two sites held up as exemplary. Absence is a prompt to check the
  // content shape, not a finding on its own.
  if (e.richCount === 0) {
    findings.push(["WARN", "zero rich semantic elements — confirm no view holds tabular, ranged, temporal or disclosable data"]);
  } else if (e.richCount < 3) {
    findings.push(["WARN", `only ${e.richCount} rich element type(s): ${e.richUsed.join(", ")}`]);
  }
  if (c.gridTemplates < 8) {
    findings.push(["WARN", `${c.gridTemplates} grid-template declarations — layout is likely one repeated shape`]);
  }
  if (c.customProperties < 7) {
    findings.push(["WARN", `${c.customProperties} custom properties — a named palette needs 7-11`]);
  }
  if (c.clamp === 0) {
    findings.push(["WARN", "no clamp() — type and spacing are fixed rather than fluid"]);
  }
  if (!c.layeredBackground) {
    findings.push(["INFO", "flat ground — a hairline grid plus one radial glow is the estate convention"]);
  }
  if (c.constrainedMeasure === 0) {
    findings.push(["WARN", "no max-width in ch/rem/em — unconstrained measure is the top cause of an unconsidered page"]);
  }
  if (r.unreadable.length) {
    findings.push(["INFO", `${r.unreadable.length} file(s) unreadable and excluded — this is a blind spot, not a pass`]);
  }
  if (!findings.some(([lvl]) => lvl === "FAIL" || lvl === "WARN")) {
    findings.push(["PASS", "element vocabulary and layout density are within estate norms"]);
  }
  return findings;
}

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) {
  console.error("usage: node check-ui-craft.mjs <dir> [--json]");
  process.exit(2);
}

let report;
try {
  report = analyse(dir);
} catch (err) {
  console.error(`cannot analyse ${dir}: ${err.message}`);
  process.exit(2);
}
const findings = grade(report);

if (args.includes("--json")) {
  console.log(JSON.stringify({ ...report, findings }, null, 2));
} else {
  const e = report.elements;
  const c = report.css;
  console.log(`ui-craft: ${report.directory}`);
  console.log(`  scanned        ${report.filesScanned.code} code, ${report.filesScanned.css} css`);
  console.log(`  elements       ${e.total} calls, ${e.distinct} distinct, ${e.genericPercent}% div/span`);
  console.log(`  rich elements  ${e.richCount}${e.richCount ? `  (${e.richUsed.join(", ")})` : ""}`);
  console.log(`  layout         ${c.gridTemplates} grid-template, ${c.clamp} clamp(), ${c.constrainedMeasure} constrained measure`);
  console.log(`  tokens         ${c.customProperties} custom properties, layered ground: ${c.layeredBackground ? "yes" : "no"}`);
  const op = report.operability;
  console.log(`  operability    controls: ${op.hiddenControl ? "HIDDEN" : op.customControl ? "NONE (drag-only)" : "ok"}, motion: ${op.hasMotion ? (op.respectsReducedMotion ? "guarded" : "UNGUARDED") : "none"}`);
  console.log("");
  for (const [level, message] of findings) console.log(`  ${level.padEnd(5)} ${message}`);
}

process.exit(findings.some(([lvl]) => lvl === "FAIL") ? 1 : 0);
