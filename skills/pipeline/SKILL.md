---
name: pipeline
description: Full CI pipeline — typecheck, lint, build, test, security scan, report
argument-hint: "[--fix] [--report-only]"
---

# pipeline

Runs the full CI pipeline end-to-end. Each stage auto-fixes if possible, then reports.

## Stages
1. Typecheck
2. Lint
3. Build
4. Tests
5. Security scan

## Flags
- `--fix` (default) — auto-fix where possible (lint, simple type errors)
- `--report-only` — run and report without fixing anything

## Example
```
@pipeline
@pipeline --report-only
```

Saves pipeline report to `.omc/specs/pipeline-{date}.md`.
