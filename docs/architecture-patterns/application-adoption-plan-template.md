# Application-local adoption plan template

1. Read the target repository’s instructions, current source, dirty state, component map, and existing tests.
2. Select one real workflow and record its current observed behavior.
3. Bind only the necessary catalog cards by immutable ID, version, and hash. Do not force a novel responsibility into the nearest card.
4. Map each adopted role to real source files, public contracts, authoritative state, and existing owners.
5. State every preserved, changed, or rejected invariant. A changed invariant requires a local decision record and sets the record to `diverged` until proved under the new contract.
6. Name actual owner-local tests and real consumer-boundary probes. Do not invent placeholder commands or call a mock an end-to-end probe.
7. Record evidence with revision, environment, timestamp, observed result, and coverage limit. Recheck after any changed declared role, invariant, contract, provider, or runtime environment.

This template plans adoption; adding an adoption JSON file alone is not adoption or conformance.
