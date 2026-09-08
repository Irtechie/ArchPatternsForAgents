# Completed Work

Completed work summaries move here after verification.

## 2026-09-08

- Architecture drift evidence and README: added a portable Node CLI for consumer-owned scope/ownership rules, non-suppressing exceptions, integrity-bound create-only reports, and baseline comparisons that flag policy changes. Added adoption/workflow-review guidance and incorporated the explicitly authorized README rationale and harness-independence explanation. Full npm test passed: 18 drift tests passed with one Windows file-symlink setup skip; directory-junction tests and 11 surface tests passed, as did the existing UI checks. One integrated CLI review returned no actionable findings. [Manifest](docs/plans/2026-09-08-kb-architecture-drift-manifest.md) and [proof](docs/reviews/2026-09-08-drift-proof.json). External application conformance remains unverified.

## 2026-09-06

- UI surface catalog — added checked declarations for explore, operate, decide,
  create, and monitor surfaces; added a rendering-lane guide for web, Rust, and
  C# clients; and routed `ui-craft` through surface selection before theme work.
  `npm test` passed. The separate root-README refresh remains local on
  `codex/root-readme-catalog-entrypoint` and was not mixed into this workstream.

## 2026-09-04

- Architecture-pattern catalog — rebased the prepared packet into this repository; authored ARCH-000 through ARCH-012, adoption/composition material, and review receipts. Catalog structure and adoption JSON were checked; `npm test` passed. Application conformance remains unverified by design.
