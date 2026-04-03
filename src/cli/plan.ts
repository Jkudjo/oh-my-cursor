import fs from "fs";
import path from "path";
import { listPlans, loadPlan, getPlansDir } from "../state/base.js";

export function runPlan(args: string[], cwd = process.cwd()): void {
  const sub = args[0];

  switch (sub) {
    case "list":
    case undefined: {
      const plans = listPlans(cwd);
      if (!plans.length) {
        console.log("No plans saved yet.");
        return;
      }
      console.log(`${plans.length} plan(s):\n`);
      for (const p of plans) {
        const approved = p.approved ? "✓ approved" : "○ pending";
        console.log(`  ${p.id}`);
        console.log(`  Title:    ${p.title}`);
        console.log(`  Status:   ${approved}`);
        console.log(`  Created:  ${p.created_at}`);
        console.log();
      }
      break;
    }

    case "show": {
      const id = args[1];
      if (!id) {
        console.error("Usage: omc plan show <id>");
        process.exit(1);
      }
      const plan = loadPlan(id, cwd);
      if (!plan) {
        console.error(`Plan not found: ${id}`);
        process.exit(1);
      }
      console.log(`# ${plan.title}`);
      console.log(`ID: ${plan.id} | Approved: ${plan.approved} | Created: ${plan.created_at}\n`);
      console.log(plan.content);
      break;
    }

    case "approve": {
      const id = args[1];
      if (!id) {
        console.error("Usage: omc plan approve <id>");
        process.exit(1);
      }
      const plan = loadPlan(id, cwd);
      if (!plan) {
        console.error(`Plan not found: ${id}`);
        process.exit(1);
      }
      plan.approved = true;
      plan.updated_at = new Date().toISOString();
      const file = path.join(getPlansDir(cwd), `${id}.json`);
      fs.writeFileSync(file, JSON.stringify(plan, null, 2));
      console.log(`✓ Plan approved: ${id}`);
      break;
    }

    default:
      console.error(`Unknown plan subcommand: ${sub}`);
      console.log("Usage: omc plan [list|show <id>|approve <id>]");
      process.exit(1);
  }
}
