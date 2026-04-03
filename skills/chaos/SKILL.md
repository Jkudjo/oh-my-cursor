---
name: chaos
description: Failure injection — stress test implementations under hostile conditions before shipping
argument-hint: "<feature or implementation to chaos test>"
---

# chaos

Tests whether an implementation degrades gracefully under failure conditions — not just correctness under happy path.

## What it injects
- Service unavailability (external APIs, Redis, DB)
- Intermittent failures (30% failure rate)
- Slow dependencies (10x normal latency)
- Null/empty/boundary inputs
- Concurrent access and duplicate requests
- Auth bypass and privilege escalation attempts
- Input injection (SQL, HTML, command)

## Output
- Per-scenario verdict: RESILIENT | DEGRADES GRACEFULLY | FAILS UNGRACEFULLY | CATASTROPHIC
- Resilience score (0–100)
- Hard blocks on CATASTROPHIC findings (data loss, security bypass, silent corruption)

## Example
```
@chaos "the new checkout flow"
@chaos "the JWT authentication middleware"
```
