import { readModeState, listPlans, listMemory } from "../state/base.js";
import type { ModeName } from "../types/index.js";

const ALL_MODES: ModeName[] = ["deep-interview", "ralplan", "ralph", "autopilot"];

export function runStatus(cwd = process.cwd()): void {
  console.log("omc status\n");

  // Active modes
  console.log("Modes:");
  let anyActive = false;
  for (const mode of ALL_MODES) {
    const state = readModeState(mode, cwd);
    if (!state) continue;
    const icon = state.status === "active" ? "●" : state.status === "completed" ? "✓" : "○";
    const phase = state.phase ? ` [${state.phase}]` : "";
    const task = state.task ? `  "${state.task}"` : "";
    console.log(`  ${icon} ${mode.padEnd(16)} ${state.status}${phase}${task}`);
    if (state.status === "active") anyActive = true;
  }
  if (!anyActive) console.log("  No active modes");

  // Plans
  const plans = listPlans(cwd);
  console.log(`\nPlans: (${plans.length} total)`);
  if (plans.length) {
    for (const p of plans.slice(0, 5)) {
      const approved = p.approved ? "✓" : "○";
      console.log(`  ${approved} ${p.id}  ${p.title}`);
    }
    if (plans.length > 5) console.log(`  ... and ${plans.length - 5} more`);
  } else {
    console.log("  No plans saved");
  }

  // Memory
  const memories = listMemory(cwd);
  console.log(`\nMemory: (${memories.length} entries)`);
  if (memories.length) {
    for (const m of memories) {
      const preview = m.value.slice(0, 60).replace(/\n/g, " ");
      console.log(`  [${m.key}]  ${preview}${m.value.length > 60 ? "…" : ""}`);
    }
  } else {
    console.log("  No memory entries");
  }
}
