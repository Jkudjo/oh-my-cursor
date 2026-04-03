import { readModeState, cancelMode } from "../state/base.js";
import type { ModeName } from "../types/index.js";

const ALL_MODES: ModeName[] = ["deep-interview", "ralplan", "ralph", "autopilot"];

export function runCancel(args: string[], cwd = process.cwd()): void {
  const target = args[0];

  if (!target) {
    console.error("Usage: omc cancel <mode|all>");
    console.error(`Modes: ${ALL_MODES.join(", ")}`);
    process.exit(1);
  }

  const modes: ModeName[] = target === "all" ? ALL_MODES : [target as ModeName];

  let cancelled = 0;
  for (const mode of modes) {
    const state = readModeState(mode, cwd);
    if (!state || state.status !== "active") {
      if (target !== "all") console.log(`  ${mode}: not active`);
      continue;
    }
    cancelMode(mode, cwd);
    console.log(`✓ Cancelled: ${mode} (was: phase=${state.phase ?? "?"})`);
    cancelled++;
  }

  if (cancelled === 0) console.log("No active modes to cancel.");
}
