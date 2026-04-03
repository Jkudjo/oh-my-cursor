import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  loadActiveTeamSession,
  getTeamStatus,
  updateTask,
  createTeamSession,
} from "../state/team.js";
import { getTeamDir } from "../state/team.js";

const TMUX = findTmux();
const CODEX = findCodex();

function findTmux(): string {
  for (const p of ["/usr/bin/tmux", "/usr/local/bin/tmux", "/opt/homebrew/bin/tmux"]) {
    if (fs.existsSync(p)) return p;
  }
  // Fall back to PATH
  try { execSync("tmux -V", { stdio: "ignore" }); return "tmux"; } catch { /* */ }
  throw new Error("tmux not found. Install it with: sudo apt install tmux");
}

function findCodex(): string {
  const candidates = [
    `${process.env.HOME}/.local/bin/codex`,
    "/usr/local/bin/codex",
    "/usr/bin/codex",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const r = execSync("which codex", { encoding: "utf8" }).trim();
    if (r) return r;
  } catch { /* */ }
  return "codex"; // best effort
}

function tmux(...args: string[]): void {
  const result = spawnSync(TMUX, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`tmux ${args.join(" ")} failed`);
}

function tmuxQ(...args: string[]): string {
  const result = spawnSync(TMUX, args, { encoding: "utf8" });
  return result.stdout?.trim() ?? "";
}

function sessionExists(name: string): boolean {
  const out = tmuxQ("list-sessions", "-F", "#{session_name}");
  return out.split("\n").includes(name);
}

export function runTeamTmux(args: string[], cwd = process.cwd()): void {
  const sub = args[0];

  switch (sub) {
    case "start":
      teamStart(args.slice(1), cwd);
      break;
    case "stop":
      teamStop(args.slice(1), cwd);
      break;
    case "status":
      teamStatus(args.slice(1), cwd);
      break;
    case "attach":
      teamAttach(args.slice(1), cwd);
      break;
    case "logs":
      teamLogs(args.slice(1), cwd);
      break;
    case "worker":
      teamWorker(args.slice(1), cwd);
      break;
    default:
      console.log(`
omc team — tmux-based parallel agent coordination

Usage:
  omc team start [--workers N] [--goal "..."]   Start team session (default: 2 workers)
  omc team stop [session-id]                    Kill the tmux session
  omc team status [session-id]                  Show task progress
  omc team attach [session-id]                  Attach to the tmux session
  omc team logs <task-id>                       Show a worker's output log
  omc team worker <session-id> <worker-id>      Internal — run by worker pane
`);
  }
}

function teamStart(args: string[], cwd: string): void {
  let workers = 2;
  let goal = "Coordinate parallel work";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--workers" && args[i + 1]) workers = parseInt(args[++i], 10);
    if (args[i] === "--goal" && args[i + 1]) goal = args[++i];
  }

  // Create or load team session
  let session = loadActiveTeamSession(cwd);
  if (!session) {
    session = createTeamSession(goal, "coordinator", cwd);
    console.log(`Created team session: ${session.id}`);
  } else {
    console.log(`Using existing session: ${session.id}`);
  }

  const tmuxName = `omc-${session.id.slice(-8)}`;

  if (sessionExists(tmuxName)) {
    console.log(`Tmux session '${tmuxName}' already running. Use: omc team attach`);
    return;
  }

  // Worker script path
  const workerScript = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../scripts/team-worker.js"
  );

  const omcBin = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "./index.js"
  );

  // Create tmux session with coordinator pane
  tmux("new-session", "-d", "-s", tmuxName, "-x", "220", "-y", "50");
  tmux("rename-window", "-t", `${tmuxName}:0`, "coordinator");
  tmux("send-keys", "-t", `${tmuxName}:coordinator`,
    `echo "omc coordinator | session: ${session.id}" && echo "Goal: ${goal}"`, "Enter");

  // Spawn worker panes
  for (let i = 0; i < workers; i++) {
    const workerId = `worker-${i + 1}`;
    tmux("new-window", "-t", tmuxName, "-n", workerId);
    tmux("send-keys", "-t", `${tmuxName}:${workerId}`,
      `OMC_WORKDIR=${cwd} node ${omcBin} team worker ${session.id} ${workerId} 2>&1 | tee ${getTeamDir(cwd)}/${workerId}.log`,
      "Enter"
    );
  }

  // Switch back to coordinator
  tmux("select-window", "-t", `${tmuxName}:coordinator`);

  console.log(`\nTeam session started:`);
  console.log(`  Session ID: ${session.id}`);
  console.log(`  Tmux name:  ${tmuxName}`);
  console.log(`  Workers:    ${workers}`);
  console.log(`\nCommands:`);
  console.log(`  omc team attach              Attach to the tmux session`);
  console.log(`  omc team status              Monitor task progress`);
  console.log(`  omc team stop                Shut down all workers`);
  console.log(`\nAssign tasks from Cursor chat using the MCP tools:`);
  console.log(`  assign_task session_id="${session.id}" title="..." assigned_to="worker-1"`);
}

function teamStop(args: string[], cwd: string): void {
  const session = args[0] ? { id: args[0] } : loadActiveTeamSession(cwd);
  if (!session) { console.log("No active team session."); return; }

  const tmuxName = `omc-${session.id.slice(-8)}`;
  if (sessionExists(tmuxName)) {
    tmux("kill-session", "-t", tmuxName);
    console.log(`✓ Stopped tmux session: ${tmuxName}`);
  } else {
    console.log(`Tmux session '${tmuxName}' not found.`);
  }
}

function teamStatus(args: string[], cwd: string): void {
  const sessionId = args[0];
  const session = sessionId ? getTeamStatus(sessionId, cwd) : loadActiveTeamSession(cwd);
  if (!session) { console.log("No active team session."); return; }

  const tmuxName = `omc-${session.id.slice(-8)}`;
  const running = sessionExists(tmuxName);

  console.log(`Team: ${session.id}`);
  console.log(`Goal: ${session.goal}`);
  console.log(`Tmux: ${running ? "running (" + tmuxName + ")" : "stopped"}`);

  const tasks = session.tasks;
  if (!tasks.length) {
    console.log("\nNo tasks assigned yet.");
    console.log("Assign tasks via Cursor chat: assign_task session_id=\"" + session.id + "\" ...");
    return;
  }

  const done = tasks.filter((t) => t.status === "done").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  console.log(`\nProgress: ${done}/${tasks.length} done  |  ${inProgress} in-progress  |  ${blocked} blocked\n`);

  for (const t of tasks) {
    const icon = t.status === "done" ? "✓" : t.status === "blocked" ? "✗" : t.status === "in-progress" ? "●" : "○";
    console.log(`${icon} [${t.assigned_to}] ${t.title}`);
    if (t.result) console.log(`   Result: ${t.result.slice(0, 80)}${t.result.length > 80 ? "…" : ""}`);
    if (t.blocker) console.log(`   BLOCKED: ${t.blocker}`);
  }
}

function teamAttach(_args: string[], cwd: string): void {
  const session = loadActiveTeamSession(cwd);
  if (!session) { console.log("No active team session. Run: omc team start"); return; }

  const tmuxName = `omc-${session.id.slice(-8)}`;
  if (!sessionExists(tmuxName)) {
    console.log(`Tmux session '${tmuxName}' not found. Run: omc team start`);
    return;
  }

  // Replace current process with tmux attach
  spawnSync(TMUX, ["attach-session", "-t", tmuxName], { stdio: "inherit" });
}

function teamLogs(args: string[], cwd: string): void {
  const workerId = args[0];
  if (!workerId) { console.error("Usage: omc team logs <worker-id>"); process.exit(1); }

  const session = loadActiveTeamSession(cwd);
  if (!session) { console.log("No active team session."); return; }

  const logFile = path.join(getTeamDir(cwd), `${workerId}.log`);
  if (!fs.existsSync(logFile)) {
    console.log(`No log found for ${workerId}`);
    return;
  }
  console.log(fs.readFileSync(logFile, "utf8"));
}

function teamWorker(args: string[], cwd: string): void {
  const [sessionId, workerId] = args;
  if (!sessionId || !workerId) {
    console.error("Usage: omc team worker <session-id> <worker-id>");
    process.exit(1);
  }

  console.log(`[${workerId}] Starting — polling for tasks in session ${sessionId}`);
  console.log(`[${workerId}] AI: ${CODEX}`);
  console.log(`[${workerId}] Workdir: ${cwd}\n`);

  // Poll loop
  const poll = (): void => {
    const session = getTeamStatus(sessionId, cwd);
    if (!session) {
      console.log(`[${workerId}] Session not found: ${sessionId}`);
      process.exit(1);
    }

    // Find a pending task assigned to this worker
    const task = session.tasks.find(
      (t) => t.assigned_to === workerId && t.status === "pending"
    );

    if (!task) {
      process.stdout.write(".");
      setTimeout(poll, 3000);
      return;
    }

    console.log(`\n[${workerId}] Picked up task: ${task.id}`);
    console.log(`[${workerId}] Title: ${task.title}`);
    updateTask(sessionId, task.id, { status: "in-progress" }, cwd);

    // Write task prompt to a temp file
    const promptFile = path.join(getTeamDir(cwd), `${task.id}-prompt.md`);
    const prompt = buildTaskPrompt(task.title, task.description, session.goal);
    fs.writeFileSync(promptFile, prompt);

    console.log(`[${workerId}] Executing with codex...\n`);

    // Run codex with the task
    const result = spawnSync(
      CODEX,
      ["--approval-mode", "auto-edit", "--quiet", prompt],
      {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        encoding: "utf8",
        timeout: 5 * 60 * 1000, // 5 min timeout
        env: { ...process.env, CODEX_QUIET_MODE: "1" },
      }
    );

    const output = (result.stdout ?? "") + (result.stderr ?? "");
    const success = result.status === 0;

    // Write result log
    const resultFile = path.join(getTeamDir(cwd), `${task.id}-result.md`);
    fs.writeFileSync(resultFile, `# Task Result: ${task.id}\n\nStatus: ${success ? "done" : "blocked"}\n\n## Output\n\n${output}`);

    if (success) {
      const summary = output.slice(-300).trim() || "Task completed";
      updateTask(sessionId, task.id, { status: "done", result: summary }, cwd);
      console.log(`[${workerId}] ✓ Task done: ${task.id}`);
    } else {
      const blocker = (result.stderr ?? "").slice(-200).trim() || "Codex exited with error";
      updateTask(sessionId, task.id, { status: "blocked", blocker }, cwd);
      console.log(`[${workerId}] ✗ Task blocked: ${task.id}`);
      console.log(`[${workerId}] Reason: ${blocker}`);
    }

    // Continue polling
    setTimeout(poll, 2000);
  };

  poll();
}

function buildTaskPrompt(title: string, description: string, goal: string): string {
  return `# Team Task

You are a worker agent in a coordinated team session.

## Team Goal
${goal}

## Your Task
${title}

## Description
${description}

## Instructions
- Complete ONLY this task — do not modify files outside your scope
- When done, make sure your changes are saved
- If you encounter a blocker you cannot resolve, stop and explain the issue clearly

Execute the task now.`;
}
