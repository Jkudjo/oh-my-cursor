import fs from "fs";
import path from "path";
import { getOmcDir, ensureDirs } from "./base.js";

export function getArtifactDir(type: "specs" | "interviews" | "context" | "logs", cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), type);
}

export function ensureArtifactDirs(cwd = process.cwd()): void {
  ensureDirs(cwd);
  for (const type of ["specs", "interviews", "context", "logs"] as const) {
    fs.mkdirSync(getArtifactDir(type, cwd), { recursive: true });
  }
}

export function saveArtifact(
  type: "specs" | "interviews" | "context" | "logs",
  slug: string,
  content: string,
  cwd = process.cwd()
): string {
  ensureArtifactDirs(cwd);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${slug}-${ts}.md`;
  const filepath = path.join(getArtifactDir(type, cwd), filename);
  fs.writeFileSync(filepath, content, "utf8");
  return filepath;
}

export function loadArtifact(filepath: string): string | null {
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, "utf8");
}

export function listArtifacts(
  type: "specs" | "interviews" | "context" | "logs",
  cwd = process.cwd()
): Array<{ file: string; path: string; modified: string }> {
  const dir = getArtifactDir(type, cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({
      file: f,
      path: path.join(dir, f),
      modified: fs.statSync(path.join(dir, f)).mtime.toISOString(),
    }))
    .sort((a, b) => b.modified.localeCompare(a.modified));
}

export function latestArtifact(
  type: "specs" | "interviews" | "context" | "logs",
  slugPrefix: string,
  cwd = process.cwd()
): string | null {
  const artifacts = listArtifacts(type, cwd).filter((a) => a.file.startsWith(slugPrefix));
  if (!artifacts.length) return null;
  return loadArtifact(artifacts[0].path);
}
