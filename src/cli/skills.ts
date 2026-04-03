import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { SkillMeta } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.resolve(__dirname, "../../skills");

export function listSkills(): SkillMeta[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];

  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => fs.statSync(path.join(SKILLS_DIR, name)).isDirectory())
    .map((name) => {
      const skillFile = path.join(SKILLS_DIR, name, "SKILL.md");
      if (!fs.existsSync(skillFile)) return null;

      const content = fs.readFileSync(skillFile, "utf8");
      const descMatch = content.match(/^description:\s*(.+)$/m);
      const hintMatch = content.match(/^argument-hint:\s*(.+)$/m);

      const meta: SkillMeta = {
        name,
        description: descMatch?.[1]?.trim() ?? "",
        path: skillFile,
      };
      if (hintMatch?.[1]) meta.argumentHint = hintMatch[1].trim();
      return meta;
    })
    .filter((s): s is SkillMeta => s !== null);
}

export function readSkill(name: string): string | null {
  const skillFile = path.join(SKILLS_DIR, name, "SKILL.md");
  if (!fs.existsSync(skillFile)) return null;
  return fs.readFileSync(skillFile, "utf8");
}
