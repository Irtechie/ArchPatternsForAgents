# Testing Operations

## Deterministic commands

| Command | Scope | Notes |
|---|---|---|
| `npm test` | Theme registry | Broad local verification; uses an installed Chrome or Edge through Playwright Core. |
| `npm run check:pages` | Theme pages | Fast semantic-substrate and layout-density check. |
| `npm run a11y` | Theme pages | Browser-computed accessible-name audit. |

## Catalog proof

The architecture catalog will use structural checks and review receipts. Those checks prove field coverage, links, examples, and internal consistency. They must state that they do not prove any application has adopted or executed a pattern.
