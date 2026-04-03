---
name: diagnose
description: Systematic root cause diagnosis — generate full hypothesis tree before investigating any branch
argument-hint: "<symptom or error to diagnose>"
---

# diagnose

Structured diagnosis that prevents tunneling on the first plausible theory.

## The iron law
Root cause before fix. Never propose a solution without evidence-backed cause.

## What it does
1. Gathers facts — what, when, scope, what changed (read-only)
2. Generates ≥5 hypotheses across app/data/network/infra/client domains — **before investigating any**
3. Ranks by likelihood × blast radius × ease of ruling out
4. Investigates in ranked order, updating confidence as evidence comes in
5. Produces a confirmed diagnosis with blast radius, rollback path, and verification steps
6. Hands off to `@ralph` for the fix

## When to use
- "The API is returning 500s"
- "Users report X but metrics look fine"
- "It works in staging but not prod"
- Any situation where the cause is unknown

## What it avoids
- Tunneling on the first theory
- Treating "check the logs" as a hypothesis
- Trusting green dashboards as proof of no incident
- Fixing before the root cause is confirmed
