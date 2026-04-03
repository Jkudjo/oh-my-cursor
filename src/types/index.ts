export type ModeStatus = "active" | "idle" | "completed" | "cancelled";

export type ModeName =
  | "deep-interview"
  | "ralplan"
  | "ralph"
  | "autopilot"
  | "idle";

export interface ModeState {
  mode: ModeName;
  status: ModeStatus;
  task?: string;
  iteration: number;
  phase?: string;
  started_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Plan {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  approved: boolean;
}

export interface Memory {
  key: string;
  value: string;
  updated_at: string;
}

export interface SkillMeta {
  name: string;
  description: string;
  argumentHint?: string;
  path: string;
}

export interface OmcConfig {
  version: string;
  projectName?: string;
  mcpServerPath: string;
}
