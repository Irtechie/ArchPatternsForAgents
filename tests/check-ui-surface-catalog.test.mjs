import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";

import { validateDeclaration } from "../scripts/check-ui-surface-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(join(root, "docs/ui-surfaces/surface-declaration.schema.json"), "utf8"));
const validateSchema = new Ajv2020({ allErrors: true }).compile(schema);

const base = {
  id: "operator-topology",
  surface_kind: "operate",
  primary_user_verb: "diagnose",
  primary_structure: "topology",
  primary_structure_basis: "spatial-relationships",
  primary_structure_rationale: "Connected equipment occupies and affects physical space.",
  rendering: {
    lane: "gpu-scene",
    rationale: "The operator inspects connected equipment in physical space.",
    fallback: "semantic-dom inspector with a 2D topology diagram"
  },
  supporting_elements: ["inspector", "event-stream"],
  semantic_requirements: ["keyboard-operable-controls", "text-equivalent-for-visual-state"],
  proof_obligations: ["rendered-state-check", "keyboard-path-check"]
};

test("accepts a complete declared surface", () => {
  assert.deepEqual(validateDeclaration(base), []);
});

test("rejects a missing primary user verb", () => {
  const declaration = { ...base };
  delete declaration.primary_user_verb;

  assert.match(validateDeclaration(declaration).join("\n"), /primary_user_verb/);
});

test("rejects a primary card grid without heterogeneous-item rationale", () => {
  const declaration = {
    ...base,
    primary_structure: "card-grid",
    primary_structure_basis: "shared-columns"
  };

  assert.match(validateDeclaration(declaration).join("\n"), /primary_structure_basis/);
});

test("rejects a primary table without shared-column rationale", () => {
  const declaration = {
    ...base,
    primary_structure: "table",
    primary_structure_basis: "heterogeneous-items"
  };

  assert.match(validateDeclaration(declaration).join("\n"), /primary_structure_basis/);
});

test("rejects an unrecognized card or table alias", () => {
  const declaration = {
    ...base,
    primary_structure: "card-grid-layout",
    primary_structure_basis: "shared-columns"
  };

  assert.match(validateDeclaration(declaration).join("\n"), /primary_structure/);
});

test("rejects a primary structure with no rationale", () => {
  const declaration = { ...base };
  delete declaration.primary_structure_rationale;

  assert.match(validateDeclaration(declaration).join("\n"), /primary_structure_rationale/);
});

test("rejects an unknown rendering lane", () => {
  const declaration = { ...base, rendering: { ...base.rendering, lane: "glitter-cannon" } };

  assert.match(validateDeclaration(declaration).join("\n"), /rendering.lane/);
});

test("matches JSON Schema acceptance for every reference fixture", () => {
  const references = join(root, "docs/ui-surfaces/references");

  for (const name of readdirSync(references).filter((entry) => entry.endsWith(".json"))) {
    const fixture = JSON.parse(readFileSync(join(references, name), "utf8"));
    assert.equal(fixture.fixture, true, `${name} must declare its fixture envelope`);
    const accepted = validateDeclaration(fixture.declaration).length === 0;
    assert.equal(accepted, fixture.expected === "valid", `${name} must match its expected result`);
    assert.equal(accepted, Boolean(validateSchema(fixture.declaration)), name);
  }
});

test("validates a consumer-owned declaration passed on the command line", () => {
  const declaration = join(root, "docs/ui-surfaces/consumer-declaration.example.json");
  const output = execFileSync(process.execPath, ["scripts/check-ui-surface-catalog.mjs", declaration], {
    cwd: root,
    encoding: "utf8"
  });

  assert.match(output, /1 UI surface declaration\(s\) verified/);
});

test("does not treat consumer expected metadata as a fixture envelope", () => {
  const declaration = { ...base, expected: "ordinary-consumer-metadata" };

  assert.deepEqual(validateDeclaration(declaration), []);
});

test("reports a missing command-line input as a validation failure", () => {
  const missing = join(root, "docs/ui-surfaces/does-not-exist.json");
  const result = spawnSync(process.execPath, ["scripts/check-ui-surface-catalog.mjs", missing], {
    cwd: root,
    encoding: "utf8"
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unreadable input/);
});
