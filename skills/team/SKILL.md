---
name: team
description: Coordinate parallel work across multiple Cursor sessions via shared .omc/team/ state
argument-hint: "\"goal\" | worker <session_id> <task_id>"
---

# team

Coordinate parallel execution across multiple Cursor chat sessions using shared state in `.omc/team/`.

## Coordinator mode
```
@team "implement the auth module — split into 3 parallel tracks"
```
Creates a team session, breaks the plan into parallel tasks, assigns to workers.

## Worker mode
```
@team worker team-1234567890 task-1234567890
```
Loads assigned task, executes it, reports back via shared state.

## How it works
- Coordinator and workers share `.omc/team/{session-id}.json`
- Each worker runs in a separate Cursor chat session in the same project
- State is synced through the filesystem — no network needed
- Coordinator monitors with `get_team_status`
