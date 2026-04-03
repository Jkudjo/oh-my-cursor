---
name: explore
description: Read-only codebase exploration — understand structure, data flow, and conventions before changing anything
argument-hint: "<what to understand, e.g. 'how auth works' or 'the data model'>"
---

# explore

Invoke this skill to understand a codebase or subsystem before making changes.

## When to use

- Starting work in an unfamiliar part of the codebase
- Before designing a plan that touches multiple files
- When you need to understand data flow, entry points, or conventions

## What it does

1. **No code changes** — read-only throughout
2. Maps the relevant subsystem:
   - Entry points and main files
   - Data flow and call graph
   - Key types and interfaces
   - External dependencies
   - Conventions and patterns in use
3. Produces an **Exploration Report**:
   ```
   ## Exploration: <topic>

   ### Files
   - `path/to/file.ts` — role and responsibility

   ### Data flow
   [description of how data moves]

   ### Conventions
   [naming, patterns, idioms in use]

   ### Key decisions
   [non-obvious design choices]

   ### Entry points for changes
   [where to start if you need to modify this]
   ```
4. Saves report to memory key `explore-<topic>`

## Example

```
@explore "how the authentication middleware works"
```
