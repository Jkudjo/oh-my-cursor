---
name: ralph
description: Persistent completion loop — execute the approved plan step by step until done
argument-hint: "<task or plan ID to execute>"
---

# ralph

Invoke this skill to execute an approved plan with persistent, verified step-by-step completion.

## When to use

- After `@ralplan` has produced an approved plan
- For multi-step tasks that need to persist through failures
- When you want guaranteed completion with verification at each step

## What it does

1. Loads the latest approved plan from `.omc/plans/`
2. Executes each step, verifying before moving on
3. Persists progress via `update_mode_state` after each step
4. Fixes failures before continuing — never skips
5. Runs a final verification pass
6. Reports completion summary

## Example

```
@ralph "execute the approved auth implementation plan"
```

Output:
- All plan steps completed and verified
- Completion summary with files changed and test results
