#!/usr/bin/env node
import { runSetup } from "./setup.js";
import { runDoctor } from "./doctor.js";
import { runStatus } from "./status.js";
import { runPlan } from "./plan.js";
import { runMemory } from "./memory.js";
import { runUpdate } from "./update.js";
import { runCancel } from "./cancel.js";
import { runTeamTmux } from "./team-tmux.js";
import { listSkills, readSkill } from "./skills.js";

const args = process.argv.slice(2);
const command = args[0];

function printHelp(): void {
  console.log(`
oh-my-cursor (omc) v0.1.0 — workflow layer for Cursor

Usage:
  omc setup                     Scaffold .cursor/rules/ and register MCP server
  omc update                    Refresh .cursor/rules/ from latest templates
  omc doctor                    Health check — verify installation
  omc status                    Show active modes, plans, and memory
  omc plan [list|show|approve]  Manage saved plans
  omc memory [list|get|set|del] Manage persistent memory
  omc team <start|stop|status|attach|logs>  Tmux-based parallel agent coordination
  omc cancel <mode|all>         Cancel an active workflow mode
  omc skills                    List available skills
  omc skill <name>              Show a skill's prompt
  omc version                   Print version
  omc help                      Show this help

Workflow (inside Cursor chat):
  @deep-interview "clarify the task"      Clarify scope before coding
  @ralplan "approve the plan"             Generate + approve an implementation plan
  @ralph "carry the plan to completion"   Persistent completion loop
  @autopilot "build the feature"          Fully autonomous execution
  @review "review before merging"         Code review checklist
  @qa "test the feature"                  QA testing pass
  @explore "understand the codebase"      Read-only codebase exploration
`);
}

switch (command) {
  case "setup":
    await runSetup(process.cwd());
    break;

  case "update":
    runUpdate(process.cwd());
    break;

  case "doctor":
    runDoctor(process.cwd());
    break;

  case "status":
    runStatus(process.cwd());
    break;

  case "plan":
    runPlan(args.slice(1), process.cwd());
    break;

  case "memory":
    runMemory(args.slice(1), process.cwd());
    break;

  case "team":
    runTeamTmux(args.slice(1), process.cwd());
    break;

  case "cancel":
    runCancel(args.slice(1), process.cwd());
    break;

  case "skills":
  case "skill": {
    if (command === "skill" && args[1]) {
      const content = readSkill(args[1]);
      if (!content) {
        console.error(`Skill not found: ${args[1]}`);
        process.exit(1);
      }
      console.log(content);
    } else {
      const skills = listSkills();
      if (!skills.length) {
        console.log("No skills found.");
      } else {
        for (const s of skills) {
          console.log(`  @${s.name.padEnd(20)} ${s.description}`);
        }
      }
    }
    break;
  }

  case "version":
  case "--version":
  case "-v":
    console.log("oh-my-cursor v0.1.0");
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    printHelp();
    break;

  default:
    console.error(`Unknown command: ${command}\n`);
    printHelp();
    process.exit(1);
}
