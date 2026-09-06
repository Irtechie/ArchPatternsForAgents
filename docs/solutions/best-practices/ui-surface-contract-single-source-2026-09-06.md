---
title: Keep UI surface declarations single-sourced
date: 2026-09-06
category: best-practices
module: ui-surface-catalog
problem_type: best_practice
component: tooling
severity: medium
applies_when:
  - A repository publishes both a JSON Schema and a consumer-facing validator.
tags: [json-schema, validation, ui-surface, consumer-adoption]
---

# Keep UI surface declarations single-sourced

## Context

A UI-surface catalog needed both a published JSON Schema and a command-line
validator that consuming applications could run. Maintaining the same field
rules, enumerations, and card/table constraints twice made a future drift
possible.

## Guidance

Compile the published schema in the consumer-facing checker. Keep catalog test
fixtures in an explicit `fixture: true` envelope, and test every fixture
against the same checker and schema. Treat consumer declarations as plain
objects, even when they contain ordinary metadata fields such as `expected`.

## Why This Matters

One executable contract prevents the schema shown to adopters from quietly
diverging from the command that gates their declarations. An explicit fixture
envelope keeps test-control data out of the consumer contract.

## When to Apply

- A reference catalog has both machine-readable documentation and an executable
  validation command.
- Applications may vendor the checker or invoke it from the catalog repository.

## Examples

```json
{
  "fixture": true,
  "expected": "valid",
  "declaration": { "id": "example-surface" }
}
```

The checker recognizes a fixture only when `fixture` is `true`; a consumer
declaration can retain its own top-level metadata without changing validation.

## Related

- `docs/ui-surfaces/surface-declaration.schema.json`
- `scripts/check-ui-surface-catalog.mjs`
