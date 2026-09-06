# Testing Operations

## Deterministic commands

| Command | Scope | Notes |
|---|---|---|
| `npm test` | UI surface catalog and theme registry | Broad local verification; starts with declaration fixtures and uses an installed Chrome or Edge through Playwright Core for theme checks. |
| `npm run check:surfaces` | UI surface declarations | Validates required fields and rejects unearned primary card-grid or table layouts. |
| `npm run check:pages` | Theme pages | Fast semantic-substrate and layout-density check. |
| `npm run a11y` | Theme pages | Browser-computed accessible-name audit. |

## Catalog proof

The architecture catalog will use structural checks and review receipts. Those checks prove field coverage, links, examples, and internal consistency. They must state that they do not prove any application has adopted or executed a pattern.
