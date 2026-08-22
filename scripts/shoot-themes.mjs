#!/usr/bin/env node
/**
 * shoot-themes.mjs — render one preview image per theme.
 *
 *   node scripts/shoot-themes.mjs            # render every theme
 *   node scripts/shoot-themes.mjs forge      # render themes matching a substring
 *   node scripts/shoot-themes.mjs --verify   # assert every theme has a page and an image
 *
 * Uses the Chrome already installed on the machine rather than downloading a
 * browser, so this stays cheap to run and cheap to check out.
 *
 * A theme without a preview image is not choosable by a human, so --verify
 * treats a missing image as a failure and is safe to wire into CI.
 */

import { chromium } from "playwright-core";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const THEMES = join(REPO, "themes");
const REGISTRY = join(THEMES, "index.json");

const VIEWPORT = { width: 1440, height: 1120 };
// 1x keeps a full-page shot of a long console around 1 MB. At 2x these ran to
// 4.6 MB each, which is not worth committing four of.
const SCALE = 1;

/** Chrome channels Playwright can find on its own, best first. */
const CHANNELS = ["chrome", "msedge", "chrome-beta"];

/** Explicit fallbacks for boxes where the channel lookup misses. */
const FALLBACKS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

async function launch() {
  for (const channel of CHANNELS) {
    try {
      return await chromium.launch({ channel, args: ["--force-color-profile=srgb"] });
    } catch { /* try the next one */ }
  }
  for (const executablePath of FALLBACKS) {
    if (!existsSync(executablePath)) continue;
    try {
      return await chromium.launch({ executablePath, args: ["--force-color-profile=srgb"] });
    } catch { /* try the next one */ }
  }
  throw new Error("no Chrome or Edge found. Install one, or set CHROME_PATH to an executable.");
}

/**
 * Put the page into a state worth photographing.
 *
 * Every control is a real form element by contract, so priming is generic and
 * never reaches for a theme-specific class name. A dial sitting at zero shows
 * an unlit track and tells a human nothing about the theme.
 */
async function prime(page) {
  await page.evaluate(() => {
    const fire = (el) => {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };

    // Only light a control that is sitting dark. A range that already carries a
    // meaningful default is showing the page's real data, and overwriting it
    // makes the screenshot contradict the page's own caption.
    for (const range of document.querySelectorAll('input[type="range"]')) {
      const min = Number(range.min || 0);
      const max = Number(range.max || 100);
      if (Number(range.value) !== min) continue;
      range.value = String(min + (max - min) * 0.68);
      fire(range);
    }

    // Light the hero switch so the accent state is visible, and leave the rest
    // alone so the off state is still represented somewhere on the page.
    const boxes = [...document.querySelectorAll('input[type="checkbox"]')];
    if (boxes.length && !boxes[0].checked) {
      boxes[0].checked = true;
      fire(boxes[0]);
    }

    for (const details of document.querySelectorAll("details")) details.open = true;
  });

  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(1200);
}

function loadRegistry() {
  const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
  return registry.themes.map((t) => ({
    id: t.id,
    name: t.name,
    page: join(THEMES, t.id, "page.html"),
    image: join(THEMES, t.id, "preview.png"),
  }));
}

function verify(themes) {
  const problems = [];
  for (const t of themes) {
    if (!existsSync(t.page)) problems.push(`${t.id}: missing themes/${t.id}/page.html`);
    else if (!existsSync(t.image)) problems.push(`${t.id}: missing themes/${t.id}/preview.png — run: node scripts/shoot-themes.mjs ${t.id}`);
  }
  if (problems.length) {
    console.error("theme previews incomplete:\n  " + problems.join("\n  "));
    console.error("\nEvery theme needs a page and an image. A theme nobody can see is a theme nobody can pick.");
    return 1;
  }
  console.log(`all ${themes.length} themes have a page and a preview image`);
  return 0;
}

async function main() {
  const args = process.argv.slice(2);
  const all = loadRegistry();

  if (args.includes("--verify")) process.exit(verify(all));

  const filters = args.filter((a) => !a.startsWith("--"));
  const themes = filters.length
    ? all.filter((t) => filters.some((f) => t.id.includes(f)))
    : all;

  if (!themes.length) {
    console.error(`no theme matched ${filters.join(", ")}`);
    process.exit(2);
  }

  const missing = themes.filter((t) => !existsSync(t.page));
  if (missing.length) {
    console.error("cannot shoot, page missing:\n  " + missing.map((t) => `themes/${t.id}/page.html`).join("\n  "));
    process.exit(2);
  }

  const browser = await launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });

  let failures = 0;
  for (const theme of themes) {
    const page = await context.newPage();
    try {
      await page.goto(pathToFileURL(theme.page).href, { waitUntil: "load", timeout: 30_000 });
      try {
        await page.waitForLoadState("networkidle", { timeout: 8_000 });
      } catch {
        // A webfont CDN can hang; the fallback stack still renders.
      }
      await prime(page);

      // Grow the viewport to the whole document rather than using fullPage.
      // fullPage stitches viewport-sized tiles, so a position:fixed texture,
      // vignette or noise overlay paints only over the first tile and leaves a
      // visible horizontal seam partway down the image.
      const measure = () => page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
      }));
      let size = await measure();
      await page.setViewportSize({
        width: VIEWPORT.width,
        height: Math.min(Math.max(size.h, VIEWPORT.height), 12_000),
      });
      await page.waitForTimeout(500);
      size = await measure();

      mkdirSync(dirname(theme.image), { recursive: true });
      await page.screenshot({ path: theme.image });
      console.log(`  ok    ${theme.id.padEnd(22)} ${size.w}x${size.h}  -> themes/${theme.id}/preview.png`);
    } catch (err) {
      failures += 1;
      console.error(`  FAIL  ${theme.id.padEnd(22)} ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err.stack || String(err));
  process.exit(2);
});
