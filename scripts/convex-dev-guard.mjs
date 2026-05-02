#!/usr/bin/env node
import { spawn } from "node:child_process";
import { assertCanStartConvexDev } from "./worktree-runtime-guard.mjs";

try {
  assertCanStartConvexDev();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const child = spawn("convex", ["dev", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
