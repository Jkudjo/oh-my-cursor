import fs from "fs";
import path from "path";
import { listMemory, getMemory, setMemory, getMemoryDir } from "../state/base.js";

export function runMemory(args: string[], cwd = process.cwd()): void {
  const sub = args[0];

  switch (sub) {
    case "list":
    case undefined: {
      const entries = listMemory(cwd);
      if (!entries.length) {
        console.log("No memory entries.");
        return;
      }
      for (const m of entries) {
        console.log(`[${m.key}]  (updated: ${m.updated_at})`);
        console.log(m.value);
        console.log();
      }
      break;
    }

    case "get": {
      const key = args[1];
      if (!key) { console.error("Usage: omc memory get <key>"); process.exit(1); }
      const val = getMemory(key, cwd);
      if (val === null) { console.error(`No memory for key: ${key}`); process.exit(1); }
      console.log(val);
      break;
    }

    case "set": {
      const key = args[1];
      const value = args.slice(2).join(" ");
      if (!key || !value) { console.error("Usage: omc memory set <key> <value>"); process.exit(1); }
      setMemory(key, value, cwd);
      console.log(`✓ Memory set: ${key}`);
      break;
    }

    case "del":
    case "delete": {
      const key = args[1];
      if (!key) { console.error("Usage: omc memory del <key>"); process.exit(1); }
      const file = path.join(getMemoryDir(cwd), `${key}.json`);
      if (!fs.existsSync(file)) { console.error(`No memory for key: ${key}`); process.exit(1); }
      fs.unlinkSync(file);
      console.log(`✓ Deleted memory: ${key}`);
      break;
    }

    default:
      console.error(`Unknown memory subcommand: ${sub}`);
      console.log("Usage: omc memory [list|get <key>|set <key> <value>|del <key>]");
      process.exit(1);
  }
}
