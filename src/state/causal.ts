import fs from "fs";
import path from "path";
import { getOmcDir, ensureDirs } from "./base.js";

export interface CausalNode {
  label: string;
  type: "symptom" | "cause" | "root";
  evidence?: string;
}

export interface CausalChain {
  id: string;
  slug: string;
  created_at: string;
  nodes: CausalNode[];  // ordered from symptom → root
  resolved: boolean;
  fix_applied?: string;
}

export function getCausalDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "causal");
}

export function saveCausalChain(
  slug: string,
  nodes: CausalNode[],
  fixApplied?: string,
  cwd = process.cwd()
): CausalChain {
  ensureDirs(cwd);
  fs.mkdirSync(getCausalDir(cwd), { recursive: true });

  const chain: CausalChain = {
    id: `causal-${Date.now()}`,
    slug,
    created_at: new Date().toISOString(),
    nodes,
    resolved: !!fixApplied,
    fix_applied: fixApplied,
  };

  fs.writeFileSync(
    path.join(getCausalDir(cwd), `${chain.id}.json`),
    JSON.stringify(chain, null, 2)
  );
  return chain;
}

export function listCausalChains(cwd = process.cwd()): CausalChain[] {
  const dir = getCausalDir(cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as CausalChain)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function formatCausalChain(chain: CausalChain): string {
  return chain.nodes
    .map((n, i) => {
      const indent = "  ".repeat(i);
      const arrow = i === 0 ? "" : "↓ caused by: ";
      const tag = n.type === "root" ? " [ROOT CAUSE]" : "";
      const evidence = n.evidence ? `\n${indent}  Evidence: ${n.evidence}` : "";
      return `${indent}${arrow}${n.label}${tag}${evidence}`;
    })
    .join("\n");
}
