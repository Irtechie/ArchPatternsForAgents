# Eval Map

Checked: 2026-09-04

## App Pattern

Documentation/skill companion repository with a static HTML theme registry and Node-based deterministic checks.

## Primary Workflows

| Workflow | Surface | Current Proof | Gap | Priority |
|---|---|---|---|---|
| Theme registry conformance | HTML files and `themes/index.json` | `npm test` | Visual judgment remains human review | high |
| UI-craft semantic substrate | Skill and HTML pages | `npm run check:pages`, `npm run a11y` | No app-runtime proof intended | high |
| Architecture catalog consistency | Markdown and review receipts | Planned structural/review checks | No catalog check exists yet | high |

## Existing Harnesses

`package.json` exposes Node scripts for page, accessibility, controls, divergence, repetition, and preview verification. No LLM-judged test is currently a release gate.

## Deterministic vs LLM-Judged

- Deterministic: all existing `npm` checks and any catalog structure/link validation.
- LLM-judged: conceptual architecture-card quality review, recorded as a review receipt rather than presented as runtime proof.
- HITL: visual design quality and any application-specific adoption decision.

## Open Eval Gaps

- The planned architecture catalog needs a local, deterministic structure check before it can claim consistent card coverage.
- Application adoption, runtime behavior, and model quality are intentionally outside this repository's proof boundary.
