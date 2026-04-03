---
name: deep-interview
description: Clarify scope, boundaries, and non-goals before writing any code
argument-hint: "<task or feature to clarify>"
---

# deep-interview

Invoke this skill to run a structured clarification session before touching code.

## When to use

- The request is vague or has multiple interpretations
- You're unsure what "done" looks like
- The scope boundaries are unclear
- You need to understand constraints before designing a solution

## What it does

1. Starts a `deep-interview` mode session via MCP
2. Asks 3–5 pointed clarifying questions (no code written)
3. Scores ambiguity 0–10 and iterates until score < 4
4. Produces a **Clarified Scope** document saved to memory
5. Hands off to `@ralplan`

## Example

```
@deep-interview "add authentication to the API"
```

Output:
- Clarified scope saved to memory key `clarified-scope`
- Ready to hand off to `@ralplan`
