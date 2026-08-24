#!/usr/bin/env node
// Verifies every pointer in themes/index.json `controls` actually resolves.
//
// A control index is only useful if "give me a dial" lands on a real element.
// This check exists because the registry previously answered that request with
// a component measuring 91% div/span that contained no form control at all.
//
// It asserts three things per instance:
//   1. the file exists
//   2. the #id exists in that file, when an id is given
//   3. the element found is the declared substrate -- a dial claiming
//      input[type=range] must actually BE one
//
// Exit 1 on any failure.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const reg = JSON.parse(readFileSync("themes/index.json", "utf8"));
const controls = reg.controls;
let failures = 0;
const fail = (m) => {
  console.log(`  FAIL  ${m}`);
  failures++;
};

if (!controls?.kinds?.length) {
  fail("no controls.kinds in registry");
  process.exit(1);
}

// substrate string -> predicate over the matched element's opening tag
const substrateTest = (substrate, tag, attrs) => {
  const m = /^([a-z]+)(?:\[type=([a-z]+)\])?/.exec(substrate);
  if (!m) return true;
  const [, wantTag, wantType] = m;
  if (tag !== wantTag) return `expected <${wantTag}>, found <${tag}>`;
  if (wantType) {
    const t = /type\s*=\s*["']?([a-z]+)/i.exec(attrs)?.[1]?.toLowerCase();
    if (t !== wantType) return `expected type="${wantType}", found type="${t ?? "(none)"}"`;
  }
  return true;
};

console.log("Control index\n");

for (const kind of controls.kinds) {
  const found = [];
  for (const inst of kind.instances) {
    const [rel, id] = inst.at.split("#");
    const path = join("themes", rel);

    if (!existsSync(path)) {
      fail(`${kind.kind}: ${rel} does not exist`);
      continue;
    }
    const html = readFileSync(path, "utf8");

    if (!id) {
      // No id: assert the substrate element appears somewhere in the file.
      const wantTag = /^([a-z]+)/.exec(kind.substrate)?.[1];
      const wantType = /\[type=([a-z]+)\]/.exec(kind.substrate)?.[1];
      const re = wantType
        ? new RegExp(`<${wantTag}\\b[^>]*type\\s*=\\s*["']?${wantType}\\b`, "i")
        : new RegExp(`<${wantTag}\\b`, "i");
      if (!re.test(html)) fail(`${kind.kind}: no <${wantTag}> in ${rel}`);
      else found.push(`${rel} (<${wantTag}>)`);
      continue;
    }

    // id given: find the element carrying it and check its tag and type.
    const idRe = new RegExp(`<([a-z]+)\\b([^>]*\\bid\\s*=\\s*["']${id}["'][^>]*)>`, "i");
    const hit = idRe.exec(html);
    if (!hit) {
      fail(`${kind.kind}: #${id} not found in ${rel}`);
      continue;
    }
    const [, tag, attrs] = [hit[0], hit[1].toLowerCase(), hit[2]];
    const verdict = substrateTest(kind.substrate, tag, attrs);
    if (verdict !== true) fail(`${kind.kind} #${id}: ${verdict}`);
    else found.push(`${rel}#${id}`);
  }
  const mark = found.length === kind.instances.length ? "ok  " : "    ";
  console.log(
    `  ${mark}${kind.kind.padEnd(20)} ${kind.substrate.padEnd(36)} ${found.length}/${kind.instances.length}`
  );
}

// Every anti-example must redirect somewhere that exists.
console.log("\nAnti-example redirects\n");
for (const t of reg.themes) {
  for (const c of t.components ?? []) {
    if (c.conformance !== "visual-reference") continue;
    if (!c.use_instead) {
      fail(`${c.file} is visual-reference with no use_instead`);
      continue;
    }
    const target = join("themes", c.use_instead.split("#")[0]);
    if (!existsSync(target)) fail(`${c.file} redirects to missing ${c.use_instead}`);
    else console.log(`  ok  ${c.file}\n        -> ${c.use_instead}`);
  }
}

console.log(failures === 0 ? "\nControl index resolves.\n" : `\n${failures} failure(s).\n`);
process.exit(failures === 0 ? 0 : 1);
