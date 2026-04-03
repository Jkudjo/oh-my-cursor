---
name: ralplan
description: Generate and get approval on an implementation plan before writing code
argument-hint: "<task or approved scope to plan>"
---

# ralplan

Invoke this skill to produce a reviewed, approved implementation plan.

## When to use

- After `@deep-interview` has clarified scope
- Before any non-trivial implementation
- When you want to review architectural tradeoffs before committing

## What it does

1. Loads clarified scope from memory (if available)
2. Generates a structured plan: approach, steps, files, tradeoffs, risks
3. Presents the plan for approval
4. Iterates on feedback until approved
5. Saves the approved plan via `save_plan` MCP tool
6. Hands off to `@ralph`

## Example

```
@ralplan "implement JWT authentication for the Express API"
```

Output:
- Approved plan saved to `.omc/plans/`
- Ready to hand off to `@ralph`
