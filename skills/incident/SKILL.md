---
name: incident
description: Production incident response — structured triage, hypothesis tree, safe remediation, incident record
argument-hint: "<symptom, e.g. '503s in eu-west after deploy'>"
---

# incident

Full production incident response protocol. Handles the furnace scenarios — green metrics but users affected, regional failures, post-deploy regressions.

## Phases
1. **Impact triage** — scope, symptom, start time, blast radius (2 min)
2. **Evidence gathering** — read-only: recent changes, error logs, traces, infra health, dependencies, regional scope
3. **Hypothesis tree** — app, infra, data, client/observability — full tree before investigating any branch
4. **Safe remediation** — root cause confirmed → state blast radius + rollback → fix → verify
5. **Incident record** — timeline, root cause, fix, monitoring gap, follow-up

## Hard rules
- Read-only until cause is confirmed
- Green metrics ≠ no incident — metrics lie via wrong thresholds, aggregation, wrong segment
- "The deploy caused it" is a hypothesis, not a fact
- No destructive infra changes without explicit confirmation + rollback plan
- No disabling auth during incident response

## Example
```
@incident "intermittent 503s in us-east after today's deploy — pods Running, CPU/memory normal"
```
