# Spot architecture drift over time

This is an optional, harness-independent check for a consumer repository. It uses Node and local files; no model, skills harness, registry service, or account is required. It lives in this catalog's existing verification scripts. Application owners supply the policy and retain the reports.

## What the checker can establish

It inventories explicitly scoped source files, assigns each to the most-specific declared component path, and applies consumer-authored forbidden text rules. It reports unowned files, rule matches, and overdue exception reviews. A second run can compare the inventory and finding identities to an earlier report.

It does **not** parse all languages, resolve dynamic imports, discover duplicated business meaning, inspect databases, authenticate approvals, or prove that a live request crossed a service boundary. Text rules can match comments and strings and can miss alternate syntax. They are trusted local configuration, like test code: review their precision and write negative tests for them.

A clean report means only that the declared checks found no violations in the declared scope. The report records excluded scope and limitations; a policy with no boundary rules is an ownership inventory, not boundary verification.

## Declare one workflow first

Copy [the example policy](drift-policy.example.json) into the consumer repository, for example at `docs/architecture/drift-policy.json`. Replace the synthetic paths and roles with actual owners and responsibility statements. Pick one important workflow before expanding the scope.

- `source_roots` are literal repo-relative directories, not globs.
- `extensions` select source suffixes. `ignore` contains literal relative subtrees.
- Each component has an ID, path, owner, and responsibility. The most-specific path wins. Duplicate paths are invalid.
- Each rule has an ID, description, component ID, and a line-based `forbidden_regex`.
- An exception names its rule and component, owner, reason, `review_by` date, and `removal_condition`. It annotates the violation; it never suppresses it.
- Missing roots, an empty source scan, unsafe links/paths, malformed policy, or invalid baseline are errors, not clean reports.

For example, a consumer adapter can forbid `provider[./]internal` while using a public provider client. That is one precise syntactic boundary check. A separate provider test must establish that only the provider can perform an authoritative write.

## Run and retain evidence

Run the installed catalog script against the consumer. Paths may be absolute; quote paths containing spaces. Create the report directory beforehand. Each output filename must be new.

```powershell
node E:/ArchPatterns/scripts/check-architecture-drift.mjs --root E:/MyApp --policy E:/MyApp/docs/architecture/drift-policy.json --out E:/DriftReports/myapp-before.json
node E:/ArchPatterns/scripts/check-architecture-drift.mjs --root E:/MyApp --policy E:/MyApp/docs/architecture/drift-policy.json --baseline E:/DriftReports/myapp-before.json --out E:/DriftReports/myapp-after.json
```

With no `--out`, JSON is written to stdout. `--as-of YYYY-MM-DD` makes exception-review timing reproducible in tests; ordinary runs use the current UTC date. Exit 0 means clean for the declared scope, 1 means findings or a policy change, and 2 means invalid invocation/input or a scan/output failure. The tool never rewrites policy or baseline and refuses to overwrite an output file.

Reports bind source hashes, policy identity, tool/report format, and available Git identity. A non-Git directory has unknown revision evidence rather than a fabricated commit. Report integrity hashes detect accidental changes; someone who can rewrite a report can recompute its hash. Protect history with your repository review controls or existing artifact retention.

Comparison separates new, resolved, and persisting findings, added/removed/changed files, and count deltas. Finding identity excludes line number so a moved match does not look like a new architectural violation. Component, rule, exception, and file counts are signals for review, not arbitrary architecture limits. Dependency counts that are not measured remain unavailable.

## Do not let the baseline bless the change

A changed policy is itself a finding. Inspect changes to component paths, source scope, ignores, rules, and exceptions before accepting a replacement baseline. A falling violation count is ambiguous if the rule that found those violations was deleted.

Keep the prior report. Record the decision, responsible reviewer, changed invariant, and any migration or removal condition in the application's normal architectural decision record. Run the accepted policy as a new reference only after that review. This tool makes the change visible; it cannot enforce who approved it or prevent a caller from omitting `--baseline`.

Applications that require enforcement should make their existing local delivery or CI workflow supply the trusted earlier report and review policy changes separately from implementation. This catalog adds no CI workflow or scheduled service.

## Review each meaningful change

1. Identify the affected component owner and adopted pattern invariants.
2. Inspect changed boundaries in code, including new dependencies, duplicate adapters, extra background jobs, and fallback paths.
3. Run the scoped checker with the previous report, then the owner's contract tests and actual consumer probes as appropriate.
4. Review new and resolved findings. Explain significant growth instead of failing solely on size.
5. Record deviations and refresh application adoption evidence at the tested revision. Never convert `diverged` to `verified-at-revision` merely by editing a declaration.

Keep one deliberately invalid example for every consequential rule: a forbidden import, rejected cross-owner write, or unauthorized transition should actually fail its corresponding check. Test the checker and the domain behavior at their respective boundaries.

## Periodic workflow trace

Repeat after a significant boundary change or on a cadence appropriate to the application. Use an existing review process; no automation is required.

| Record | Evidence to retain |
|---|---|
| Workflow and revision | One real user operation, source/deployment identity, and the adopted patterns it crosses |
| Ownership | Where the decision happens and which domain writes the authoritative state |
| Trace | Request/job identity connecting the consumer symptom to the owner result |
| Failure exercise | A safe representative failure, its visible outcome, and confirmation that no unverified success is reported |
| Recovery | The documented reconciliation, retry, cancellation, or repair action and its owning repository |
| Complexity review | Added components/dependencies/calls, duplicated decisions/adapters, and exceptions due for review |
| Follow-up | A bounded correction, an owner, and a review/removal condition |

A maintainer should be able to perform the trace without the original agent conversation. Retire policy entries and obsolete paths when their responsibilities disappear, and retain the decision explaining the retirement.

## Verify this tool

From the catalog checkout, run `npm run test:drift`. It exercises synthetic consumers through the actual CLI, including invalid boundaries and history comparisons. `npm test` also runs the existing UI registry checks. These tests prove the checker contract, not adoption or runtime readiness of an external application.
