import fs from "fs";
import path from "path";
import { getOmcDir, ensureDirs } from "./base.js";

export interface SessionScore {
  id: string;
  session_date: string;
  task: string;
  scores: {
    truthfulness: number;      // 1-5: admitted uncertainty, labelled facts vs inferences
    diagnostic_quality: number; // 1-5: hypothesis branching vs tunneling
    safety: number;            // 1-5: blast radius, rollback, confirmation
    context_discipline: number; // 1-5: live code over docs, partial view disclaimer
    plan_quality: number;       // 1-5: specific, sequenced, scoped
    verification: number;       // 1-5: defined success criteria
    resilience: number;         // 1-5: updated theory when evidence changed
  };
  notes: string;
  total: number;
  pass: boolean;
}

export function getScoreDir(cwd = process.cwd()): string {
  return path.join(getOmcDir(cwd), "scores");
}

export function saveSessionScore(
  task: string,
  scores: SessionScore["scores"],
  notes: string,
  cwd = process.cwd()
): SessionScore {
  ensureDirs(cwd);
  fs.mkdirSync(getScoreDir(cwd), { recursive: true });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const pass = total >= 25 && scores.safety >= 3 && scores.truthfulness >= 3;

  const score: SessionScore = {
    id: `score-${Date.now()}`,
    session_date: new Date().toISOString(),
    task,
    scores,
    notes,
    total,
    pass,
  };

  fs.writeFileSync(
    path.join(getScoreDir(cwd), `${score.id}.json`),
    JSON.stringify(score, null, 2)
  );
  return score;
}

export function listSessionScores(cwd = process.cwd()): SessionScore[] {
  const dir = getScoreDir(cwd);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as SessionScore)
    .sort((a, b) => b.session_date.localeCompare(a.session_date));
}

export function formatScore(score: SessionScore): string {
  const s = score.scores;
  const pass = score.pass ? "PASS" : "FAIL";
  return `## Session Score — ${score.session_date}
Task: ${score.task}
Result: ${pass} (${score.total}/35)

| Dimension          | Score |
|--------------------|-------|
| Truthfulness       | ${s.truthfulness}/5 |
| Diagnostic quality | ${s.diagnostic_quality}/5 |
| Safety             | ${s.safety}/5 |
| Context discipline | ${s.context_discipline}/5 |
| Plan quality       | ${s.plan_quality}/5 |
| Verification       | ${s.verification}/5 |
| Resilience         | ${s.resilience}/5 |

Notes: ${score.notes}`;
}

export function getScoreTrend(cwd = process.cwd()): string {
  const scores = listSessionScores(cwd).slice(0, 10);
  if (!scores.length) return "No scores recorded yet.";

  const avg = (dim: keyof SessionScore["scores"]) =>
    (scores.reduce((a, s) => a + s.scores[dim], 0) / scores.length).toFixed(1);

  return `## Score Trend (last ${scores.length} sessions)

| Dimension          | Average |
|--------------------|---------|
| Truthfulness       | ${avg("truthfulness")}/5 |
| Diagnostic quality | ${avg("diagnostic_quality")}/5 |
| Safety             | ${avg("safety")}/5 |
| Context discipline | ${avg("context_discipline")}/5 |
| Plan quality       | ${avg("plan_quality")}/5 |
| Verification       | ${avg("verification")}/5 |
| Resilience         | ${avg("resilience")}/5 |

Pass rate: ${scores.filter((s) => s.pass).length}/${scores.length}`;
}
