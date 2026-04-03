import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_TEMPLATES_DIR = path.resolve(__dirname, "../../rules");

export function runUpdate(cwd = process.cwd()): void {
  console.log("omc update — refreshing .cursor/rules/\n");

  const rulesDir = path.join(cwd, ".cursor", "rules");
  if (!fs.existsSync(rulesDir)) {
    console.error("No .cursor/rules/ found. Run `omc setup` first.");
    process.exit(1);
  }

  if (!fs.existsSync(RULES_TEMPLATES_DIR)) {
    console.error("No rule templates found in omc installation.");
    process.exit(1);
  }

  const templates = fs.readdirSync(RULES_TEMPLATES_DIR).filter((f) => f.endsWith(".mdc"));
  let updated = 0;
  let skipped = 0;

  for (const template of templates) {
    const src = path.join(RULES_TEMPLATES_DIR, template);
    const dest = path.join(rulesDir, template);

    const srcContent = fs.readFileSync(src, "utf8");
    const destContent = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : null;

    if (srcContent === destContent) {
      console.log(`  = .cursor/rules/${template} (unchanged)`);
      skipped++;
    } else {
      fs.copyFileSync(src, dest);
      console.log(`✓ Updated .cursor/rules/${template}`);
      updated++;
    }
  }

  console.log(`\n${updated} updated, ${skipped} unchanged`);
  if (updated > 0) {
    console.log("Reload Cursor for rule changes to take effect.");
  }
}
