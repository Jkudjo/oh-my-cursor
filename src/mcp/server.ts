#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  startMode,
  updateModeState,
  readModeState,
  cancelMode,
  savePlan,
  loadPlan,
  listPlans,
  setMemory,
  getMemory,
  listMemory,
} from "../state/base.js";
import {
  saveArtifact,
  loadArtifact,
  listArtifacts,
  latestArtifact,
} from "../state/artifacts.js";
import {
  saveCheckpoint,
  loadLatestCheckpoint,
  loadCheckpoint,
  listCheckpoints,
  getSessionContext,
} from "../state/session.js";
import {
  createTeamSession,
  loadActiveTeamSession,
  assignTask,
  updateTask,
  getTeamStatus,
} from "../state/team.js";
import {
  saveCausalChain,
  listCausalChains,
  formatCausalChain,
} from "../state/causal.js";
import {
  saveSessionScore,
  listSessionScores,
  formatScore,
  getScoreTrend,
} from "../state/scoring.js";
import type { ModeName } from "../types/index.js";
import { listSkills } from "../cli/skills.js";

const cwd = process.env.OMC_WORKDIR ?? process.cwd();

const server = new McpServer({
  name: "oh-my-cursor",
  version: "0.1.0",
});

// ── Mode state tools ──────────────────────────────────────────────────────────

server.tool(
  "start_mode",
  "Start a workflow mode (deep-interview, ralplan, ralph, autopilot)",
  {
    mode: z.enum(["deep-interview", "ralplan", "ralph", "autopilot"]),
    task: z.string().describe("The task or goal for this mode"),
  },
  async ({ mode, task }) => {
    const state = startMode(mode as ModeName, task, cwd);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
    };
  }
);

server.tool(
  "get_mode_state",
  "Get the current state of a workflow mode",
  {
    mode: z.enum(["deep-interview", "ralplan", "ralph", "autopilot", "idle"]),
  },
  async ({ mode }) => {
    const state = readModeState(mode as ModeName, cwd);
    return {
      content: [
        {
          type: "text",
          text: state ? JSON.stringify(state, null, 2) : "No active state for this mode",
        },
      ],
    };
  }
);

server.tool(
  "update_mode_state",
  "Update the state of an active workflow mode",
  {
    mode: z.enum(["deep-interview", "ralplan", "ralph", "autopilot"]),
    phase: z.string().optional(),
    iteration: z.number().optional(),
    status: z.enum(["active", "idle", "completed", "cancelled"]).optional(),
  },
  async ({ mode, phase, iteration, status }) => {
    const state = updateModeState(mode as ModeName, { phase, iteration, status }, cwd);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }],
    };
  }
);

server.tool(
  "cancel_mode",
  "Cancel an active workflow mode",
  { mode: z.enum(["deep-interview", "ralplan", "ralph", "autopilot"]) },
  async ({ mode }) => {
    cancelMode(mode as ModeName, cwd);
    return { content: [{ type: "text", text: `Mode '${mode}' cancelled.` }] };
  }
);

// ── Plan tools ────────────────────────────────────────────────────────────────

server.tool(
  "save_plan",
  "Save an implementation plan",
  {
    title: z.string(),
    content: z.string().describe("Full plan in markdown"),
    approved: z.boolean().default(false),
  },
  async ({ title, content, approved }) => {
    const plan = savePlan({ title, content, approved }, cwd);
    return {
      content: [{ type: "text", text: `Plan saved: ${plan.id}\n\n${JSON.stringify(plan, null, 2)}` }],
    };
  }
);

server.tool(
  "load_plan",
  "Load a saved plan by ID",
  { id: z.string() },
  async ({ id }) => {
    const plan = loadPlan(id, cwd);
    return {
      content: [
        {
          type: "text",
          text: plan ? JSON.stringify(plan, null, 2) : `No plan found with id: ${id}`,
        },
      ],
    };
  }
);

server.tool(
  "list_plans",
  "List all saved plans",
  {},
  async () => {
    const plans = listPlans(cwd);
    if (!plans.length) {
      return { content: [{ type: "text", text: "No plans saved yet." }] };
    }
    const summary = plans
      .map((p) => `${p.id} | ${p.approved ? "✓" : "○"} | ${p.title} | ${p.created_at}`)
      .join("\n");
    return { content: [{ type: "text", text: summary }] };
  }
);

// ── Memory tools ──────────────────────────────────────────────────────────────

server.tool(
  "set_memory",
  "Persist a key-value memory entry across sessions",
  {
    key: z.string().describe("Memory key (e.g. 'project-context', 'auth-decision')"),
    value: z.string().describe("Value to store"),
  },
  async ({ key, value }) => {
    setMemory(key, value, cwd);
    return { content: [{ type: "text", text: `Memory set: ${key}` }] };
  }
);

server.tool(
  "get_memory",
  "Retrieve a memory entry by key",
  { key: z.string() },
  async ({ key }) => {
    const value = getMemory(key, cwd);
    return {
      content: [
        { type: "text", text: value ?? `No memory found for key: ${key}` },
      ],
    };
  }
);

server.tool(
  "list_memory",
  "List all memory keys and their values",
  {},
  async () => {
    const entries = listMemory(cwd);
    if (!entries.length) {
      return { content: [{ type: "text", text: "No memory entries yet." }] };
    }
    const text = entries.map((m) => `[${m.key}] ${m.value}`).join("\n\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── Skills tool ───────────────────────────────────────────────────────────────

server.tool(
  "list_skills",
  "List all available omc skills with their descriptions",
  {},
  async () => {
    const skills = listSkills();
    if (!skills.length) {
      return { content: [{ type: "text", text: "No skills found." }] };
    }
    const text = skills
      .map((s) => `**${s.name}**\n  ${s.description}${s.argumentHint ? `\n  Usage: @${s.name} ${s.argumentHint}` : ""}`)
      .join("\n\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── Artifact tools ───────────────────────────────────────────────────────────

server.tool(
  "save_artifact",
  "Save a spec, interview transcript, context snapshot, or log to .omc/",
  {
    type: z.enum(["specs", "interviews", "context", "logs"]),
    slug: z.string().describe("Short identifier e.g. 'deep-interview-auth', 'plan-api-refactor'"),
    content: z.string().describe("Full markdown content to save"),
  },
  async ({ type, slug, content }) => {
    const filepath = saveArtifact(type, slug, content, cwd);
    return { content: [{ type: "text", text: `Artifact saved: ${filepath}` }] };
  }
);

server.tool(
  "load_artifact",
  "Load an artifact by its full file path",
  { filepath: z.string() },
  async ({ filepath }) => {
    const content = loadArtifact(filepath);
    return {
      content: [{ type: "text", text: content ?? `Artifact not found: ${filepath}` }],
    };
  }
);

server.tool(
  "list_artifacts",
  "List saved artifacts of a given type",
  { type: z.enum(["specs", "interviews", "context", "logs"]) },
  async ({ type }) => {
    const artifacts = listArtifacts(type, cwd);
    if (!artifacts.length) return { content: [{ type: "text", text: `No ${type} artifacts.` }] };
    const text = artifacts.map((a) => `${a.file}  (${a.modified})`).join("\n");
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "latest_artifact",
  "Load the most recent artifact matching a slug prefix",
  {
    type: z.enum(["specs", "interviews", "context", "logs"]),
    slug_prefix: z.string().describe("e.g. 'deep-interview-auth' to find the latest for that task"),
  },
  async ({ type, slug_prefix }) => {
    const content = latestArtifact(type, slug_prefix, cwd);
    return {
      content: [{ type: "text", text: content ?? `No artifact found with prefix: ${slug_prefix}` }],
    };
  }
);

// ── Session continuity tools ─────────────────────────────────────────────────

server.tool(
  "get_session_context",
  "Get full session context: active modes, latest plan, memories, last checkpoint. Call this at the START of every session.",
  {},
  async () => {
    const ctx = getSessionContext(cwd);
    const lines: string[] = [];

    if (ctx.has_active_work) {
      lines.push("## Active session detected\n");
    } else {
      lines.push("## No active session — starting fresh\n");
    }

    if (ctx.active_modes.length) {
      lines.push("### Active modes");
      for (const m of ctx.active_modes) {
        lines.push(`- **${m.mode}** | phase: ${m.phase ?? "?"} | iteration: ${m.iteration} | task: "${m.task ?? ""}"`);
      }
      lines.push("");
    }

    if (ctx.latest_approved_plan) {
      lines.push(`### Latest approved plan`);
      lines.push(`ID: ${ctx.latest_approved_plan.id}`);
      lines.push(`Title: ${ctx.latest_approved_plan.title}`);
      lines.push(`Created: ${ctx.latest_approved_plan.created_at}`);
      lines.push(`\n${ctx.latest_approved_plan.content.slice(0, 500)}${ctx.latest_approved_plan.content.length > 500 ? "\n...(truncated)" : ""}`);
      lines.push("");
    }

    if (ctx.key_memories.length) {
      lines.push("### Key memories");
      for (const m of ctx.key_memories) {
        lines.push(`- [${m.key}] ${m.value.slice(0, 100)}${m.value.length > 100 ? "…" : ""}`);
      }
      lines.push("");
    }

    if (ctx.last_checkpoint) {
      const cp = ctx.last_checkpoint;
      lines.push(`### Last checkpoint (${cp.created_at})`);
      lines.push(`Summary: ${cp.summary}`);
      lines.push(`Next steps: ${cp.next_steps}`);
      if (cp.blockers) lines.push(`Blockers: ${cp.blockers}`);
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

server.tool(
  "save_checkpoint",
  "Save a session checkpoint — what was done, what's next, any blockers. Call before ending a session.",
  {
    summary: z.string().describe("What was accomplished in this session"),
    next_steps: z.string().describe("What should happen next session"),
    blockers: z.string().default("").describe("Any blockers or unresolved issues"),
  },
  async ({ summary, next_steps, blockers }) => {
    const cp = saveCheckpoint(summary, next_steps, blockers, cwd);
    return {
      content: [{ type: "text", text: `Checkpoint saved: ${cp.id}\n\nSummary: ${cp.summary}\nNext: ${cp.next_steps}` }],
    };
  }
);

server.tool(
  "load_checkpoint",
  "Load a specific checkpoint by ID, or the latest if no ID given",
  { id: z.string().optional() },
  async ({ id }) => {
    const cp = id ? loadCheckpoint(id, cwd) : loadLatestCheckpoint(cwd);
    if (!cp) return { content: [{ type: "text", text: "No checkpoint found." }] };
    return { content: [{ type: "text", text: JSON.stringify(cp, null, 2) }] };
  }
);

server.tool(
  "list_checkpoints",
  "List all saved checkpoints",
  {},
  async () => {
    const cps = listCheckpoints(cwd);
    if (!cps.length) return { content: [{ type: "text", text: "No checkpoints saved." }] };
    const text = cps
      .map((c) => `${c.id}  ${c.created_at}\n  Summary: ${c.summary}\n  Next: ${c.next_steps}`)
      .join("\n\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── Team coordination tools ───────────────────────────────────────────────────

server.tool(
  "create_team_session",
  "Start a team coordination session with a shared goal",
  {
    goal: z.string().describe("The overall goal for the team session"),
    coordinator: z.string().describe("Name/role of the coordinator (e.g. 'architect', 'lead')"),
  },
  async ({ goal, coordinator }) => {
    const session = createTeamSession(goal, coordinator, cwd);
    return { content: [{ type: "text", text: `Team session created: ${session.id}\nGoal: ${goal}` }] };
  }
);

server.tool(
  "assign_task",
  "Assign a task to a worker in the active team session",
  {
    session_id: z.string().describe("Team session ID (from create_team_session or get_team_status)"),
    title: z.string(),
    description: z.string().describe("Full task description with acceptance criteria"),
    assigned_to: z.string().describe("Worker role e.g. 'implementer-1', 'reviewer', 'tester'"),
  },
  async ({ session_id, title, description, assigned_to }) => {
    const task = assignTask(session_id, title, description, assigned_to, cwd);
    return { content: [{ type: "text", text: `Task assigned: ${task.id}\nTo: ${assigned_to}\n${title}` }] };
  }
);

server.tool(
  "update_task",
  "Update a task's status, result, or blocker",
  {
    session_id: z.string(),
    task_id: z.string(),
    status: z.enum(["pending", "in-progress", "done", "blocked"]).optional(),
    result: z.string().optional().describe("Summary of what was done"),
    blocker: z.string().optional().describe("Description of what is blocking"),
  },
  async ({ session_id, task_id, status, result, blocker }) => {
    const task = updateTask(session_id, task_id, { status, result, blocker }, cwd);
    return { content: [{ type: "text", text: `Task updated: ${task.id} → ${task.status}` }] };
  }
);

server.tool(
  "get_team_status",
  "Get the current status of the active team session and all tasks",
  { session_id: z.string().optional() },
  async ({ session_id }) => {
    const session = session_id ? getTeamStatus(session_id, cwd) : loadActiveTeamSession(cwd);
    if (!session) return { content: [{ type: "text", text: "No active team session." }] };

    const taskLines = session.tasks.map((t) => {
      const icon = t.status === "done" ? "✓" : t.status === "blocked" ? "✗" : t.status === "in-progress" ? "●" : "○";
      return `${icon} [${t.id}] ${t.title} → ${t.assigned_to} (${t.status})${t.blocker ? `\n   BLOCKED: ${t.blocker}` : ""}${t.result ? `\n   Result: ${t.result}` : ""}`;
    }).join("\n");

    const done = session.tasks.filter((t) => t.status === "done").length;
    const text = `Team: ${session.id}\nGoal: ${session.goal}\nProgress: ${done}/${session.tasks.length}\n\n${taskLines || "No tasks assigned yet."}`;
    return { content: [{ type: "text", text }] };
  }
);

// ── Causal chain tools ────────────────────────────────────────────────────────

server.tool(
  "save_causal_chain",
  "Save a causal chain from symptom to root cause for institutional memory",
  {
    slug: z.string().describe("Short identifier e.g. 'checkout-503-pool-exhaustion'"),
    nodes: z.array(z.object({
      label: z.string(),
      type: z.enum(["symptom", "cause", "root"]),
      evidence: z.string().optional(),
    })).describe("Ordered list from symptom → intermediate causes → root cause"),
    fix_applied: z.string().optional().describe("Description of the fix that resolved this chain"),
  },
  async ({ slug, nodes, fix_applied }) => {
    const chain = saveCausalChain(slug, nodes, fix_applied, cwd);
    return {
      content: [{ type: "text", text: `Causal chain saved: ${chain.id}\n\n${formatCausalChain(chain)}` }],
    };
  }
);

server.tool(
  "list_causal_chains",
  "List all saved causal chains — institutional memory for debugging patterns",
  {},
  async () => {
    const chains = listCausalChains(cwd);
    if (!chains.length) return { content: [{ type: "text", text: "No causal chains saved yet." }] };
    const text = chains
      .map((c) => `${c.id}  ${c.slug}  (${c.resolved ? "resolved" : "open"})  ${c.created_at}`)
      .join("\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── Session scoring tools ─────────────────────────────────────────────────────

server.tool(
  "save_session_score",
  "Record a quality score for this session — tracks reasoning, safety, and truthfulness over time",
  {
    task: z.string().describe("What was accomplished this session"),
    truthfulness: z.number().min(1).max(5).describe("1=invented facts, 5=explicit facts/inferences/unknowns"),
    diagnostic_quality: z.number().min(1).max(5).describe("1=tunneled immediately, 5=full hypothesis tree"),
    safety: z.number().min(1).max(5).describe("1=destructive without asking, 5=blast radius + rollback always"),
    context_discipline: z.number().min(1).max(5).describe("1=trusted docs over code, 5=live code priority"),
    plan_quality: z.number().min(1).max(5).describe("1=vague, 5=specific sequenced scoped"),
    verification: z.number().min(1).max(5).describe("1=no success criteria, 5=exact metric defined"),
    resilience: z.number().min(1).max(5).describe("1=forced evidence to fit theory, 5=updated theory on contradiction"),
    notes: z.string().default(""),
  },
  async ({ task, notes, ...scores }) => {
    const score = saveSessionScore(task, scores, notes, cwd);
    return { content: [{ type: "text", text: formatScore(score) }] };
  }
);

server.tool(
  "get_score_trend",
  "Get scoring trend across recent sessions — see where reasoning quality is improving or degrading",
  {},
  async () => {
    const trend = getScoreTrend(cwd);
    return { content: [{ type: "text", text: trend }] };
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
