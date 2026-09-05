# ARCH-013 — Deterministic boundary before probabilistic inference

Version: 0.1.0-draft
Status: proposed
Parent: [ARCH-000](ownership-and-seams.md)
Relations: uses ARCH-002, ARCH-003, ARCH-008, ARCH-011, and ARCH-012; use ARCH-007 when a result can cause an effect.

## Problem, use, and avoid

Use this pattern when an operation has a maintained, programmatically verifiable contract: parsing a known schema, selecting a declared DOM target, calling a documented API, calculating a result, or applying a known transition. It prevents a model from becoming an invisible substitute for a broken integration boundary.

Avoid claiming that every task that can be expressed in code must be deterministic. A brittle selector without target identity, schema validation, or fixture proof is not a trustworthy deterministic contract. Visual or semantic interpretation may legitimately be probabilistic, but it must be declared and evaluated as such.

## Invariants

1. Each operation declares one execution mode: `deterministic`, `probabilistic-with-validation`, or `uncovered`.
2. A deterministic operation uses its declared adapter and validation rules; it does not invoke a model provider for that operation.
3. Adapter failure returns a typed `structural_drift`, `invalid_source`, or `unknown` result. It does not silently degrade into model inference or an authoritative write.
4. A probabilistic route is explicit, attributed, and subject to its own validation and quality evidence.

## Roles and authority

| Role | Owns |
|---|---|
| Operation owner | Classifies the operation and permitted execution modes. |
| Deterministic adapter | Calls the API, parser, selector, calculator, or transition implementation. |
| Validator | Checks target identity, schema, completeness, and value constraints. |
| Workflow owner | Stops, retries, or requests repair only from typed results. |
| Evidence owner | Correlates the failure, revision, and recovery receipt. |

The adapter is normally owned by the consumer integration boundary described by ARCH-002, not by a universal orchestrator. The workflow does not acquire parsing or provider authority merely because it invokes the adapter.

## Flow and boundary contract

The caller supplies operation ID, source/target identity, expected schema or selector revision, validation rules, and an idempotency or correlation identity where replay matters. The adapter returns `value`, `no-value`, `structural-drift`, `invalid-source`, or `unknown`; each result carries the observed target revision and evidence locator where available.

The owner may pass a clean validated payload to a model for a separate semantic task. That is not permission for the model to extract, repair, or guess the deterministic operation's result.

## Failure and recovery

| Situation | Required visible result | Recovery |
|---|---|---|
| Selector/API/schema changes | Typed structural-drift result and correlated ARCH-011 evidence | Repair the adapter against refreshed fixtures and a real boundary probe. |
| Validation is incomplete | Invalid-source result; no downstream effect | Tighten contract or reclassify operation explicitly. |
| Model is invoked for a deterministic operation | Policy violation | Block the result and correct routing; retain the invocation evidence. |
| No maintained deterministic contract exists | Explicit `uncovered` or probabilistic-with-validation route | Record quality and boundary proof under ARCH-012. |

Human review is required only when repair needs access, authority, or a new product decision. A repair with available fixtures and caller-boundary proof is agent-owned; it must still be visible as a changed adapter revision.

## Examples

**Conformant placement.** A consumer-owned finance integration requests a documented balance endpoint, validates the versioned response schema and account identity, and passes only the validated amount to a later semantic summarizer.

**Counterexample.** A vision model logs into a dashboard, scrolls visually, guesses which row contains an account value, and writes that value after a popup or CSS change. Its output has no target identity, selector revision, schema validation, or structural failure signal.

**Minimal correction.** Put the documented API client or DOM parser behind the consumer adapter. Validate the target and values; return structural drift when the contract breaks. If visual extraction remains necessary, classify it as probabilistic-with-validation and prohibit it from becoming authoritative without its declared proof.

## Proof scenarios

| Scenario | Observation boundary | Pass condition | Proof class |
|---|---|---|---|
| Known HTML/API fixture | Adapter and provider-invocation trace | Exact validated values; zero model-provider invocations for this operation | deterministic behavior test |
| Broken selector or changed schema | Consumer-to-adapter boundary | Typed structural-drift; dependent DAG node halts; no guessed payload crosses the seam | integration/caller probe |
| Corrupt but parseable value | Validator boundary | Invalid-source result and no authoritative write | deterministic behavior test |
| Explicit probabilistic route | Evaluation boundary | Mode, model/config identity, validation, and quality limits are recorded | quality evaluation plus boundary proof |

## Conceptual language mappings

- **Python:** a typed adapter function or protocol returns a discriminated result object; a parser, API client, or calculator is invoked before any model-port call.
- **TypeScript:** an adapter interface returns a discriminated union such as `value | structuralDrift | invalidSource | unknown`; schema/DOM/API checks remain in ordinary code.

The mappings do not promise browser, transaction, or transport guarantees. Those guarantees come from the selected runtime and the stated proof scenario.

## Tradeoffs, composition, and adoption

Maintained deterministic contracts cost fixtures, version handling, and drift alerts. They buy a precise failure mode instead of plausible corruption. This card composes with ARCH-003 to keep model calls narrow, ARCH-008 to halt or route typed failures, ARCH-011 to correlate recovery, and ARCH-012 to keep quality evidence separate.

An adopting application records operation IDs, allowed modes, adapter locations, target/schema revisions, and proof commands in its local adoption evidence. A changed operation mode or adapter contract invalidates prior verification until refreshed evidence is recorded.

## Change history

- 0.1.0-draft — initial proposal.

