import fs from "fs";
import path from "path";
import { getOmcDir, ensureDirs } from "./base.js";

export type TaskStatus = "pending" | "in-progress" | "done" | "blocked";

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  result?: string;
  blocker?: string;
}

export interface TeamSession {
  id: string;
  goal: string;
  coordinator: string;
  created_at: string;
  tasks: TeamTask[];
}

export function getTeamDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "team");
}

export function getTeamSessionFile(sessionId: string, cwd = process.cwd()): string {
  return path.join(getTeamDir(cwd), `${sessionId}.json`);
}

export function createTeamSession(goal: string, coordinator: string, cwd = process.cwd()): TeamSession {
  ensureDirs(cwd);
  fs.mkdirSync(getTeamDir(cwd), { recursive: true });

  const session: TeamSession = {
    id: `team-${Date.now()}`,
    goal,
    coordinator,
    created_at: new Date().toISOString(),
    tasks: [],
  };
  fs.writeFileSync(getTeamSessionFile(session.id, cwd), JSON.stringify(session, null, 2));
  return session;
}

export function loadActiveTeamSession(cwd = process.cwd()): TeamSession | null {
  const dir = getTeamDir(cwd);
  if (!fs.existsSync(dir)) return null;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  if (!files.length) return null;
  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), "utf8")) as TeamSession;
}

export function assignTask(
  sessionId: string,
  title: string,
  description: string,
  assignedTo: string,
  cwd = process.cwd()
): TeamTask {
  const file = getTeamSessionFile(sessionId, cwd);
  if (!fs.existsSync(file)) throw new Error(`Team session not found: ${sessionId}`);

  const session = JSON.parse(fs.readFileSync(file, "utf8")) as TeamSession;
  const task: TeamTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    assigned_to: assignedTo,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  session.tasks.push(task);
  fs.writeFileSync(file, JSON.stringify(session, null, 2));
  return task;
}

export function updateTask(
  sessionId: string,
  taskId: string,
  patch: Partial<Pick<TeamTask, "status" | "result" | "blocker">>,
  cwd = process.cwd()
): TeamTask {
  const file = getTeamSessionFile(sessionId, cwd);
  if (!fs.existsSync(file)) throw new Error(`Team session not found: ${sessionId}`);

  const session = JSON.parse(fs.readFileSync(file, "utf8")) as TeamSession;
  const task = session.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);

  Object.assign(task, patch, { updated_at: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(session, null, 2));
  return task;
}

export function getTeamStatus(sessionId: string, cwd = process.cwd()): TeamSession | null {
  const file = getTeamSessionFile(sessionId, cwd);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as TeamSession;
}
