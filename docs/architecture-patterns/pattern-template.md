# Pattern card template

Every card supplies the following fields. The instruction under each field is part of the contract.

| Field | Required content |
|---|---|
| Identity | Stable `ARCH-###` ID, semantic version, status, parent reference, and change history. |
| Problem / use / avoid | The tension resolved, when it helps, and when its extra boundary is not justified. |
| Invariants | Numbered, observable rules; state what violates them. |
| Roles and authority | Each owner, source of truth, and explicitly derived state. |
| Flow and boundary contract | Inputs, results, typed errors, trust/authorization, and cancellation or timeout where relevant. |
| Failure and recovery | Failure transition, visible result, owner, and reconciliation path. |
| Examples | A positive placement and one plausible bolted-on counterexample with minimal correction. |
| Proof scenarios | Given/When/Then scenarios, observation boundary, pass/fail condition, and proof class. |
| Language mappings | Conceptual Python and TypeScript role mappings; name runtime differences without inventing equivalent guarantees. |
| Tradeoffs and composition | Costs, optional dependencies, and compatible patterns. |
| Adoption | What an application must pin and what evidence it must collect. |

No field may infer application conformance from catalog presence, directory naming, or prose review.

