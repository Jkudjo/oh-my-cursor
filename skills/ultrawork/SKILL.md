---
name: ultrawork
description: Maximum effort mode — full pipeline from exploration to shipped, verified PR
argument-hint: "<task to execute at maximum rigor>"
---

# ultrawork

The highest-rigor execution mode. Runs the full omc workflow end-to-end with no shortcuts.

## Sequence
```
@explore → @deep-interview → @ralplan → @tdd/@ralph → @review → @security-review → @qa → @pipeline → @git-master prep-pr
```

## When to use
- High-stakes features (auth, payments, data migrations)
- When quality matters more than speed
- Before major releases

## When NOT to use
- Quick bug fixes → use `@ralph` directly
- Exploratory work → use `@explore` + `@autopilot`

## Example
```
@ultrawork "implement the payment processing flow"
```

Hard stops:
- `@review` FAIL → fix before continuing
- `@security-review` CRITICAL → fix before continuing (no exceptions)
- `@pipeline` FAIL after 2 cycles → surface to user
