import fs from "fs";
import path from "path";
import { getOmcDir, ensureDirs, readModeState, listPlans, listMemory } from "./base.js";
import type { ModeName, ModeState, Plan, Memory } from "../types/index.js";

export interface Checkpoint {
  id: string;
  created_at: string;
  summary: string;
  active_modes: ModeState[];
  latest_plan: Plan | null;
  memories: Memory[];
  next_steps: string;
  blockers: string;
}

export interface SessionContext {
  active_modes: ModeState[];
  latest_approved_plan: Plan | null;
  key_memories: Memory[];
  last_checkpoint: Checkpoint | null;
  has_active_work: boolean;
}

const ALL_MODES: ModeName[] = ["deep-interview", "ralplan", "ralph", "autopilot"];

export function getCheckpointDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "checkpoints");
}

export function saveCheckpoint(
  summary: string,
  nextSteps: string,
  blockers: string,
  cwd = process.cwd()
): Checkpoint {
  ensureDirs(cwd);
  fs.mkdirSync(getCheckpointDir(cwd), { recursive: true });

  const activeModes = ALL_MODES
    .map((m) => readModeState(m, cwd))
    .filter((s): s is ModeState => s !== null && s.status === "active");

  const plans = listPlans(cwd);
  const latestPlan = plans.find((p) => p.approved) ?? plans[0] ?? null;
  const memories = listMemory(cwd);

  const id = `checkpoint-${Date.now()}`;
  const checkpoint: Checkpoint = {
    id,
    created_at: new Date().toISOString(),
    summary,
    active_modes: activeModes,
    latest_plan: latestPlan,
    memories,
    next_steps: nextSteps,
    blockers,
  };

  const file = path.join(getCheckpointDir(cwd), `${id}.json`);
  fs.writeFileSync(file, JSON.stringify(checkpoint, null, 2));
  return checkpoint;
}

export function loadLatestCheckpoint(cwd = process.cwd()): Checkpoint | null {
  const dir = getCheckpointDir(cwd);
  if (!fs.existsSync(dir)) return null;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), "utf8")) as Checkpoint;
}

export function loadCheckpoint(id: string, cwd = process.cwd()): Checkpoint | null {
  const file = path.join(getCheckpointDir(cwd), `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Checkpoint;
}

export function listCheckpoints(cwd = process.cwd()): Checkpoint[] {
  const dir = getCheckpointDir(cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Checkpoint)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getSessionContext(cwd = process.cwd()): SessionContext {
  const activeModes = ALL_MODES
    .map((m) => readModeState(m, cwd))
    .filter((s): s is ModeState => s !== null && s.status === "active");

  const plans = listPlans(cwd);
  const latestApprovedPlan = plans.find((p) => p.approved) ?? null;
  const keyMemories = listMemory(cwd);
  const lastCheckpoint = loadLatestCheckpoint(cwd);

  return {
    active_modes: activeModes,
    latest_approved_plan: latestApprovedPlan,
    key_memories: keyMemories,
    last_checkpoint: lastCheckpoint,
    has_active_work: activeModes.length > 0 || latestApprovedPlan !== null,
  };
}
