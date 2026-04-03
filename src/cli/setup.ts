import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_TEMPLATES_DIR = path.resolve(__dirname, "../../rules");
const MCP_SERVER_PATH = path.resolve(__dirname, "../mcp/server.js");

export async function runSetup(cwd = process.cwd()): Promise<void> {
  console.log("omc setup — oh-my-cursor\n");

  // 1. Scaffold .cursor/rules/
  const rulesDir = path.join(cwd, ".cursor", "rules");
  fs.mkdirSync(rulesDir, { recursive: true });
  console.log(`✓ Created ${rulesDir}`);

  // Copy rule templates
  if (fs.existsSync(RULES_TEMPLATES_DIR)) {
    const templates = fs.readdirSync(RULES_TEMPLATES_DIR).filter((f) => f.endsWith(".mdc"));
    for (const template of templates) {
      const dest = path.join(rulesDir, template);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(path.join(RULES_TEMPLATES_DIR, template), dest);
        console.log(`✓ Created .cursor/rules/${template}`);
      } else {
        console.log(`  Skipped .cursor/rules/${template} (already exists)`);
      }
    }
  }

  // 2. Create .omc/ state directories
  const omcDirs = [
    path.join(cwd, ".omc", "state"),
    path.join(cwd, ".omc", "plans"),
    path.join(cwd, ".omc", "memory"),
  ];
  for (const dir of omcDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log("✓ Created .omc/ state directory");

  // 3. Add .omc/ to .gitignore
  const gitignore = path.join(cwd, ".gitignore");
  const omcEntry = ".omc/";
  if (fs.existsSync(gitignore)) {
    const content = fs.readFileSync(gitignore, "utf8");
    if (!content.includes(omcEntry)) {
      fs.appendFileSync(gitignore, `\n# oh-my-cursor state\n${omcEntry}\n`);
      console.log("✓ Added .omc/ to .gitignore");
    }
  } else {
    fs.writeFileSync(gitignore, `# oh-my-cursor state\n${omcEntry}\n`);
    console.log("✓ Created .gitignore with .omc/");
  }

  // 4. Register MCP server in Cursor settings
  registerMcpServer(cwd);

  console.log("\nSetup complete. Open this project in Cursor and start with:\n");
  console.log('  @deep-interview "clarify the task before we write code"');
  console.log('  @ralplan "approve the implementation plan"');
  console.log('  @ralph "carry the plan to completion"\n');
}

function registerMcpServer(cwd: string): void {
  // Cursor looks for MCP config in ~/.cursor/mcp.json (global) or .cursor/mcp.json (project)
  const projectMcpPath = path.join(cwd, ".cursor", "mcp.json");
  const globalMcpPath = path.join(os.homedir(), ".cursor", "mcp.json");

  const mcpEntry = {
    "oh-my-cursor": {
      command: "node",
      args: [MCP_SERVER_PATH],
      env: {
        OMC_WORKDIR: cwd,
      },
    },
  };

  // Write to project-level .cursor/mcp.json
  let existing: { mcpServers?: Record<string, unknown> } = {};
  if (fs.existsSync(projectMcpPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(projectMcpPath, "utf8"));
    } catch {
      existing = {};
    }
  }

  const merged = {
    ...existing,
    mcpServers: {
      ...(existing.mcpServers ?? {}),
      ...mcpEntry,
    },
  };

  fs.writeFileSync(projectMcpPath, JSON.stringify(merged, null, 2));
  console.log("✓ Registered MCP server in .cursor/mcp.json");
  console.log(`  Server path: ${MCP_SERVER_PATH}`);
  console.log("  Restart Cursor to activate the MCP server");
}
