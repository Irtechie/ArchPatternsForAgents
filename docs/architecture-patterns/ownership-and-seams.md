# ARCH-000 — Domain ownership and explicit seams

Version: `0.1.0-draft`  
Status: proposed  
Parent: none

## Invariants

1. One domain owns each business decision and authoritative write.
2. A provider owns its published semantics; a consumer owns its adapter.
3. Derived state is identifiable, rebuildable, and never silently promoted to authority.
4. A caller reports an effect only from an owner result or reconciled receipt.

## Responsibility map

| Role | Owns | Does not own |
|---|---|---|
| Domain | decisions, authoritative records, public semantics | another domain's policy or storage |
| Consumer | UX and contract adapter | provider internals or validation rules |
| Provider | contract and repair of its service | consumer retry policy or presentation |
| Catalog | reusable specifications | application runtime or conformance verdict |

Repositories, processes, and languages are deployment choices. Multiple roles may share a process; one repository does not earn conformance merely by containing similarly named folders.

## Evidence rule

The relevant evidence is produced at the boundary a consumer crosses. A mocked transport, a source import, or a diagram can describe a seam but cannot prove the caller crossed it successfully.

