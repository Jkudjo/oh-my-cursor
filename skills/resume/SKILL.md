---
name: resume
description: Resume from last checkpoint — load full context and continue where you left off
argument-hint: "[checkpoint-id or empty for latest]"
---

# resume

Loads the last saved checkpoint and resumes execution from the saved next_steps.

## What it does
1. Loads the latest checkpoint
2. Restores active mode state
3. Loads the approved plan
4. Surfaces: "Last session: {summary}. Next: {next_steps}"
5. Confirms before continuing

## Example
```
@resume
@resume checkpoint-1234567890
```
