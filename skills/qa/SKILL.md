---
name: qa
description: Systematic QA pass — test the feature, find bugs, report with repro steps
argument-hint: "<feature or area to test>"
---

# qa

Invoke this skill to run a structured QA testing pass.

## When to use

- After implementing a feature
- Before shipping or creating a PR
- When you want to verify edge cases were handled

## What it does

1. Identifies what was built (reads recent changes, plan if available)
2. Generates a test plan:
   - Happy path scenarios
   - Edge cases (empty, null, max, concurrent)
   - Error/failure paths
   - Integration points
3. Executes each test case — runs code, reads output, verifies behavior
4. For each failure: documents repro steps, expected vs actual
5. Reports:
   - Health score (0–100)
   - Passed / Failed / Skipped counts
   - Bug list with repro steps
   - Recommendation: SHIP / SHIP WITH NOTES / HOLD

## Example

```
@qa "the new authentication flow"
```
