# Memory Maintenance

Last deep review: never

## Counters Since Last Review

- Completed KB cycles: 1
- Durable memory refreshes: 1
- Closed handoffs: 0
- Contradiction signals: 0
- Overlap signals: 0
- Stale-doc signals: 1
- Bloat signals: 0
- Repeated-rediscovery signals: 0

## Signals Since Last Review

### 2026-09-06 - stale-doc - evaluation map catalog status
- Source: `docs/context/eval-map.md`
- Found during: `kb-finalize` memory refresh
- Signal: The map described the UI-surface declaration check as planned after its deterministic checker existed.
- Suggested pass: refresh the evaluation map whenever a catalog proof command is added.
