---
name: note
description: Quick note — save a decision, observation, or thought to persistent memory
argument-hint: "\"the note content\""
---

# note

Saves a timestamped note to `.omc/memory/`. Survives context resets and sessions.

## Example
```
@note "decided to use JWT — simpler for stateless API"
@note "perf issue is in the user query at line 47"
```

Review notes with: `omc memory list`
