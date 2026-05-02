#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

export const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export const workspaceRoot = dirname(repoRoot);
export const worktreesRoot = join(workspaceRoot, "AreYouIn.worktrees");

export function getCurrentRuntimeContext(cwd = process.cwd()) {
  const root = resolve(cwd);
  const env = readEnvFile(join(root, ".env.worktree.local"));
  const branch = safeGit(["branch", "--show-current"], root) || "main";

  return {
    branch,
    convexMode: env.AREYOUIN_CONVEX_MODE || "shared",
    root,
  };
}

export function assertCanStartConvexDev({
  allowOverride = process.env.AREYOUIN_ALLOW_SHARED_CONVEX_RACE === "1",
  cwd = process.cwd(),
} = {}) {
  if (allowOverride) {
    return;
  }

  const context = getCurrentRuntimeContext(cwd);
  const running = listRuntimeProcesses().filter(
    (processInfo) => processInfo.kind === "convex-dev",
  );
  const stale = running.filter(
    (processInfo) =>
      processInfo.worktreePath &&
      processInfo.worktreePath.startsWith(worktreesRoot) &&
      !existsSync(processInfo.worktreePath),
  );
  const conflicts =
    context.convexMode === "shared"
      ? running.filter((processInfo) => processInfo.repoPath !== context.root)
      : stale;

  if (conflicts.length === 0) {
    return;
  }

  throw new Error(
    [
      "Refusing to start Convex dev because another runtime can overwrite the same shared deployment.",
      formatProcessList(conflicts),
      context.convexMode === "shared"
        ? "Stop the other Convex dev process, or create this branch with `pnpm wt:create <branch> --convex isolated` and select a branch-specific Convex deployment."
        : "Stop stale deleted-worktree processes before continuing.",
      "Set AREYOUIN_ALLOW_SHARED_CONVEX_RACE=1 only for deliberate manual debugging.",
    ].join("\n"),
  );
}

export function assertNoRuntimeProcessesForPath(targetPath) {
  const resolvedTarget = resolve(targetPath);
  const matches = listRuntimeProcesses().filter(
    (processInfo) =>
      processInfo.repoPath === resolvedTarget ||
      processInfo.command.includes(resolvedTarget),
  );

  if (matches.length === 0) {
    return;
  }

  throw new Error(
    [
      `Refusing to remove worktree while runtime processes still reference it: ${resolvedTarget}`,
      formatProcessList(matches),
      "Stop those processes first, then rerun the worktree cleanup/finish command.",
    ].join("\n"),
  );
}

export function listRuntimeProcesses() {
  const rows = psRows();

  return rows
    .map((row) => ({
      ...row,
      kind: classifyRuntimeProcess(row.command),
      repoPath: inferRepoPath(row.command),
      worktreePath: inferWorktreePath(row.command),
    }))
    .filter((row) => row.kind);
}

export function printRuntimeStatus() {
  const processes = listRuntimeProcesses();

  if (processes.length === 0) {
    console.log("No AreYouIn worktree runtime processes found.");
    return;
  }

  console.log("AreYouIn worktree runtime processes:");
  console.log(formatProcessList(processes));
}

function psRows() {
  const stdout = execFileSync("ps", ["-axo", "pid=,ppid=,command="], {
    encoding: "utf8",
  });

  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = /^(\d+)\s+(\d+)\s+(.+)$/.exec(line);

      if (!match) {
        return null;
      }

      return {
        command: match[3],
        pid: Number.parseInt(match[1], 10),
        ppid: Number.parseInt(match[2], 10),
      };
    })
    .filter(Boolean);
}

function classifyRuntimeProcess(command) {
  if (
    command.includes("convex/bin/main.js dev") ||
    /\bconvex dev\b/.test(command)
  ) {
    return "convex-dev";
  }

  if (command.includes("next/dist/bin/next dev")) {
    return "next-dev";
  }

  if (
    (command.includes("agent-browser") || command.includes("Google Chrome")) &&
    (command.includes("ayi-") ||
      command.includes(`${repoRoot}/`) ||
      command.includes(`${worktreesRoot}/`))
  ) {
    return "agent-browser";
  }

  if (command.includes("persona-playtest/run.mjs")) {
    return "persona-playtest";
  }

  return null;
}

function inferRepoPath(command) {
  const worktreePath = inferWorktreePath(command);
  if (worktreePath) {
    return worktreePath;
  }

  const mainMarker = `${repoRoot}/`;
  if (command.includes(mainMarker)) {
    return repoRoot;
  }

  return null;
}

function inferWorktreePath(command) {
  const index = command.indexOf(`${worktreesRoot}/`);
  if (index < 0) {
    return null;
  }

  const rest = command.slice(index + worktreesRoot.length + 1);
  const slug = rest.split(/[\/\s]/)[0];

  return slug ? join(worktreesRoot, slug) : null;
}

function formatProcessList(processes) {
  return processes
    .map((processInfo) => {
      const where = processInfo.repoPath
        ? ` ${processInfo.repoPath}`
        : " unknown checkout";

      return `- pid ${processInfo.pid} ${processInfo.kind}${where}`;
    })
    .join("\n");
}

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

function safeGit(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}
