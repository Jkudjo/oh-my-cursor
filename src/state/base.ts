import fs from "fs";
import path from "path";
import type { ModeState, ModeName, Plan, Memory } from "../types/index.js";

export function getOmcDir(cwd = process.cwd()): string {
  return path.join(cwd, ".omc");
}

export function getStateDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "state");
}

export function getPlansDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "plans");
}

export function getMemoryDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "memory");
}

export function ensureDirs(cwd = process.cwd()): void {
  for (const dir of [
    getStateDir(cwd),
    getPlansDir(cwd),
    getMemoryDir(cwd),
  ]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readModeState(
  mode: ModeName,
  cwd = process.cwd()
): ModeState | null {
  const file = path.join(getStateDir(cwd), `${mode}-state.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as ModeState;
}

export function writeModeState(
  state: ModeState,
  cwd = process.cwd()
): void {
  ensureDirs(cwd);
  const file = path.join(getStateDir(cwd), `${state.mode}-state.json`);
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

export function startMode(
  mode: ModeName,
  task: string,
  cwd = process.cwd()
): ModeState {
  const now = new Date().toISOString();
  const state: ModeState = {
    mode,
    status: "active",
    task,
    iteration: 0,
    phase: "start",
    started_at: now,
    updated_at: now,
  };
  writeModeState(state, cwd);
  return state;
}

export function updateModeState(
  mode: ModeName,
  patch: Partial<ModeState>,
  cwd = process.cwd()
): ModeState {
  const existing = readModeState(mode, cwd);
  const updated: ModeState = {
    ...(existing ?? {
      mode,
      status: "active",
      iteration: 0,
      started_at: new Date().toISOString(),
    }),
    ...patch,
    mode,
    updated_at: new Date().toISOString(),
  } as ModeState;
  writeModeState(updated, cwd);
  return updated;
}

export function cancelMode(mode: ModeName, cwd = process.cwd()): void {
  updateModeState(mode, { status: "cancelled", completed_at: new Date().toISOString() }, cwd);
}

// Plans
export function savePlan(plan: Omit<Plan, "id" | "created_at" | "updated_at">, cwd = process.cwd()): Plan {
  ensureDirs(cwd);
  const id = `plan-${Date.now()}`;
  const now = new Date().toISOString();
  const full: Plan = { ...plan, id, created_at: now, updated_at: now };
  fs.writeFileSync(path.join(getPlansDir(cwd), `${id}.json`), JSON.stringify(full, null, 2));
  return full;
}

export function loadPlan(id: string, cwd = process.cwd()): Plan | null {
  const file = path.join(getPlansDir(cwd), `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Plan;
}

export function listPlans(cwd = process.cwd()): Plan[] {
  const dir = getPlansDir(cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Plan)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Memory
export function setMemory(key: string, value: string, cwd = process.cwd()): void {
  ensureDirs(cwd);
  const mem: Memory = { key, value, updated_at: new Date().toISOString() };
  fs.writeFileSync(path.join(getMemoryDir(cwd), `${key}.json`), JSON.stringify(mem, null, 2));
}

export function getMemory(key: string, cwd = process.cwd()): string | null {
  const file = path.join(getMemoryDir(cwd), `${key}.json`);
  if (!fs.existsSync(file)) return null;
  return (JSON.parse(fs.readFileSync(file, "utf8")) as Memory).value;
}

export function listMemory(cwd = process.cwd()): Memory[] {
  const dir = getMemoryDir(cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Memory);
}
