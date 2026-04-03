---
name: autopilot
description: Fully autonomous execution — clarify, plan, and execute without interruption
argument-hint: "<well-scoped task to execute autonomously>"
---

# autopilot

Invoke this skill to run the full workflow (clarify → plan → execute) autonomously without manual approval gates.

## When to use

- The task is well-scoped and you trust autonomous execution
- You want hands-off completion of a clear feature or bug fix
- You're comfortable with self-approved plans

## What it does

1. Internally scores ambiguity — asks at most 2 questions if score > 7
2. Generates and self-approves an implementation plan
3. Executes every step with verification
4. Reports completion

## Example

```
@autopilot "fix the failing unit tests in src/auth/"
```

## Warning

Autopilot self-approves plans. Use for well-scoped tasks only. For anything with significant architectural decisions, use `@deep-interview` + `@ralplan` + `@ralph` instead.
