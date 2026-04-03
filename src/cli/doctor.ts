import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { listSkills } from "./skills.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runDoctor(cwd = process.cwd()): void {
  console.log("omc doctor — oh-my-cursor health check\n");

  const checks: Array<{ label: string; ok: boolean; hint?: string }> = [];

  // .cursor/rules/ exists
  const rulesDir = path.join(cwd, ".cursor", "rules");
  checks.push({
    label: ".cursor/rules/ directory",
    ok: fs.existsSync(rulesDir),
    hint: "Run `omc setup` to create it",
  });

  // Core rule files
  const requiredRules = [
    "00-workflow.mdc",
    "deep-interview.mdc",
    "ralplan.mdc",
    "ralph.mdc",
    "review.mdc",
    "qa.mdc",
    "explore.mdc",
    "security-review.mdc",
    "tdd.mdc",
    "analyze.mdc",
    "git-master.mdc",
    "checkpoint.mdc",
    "resume.mdc",
    "team.mdc",
    "pipeline.mdc",
    "ultrawork.mdc",
  ];
  for (const rule of requiredRules) {
    const exists = fs.existsSync(path.join(rulesDir, rule));
    checks.push({
      label: `.cursor/rules/${rule}`,
      ok: exists,
      hint: "Run `omc setup` to install rule templates",
    });
  }

  // MCP server registered
  const mcpPath = path.join(cwd, ".cursor", "mcp.json");
  let mcpOk = false;
  if (fs.existsSync(mcpPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
      mcpOk = !!config?.mcpServers?.["oh-my-cursor"];
    } catch {
      mcpOk = false;
    }
  }
  checks.push({
    label: "MCP server registered in .cursor/mcp.json",
    ok: mcpOk,
    hint: "Run `omc setup` to register",
  });

  // MCP server file exists
  const serverPath = path.resolve(__dirname, "../mcp/server.js");
  checks.push({
    label: "MCP server built (dist/mcp/server.js)",
    ok: fs.existsSync(serverPath),
    hint: "Run `npm run build` in the oh-my-cursor directory",
  });

  // .omc/ state dir
  checks.push({
    label: ".omc/ state directory",
    ok: fs.existsSync(path.join(cwd, ".omc")),
    hint: "Run `omc setup` to create it",
  });

  // Skills available
  const skills = listSkills();
  checks.push({
    label: `Skills available (${skills.length} found)`,
    ok: skills.length > 0,
    hint: "Reinstall oh-my-cursor package",
  });

  // Print results
  for (const check of checks) {
    const icon = check.ok ? "✓" : "✗";
    const msg = check.ok ? check.label : `${check.label} — ${check.hint ?? ""}`;
    console.log(`${icon} ${msg}`);
  }

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
  if (failed > 0) {
    console.log('Run `omc setup` to fix most issues.');
    process.exit(1);
  }
}
