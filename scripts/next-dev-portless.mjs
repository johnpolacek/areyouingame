#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const env = {
  ...process.env,
  ...readEnvFile(join(repoRoot, ".env.worktree.local")),
};
const portlessName = env.AREYOUIN_PORTLESS_BASE_NAME || "are-you-in";
const args = ["run", "--name", portlessName, "pnpm", "next:dev:app"];

const child = spawn("portless", args, {
  cwd: repoRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

function readEnvFile(path) {
  try {
    const values = {};
    const raw = readFileSync(path, "utf8");

    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;

      values[match[1]] = parseEnvValue(match[2]);
    }

    return values;
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }
}

function parseEnvValue(rawValue) {
  let value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  const commentIndex = value.indexOf(" #");
  if (commentIndex >= 0) {
    value = value.slice(0, commentIndex).trim();
  }

  return value;
}
