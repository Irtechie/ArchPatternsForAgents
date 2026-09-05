# Application adoption record

An application keeps this record locally, normally at `docs/architecture/pattern-adoptions.json`. It pins catalog identity and evidence; it does not assert historical derivation or current conformance by default.

```json
{
  "schema_version": 1,
  "application": "synthetic-research-assistant",
  "repository": "example/research-assistant",
  "assessed_revision": "example-revision",
  "reviewed_at": "2026-09-04",
  "patterns": [{
    "id": "ARCH-007",
    "version": "0.1.0-draft",
    "source_locator": "immutable catalog locator",
    "source_hash": "example-hash",
    "relation": "uses",
    "status": "adopted-unverified",
    "roles": { "validator": "src/commands/validate", "owner": "src/calendar" },
    "preserved_invariants": ["ARCH-007.1"],
    "changed_invariants": [],
    "evidence": [],
    "recheck_triggers": ["owner boundary change", "catalog major-version change"]
  }]
}
```

Allowed statuses are `proposed`, `adopted-unverified`, `verified-at-revision`, `diverged`, and `retired`. A hash proves the referenced content's identity, not the application's behavior. A changed invariant makes the local record `diverged` until an explicit migration records the new contract.

Use `historically-derived-from` only with an origin record. Otherwise use `uses` or `adapted-from`.
