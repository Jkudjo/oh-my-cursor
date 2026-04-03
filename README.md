# oh-my-cursor (omc)

> Workflow layer for [Cursor](https://cursor.com) — structured skills, persistent state, and tmux-based parallel agents.

[![npm version](https://img.shields.io/npm/v/oh-my-cursor)](https://www.npmjs.com/package/oh-my-cursor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

omc keeps Cursor as the AI engine and adds:

- **Session continuity** — state survives context resets via MCP-backed `.omc/` storage
- **Structured workflow** — clarify → plan → execute → verify → ship
- **18 built-in skills** — from `@deep-interview` to `@ultrawork`
- **Tmux team runtime** — real parallel workers coordinated via shared state
- **CLI management** — `omc setup`, `omc status`, `omc team start`, and more

## Quick start

```bash
npm install -g oh-my-cursor
omc setup          # scaffolds .cursor/rules/ + MCP server in your project
```

Open the project in Cursor and start:

```
@deep-interview "clarify the task before writing code"
@ralplan "generate and approve an implementation plan"
@ralph "execute the plan step by step"
```

## How it works

`omc setup` creates two things in your project:

1. **`.cursor/rules/`** — rule files that guide Cursor's behavior (always-on workflow, skill protocols)
2. **`.cursor/mcp.json`** — registers the omc MCP server so Cursor has persistent state tools

The MCP server exposes tools like `save_plan`, `load_plan`, `save_checkpoint`, `get_session_context` — this is what makes state survive context resets. CursorRIPER and other rule-based frameworks lose all state when the context window resets. omc doesn't.

## Workflow

```
@explore → @deep-interview → @ralplan → @tdd/@ralph → @review → @security-review → @qa → @pipeline → @git-master
```

Or use `@ultrawork` to run the full pipeline automatically.

## Skills

| Skill | Description |
|-------|-------------|
| `@deep-interview` | Socratic clarification with ambiguity scoring (0.0–1.0), depth profiles (`--quick/--standard/--deep`) |
| `@ralplan` | Generate + approve an implementation plan before writing code |
| `@ralph` | Persistent completion loop — execute plan step by step until done |
| `@autopilot` | Autonomous execution — clarify, plan, and execute without interruption |
| `@explore` | Read-only codebase mapping before touching anything |
| `@tdd` | Test-driven development — red-green-refactor cycle |
| `@review` | Code review with CRITICAL/HIGH/MEDIUM/LOW severity ratings |
| `@security-review` | OWASP Top 10 audit — injection, auth, secrets, supply chain |
| `@qa` | QA cycle mode — test, diagnose, fix, repeat (max 5 cycles) |
| `@pipeline` | Full CI: typecheck → lint → build → test → security |
| `@analyze` | Complexity, coupling, dead code, tech debt hotspots |
| `@git-master` | Clean commits, PR prep, conflict resolution |
| `@team` | Parallel agents coordinated via tmux + shared state |
| `@ultrawork` | Maximum effort — full pipeline from exploration to shipped PR |
| `@checkpoint` | Save session state — resume exactly where you left off |
| `@resume` | Load last checkpoint and continue |
| `@note` | Quick persistent notes across sessions |
| `@cancel` | Cancel an active workflow mode |

## Session continuity

The core advantage over plain Cursor rules:

```
# End of session
@checkpoint "finished auth middleware, tests passing"

# Next session (new Cursor chat, context reset)
@resume
# → "Last session: finished auth middleware. Next: implement auth routes in src/routes/auth.ts"
```

Behind the scenes, `get_session_context` is called at the start of every session (via `00-workflow.mdc` with `alwaysApply: true`), loading active modes, approved plans, and memory from `.omc/`.

## Team mode

For large tasks, spawn real parallel workers:

```bash
# Terminal
omc team start --workers 3 --goal "implement the payment module"

# Cursor chat (coordinator)
assign_task session_id="team-XXX" title="Payment routes" description="..." assigned_to="worker-1"
assign_task session_id="team-XXX" title="Payment service" description="..." assigned_to="worker-2"
assign_task session_id="team-XXX" title="Payment tests" description="..." assigned_to="worker-3"

# Monitor
omc team status
omc team attach    # watch all panes in tmux
```

Workers run `codex` in separate tmux panes, polling `.omc/team/` for tasks. Results are written back to shared state.

## CLI

```
omc setup                      Scaffold .cursor/rules/ + register MCP server
omc update                     Refresh rules from latest templates
omc doctor                     Health check — verify installation
omc status                     Show active modes, plans, memory
omc plan [list|show|approve]   Manage saved plans
omc memory [list|get|set|del]  Manage persistent memory
omc cancel <mode|all>          Cancel an active workflow mode
omc team <start|stop|status|attach|logs>  Tmux parallel agents
omc skills                     List available skills
omc skill <name>               Show a skill's prompt
```

## MCP tools

The omc MCP server exposes these tools to Cursor:

**Session continuity**
- `get_session_context` — load all active state at session start
- `save_checkpoint` / `load_checkpoint` / `list_checkpoints`

**Workflow**
- `start_mode` / `update_mode_state` / `get_mode_state` / `cancel_mode`

**Plans**
- `save_plan` / `load_plan` / `list_plans`

**Memory**
- `set_memory` / `get_memory` / `list_memory`

**Artifacts**
- `save_artifact` / `load_artifact` / `list_artifacts` / `latest_artifact`

**Team**
- `create_team_session` / `assign_task` / `update_task` / `get_team_status`

## Requirements

- Node.js 20+
- Cursor (any recent version with MCP support)
- `tmux` — for team mode only (`sudo apt install tmux` / `brew install tmux`)
- `codex` CLI — for team worker execution (`npm install -g @openai/codex`)

## Installation

```bash
npm install -g oh-my-cursor

# In your project:
omc setup
omc doctor    # verify everything is working
```

## Comparison

| Feature | omc | CursorRIPER | raw rules |
|---------|-----|-------------|-----------|
| Session continuity | ✓ MCP-backed | ✗ context only | ✗ |
| Persistent state | ✓ `.omc/` | ✗ | ✗ |
| Ambiguity scoring | ✓ mathematical | ✗ | ✗ |
| Team/parallel agents | ✓ tmux + codex | ✗ | ✗ |
| Security audit | ✓ dedicated skill | ✗ | ✗ |
| CI pipeline | ✓ full gate | ✗ | ✗ |
| TDD cycle | ✓ | ✗ | ✗ |
| CLI management | ✓ | ✗ | ✗ |
| `omc update` | ✓ | ✗ | ✗ |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
