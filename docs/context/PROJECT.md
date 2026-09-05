# Project Map

Bootstrap: 2026-09-04  
Confidence: verified for the checked-in theme registry and Node checks; the incoming architecture catalog is active work.

## What This Is

ArchPatternsForAgents is a private companion repository for machine-checkable architecture-pattern and UI-craft guidance. It contains a Node-based HTML theme registry, executable checks for that registry, and documentation/research that informs agent-oriented architecture patterns.

## How To Test

- `npm test` — runs the theme registry's page, accessibility, control-index, divergence, repetition, and preview checks.
- `npm run check:pages` — checks each theme page's semantic substrate and layout rules.

## Subsystem Index

| Area | Read this | Use when | Confidence |
|---|---|---|---|
| Theme registry | `themes/README.md`, `themes/GALLERY.md`, `themes/index.json` | Editing or selecting a UI finish | verified |
| UI craft skill | `.github/skills/ui-craft/SKILL.md` | Building or reviewing a UI surface | verified |
| Registry checks | `scripts/`, `package.json` | Running or changing deterministic theme proof | verified |
| Architecture catalog | `docs/architecture-patterns/README.md` | Selecting, adopting, or reviewing a documented pattern | pending delivery |
| Research | `docs/context/research/README.md` | Reusing decision-oriented prior research | verified |

## Current Work Pointers

- Active catalog work: `todo.md`.
- Current requirements source: `E:/Dev/Operations/codex-setup/docs/plans/2026-09-04-architecture-patterns/requirements.md`.
- Earlier broad requirements: `docs/brainstorms/2026-08-10-arch-patterns-for-agents-v1-requirements.md`.

## Known Sharp Edges

- Per-page UI checks cannot detect a registry-wide visual monoculture; run the full `npm test` suite for theme changes.
- A passing documentation review establishes catalog consistency only, never application conformance or runtime readiness.

