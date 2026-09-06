import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const schemaPath = fileURLToPath(new URL("../docs/ui-surfaces/surface-declaration.schema.json", import.meta.url));
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
const validateSchema = new Ajv2020({ allErrors: true }).compile(schema);

export function validateDeclaration(declaration) {
  if (validateSchema(declaration)) return [];
  return (validateSchema.errors ?? []).map((error) => `${error.instancePath || "declaration"} ${error.message}`);
}

export function validateInput(path) {
  let fixture;
  try {
    fixture = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return [`invalid JSON: ${error.message}`];
  }

  const isFixture = fixture && typeof fixture === "object" && fixture.fixture === true;
  if (isFixture && !["valid", "invalid"].includes(fixture.expected)) {
    return ["fixture expected must be valid or invalid"];
  }

  const declaration = isFixture ? fixture.declaration : fixture;
  const errors = validateDeclaration(declaration);
  if (isFixture && fixture.expected === "valid" && errors.length) return [`expected valid declaration: ${errors.join("; ")}`];
  if (isFixture && fixture.expected === "invalid" && !errors.length) return ["expected invalid declaration but validation passed"];
  if (!isFixture && errors.length) return errors;
  return [];
}

function jsonPaths(path) {
  try {
    if (statSync(path).isFile()) return [path];
    return readdirSync(path, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => join(path, entry.name));
  } catch (error) {
    return [{ path, error: `unreadable input: ${error.code ?? error.message}` }];
  }
}

function main() {
  const inputs = process.argv.slice(2);
  const fixtures = (inputs.length ? inputs.flatMap(jsonPaths) : jsonPaths(join("docs", "ui-surfaces", "references")))
    .sort((left, right) => (typeof left === "string" ? left : left.path).localeCompare(typeof right === "string" ? right : right.path));

  if (!fixtures.length) {
    console.error("No UI surface reference fixtures found.");
    process.exitCode = 1;
    return;
  }

  let failures = 0;
  for (const input of fixtures) {
    if (typeof input !== "string") {
      failures += 1;
      console.error(`FAIL ${input.path}: ${input.error}`);
      continue;
    }
    const path = input;
    const errors = validateInput(path);
    if (errors.length) {
      failures += 1;
      console.error(`FAIL ${basename(path)}: ${errors.join("; ")}`);
    } else {
      console.log(`ok   ${basename(path)}`);
    }
  }

  if (failures) {
    console.error(`\n${failures} UI surface declaration failure(s).`);
    process.exitCode = 1;
  } else {
    console.log(`\n${fixtures.length} UI surface declaration(s) verified.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
