# Composed example: synthetic research assistant

A browser UI sends a research request to an application domain. The domain owns task status and requests an attributed, bounded context envelope. Retrieval returns passages with source revisions; a model port produces a validated candidate. When the candidate proposes an effect, an authorized-command owner validates the actor, scope, and idempotency key. Long work returns a durable job ID; an observer creates one evidence-backed attention item only when authoritative state changes.

| Responsibility | Owner | Patterns |
|---|---|---|
| Task and business decision | Application domain repository | ARCH-001, ARCH-002 |
| Retrieval corpus and index | Evidence repository / derived index | ARCH-005 |
| Context and model translation | Application integration module | ARCH-003, ARCH-004 |
| Effect validation and receipt | Effect-owning provider | ARCH-007, ARCH-011 |
| Long-running execution | Job-owning provider | ARCH-008, ARCH-009 |
| Attention | Application observer | ARCH-010 |
| Proof split | Each owner’s tests and probes | ARCH-012 |

No one repository is required per pattern. One role may share a process with another when authority remains explicit. A read-only three-pattern application may use only ARCH-001, ARCH-004, and ARCH-005; it does not inherit tools, jobs, memory, or attention.

Bad changes are detectable: a foreign database write violates ARCH-001; a duplicated eligibility decision violates ARCH-001/002; provider SDK imports in handlers violate ARCH-003; an undocumented invariant waiver changes the adoption status to `diverged`.
