---
name: checkpoint
description: Save a session checkpoint — what was done, what's next, any blockers
argument-hint: "\"summary of what was done\""
---

# checkpoint

Saves a full session snapshot so the next Cursor session can resume exactly where you left off.

This is omc's core moat over plain Cursor rules — state persists across context resets.

## What it saves
- What was accomplished this session
- Exact next steps for the next session
- Active modes and their phases
- Latest approved plan
- All memory entries
- Any blockers

## Example
```
@checkpoint "finished implementing the auth middleware, tests passing"
```
