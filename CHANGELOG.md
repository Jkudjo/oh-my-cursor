# Changelog

## 0.1.0 — 2026-04-03

Initial release.

### Skills (18)
- `@deep-interview` — Socratic clarification with ambiguity scoring and depth profiles
- `@ralplan` — implementation plan generation and approval
- `@ralph` — persistent completion loop
- `@autopilot` — autonomous clarify → plan → execute
- `@explore` — read-only codebase mapping
- `@tdd` — red-green-refactor TDD cycle
- `@review` — code review with CRITICAL/HIGH/MEDIUM/LOW severity ratings
- `@security-review` — OWASP Top 10 audit
- `@qa` — QA cycle mode (test → diagnose → fix → repeat)
- `@pipeline` — full CI gate (typecheck → lint → build → test → security)
- `@analyze` — codebase complexity and tech debt analysis
- `@git-master` — clean commits, PR prep, conflict resolution
- `@team` — tmux-based parallel agent coordination
- `@ultrawork` — maximum effort full pipeline
- `@checkpoint` — session state snapshot
- `@resume` — restore from last checkpoint
- `@note` — persistent quick notes
- `@cancel` — cancel active workflow modes

### MCP server (20 tools)
- Session continuity: `get_session_context`, `save_checkpoint`, `load_checkpoint`, `list_checkpoints`
- Workflow: `start_mode`, `update_mode_state`, `get_mode_state`, `cancel_mode`
- Plans: `save_plan`, `load_plan`, `list_plans`
- Memory: `set_memory`, `get_memory`, `list_memory`
- Artifacts: `save_artifact`, `load_artifact`, `list_artifacts`, `latest_artifact`
- Team: `create_team_session`, `assign_task`, `update_task`, `get_team_status`

### CLI
- `omc setup` — scaffold `.cursor/rules/` and register MCP server
- `omc update` — refresh rules from latest templates
- `omc doctor` — 21-point health check
- `omc status` — active modes, plans, memory
- `omc plan list/show/approve`
- `omc memory list/get/set/del`
- `omc cancel <mode|all>`
- `omc team start/stop/status/attach/logs`
- `omc skills` / `omc skill <name>`
