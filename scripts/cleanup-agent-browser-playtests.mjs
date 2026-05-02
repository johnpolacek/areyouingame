#!/usr/bin/env node
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const localRuntimeDir = path.join(repoRoot, ".agent-browser-worktree");
const globalAgentBrowserDir = path.join(os.homedir(), ".agent-browser");
const playtestSessionPattern = /^ayi-[a-z0-9-]+$/;
const playtestGlobalFilePattern = /^ayi-[a-z0-9-]+\.(pid|engine)$/;

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const doctor = args.includes("--doctor");
  const state = await collectState();

  if (doctor) {
    printDoctor(state);
    return;
  }

  await cleanup(state, { dryRun });
}

async function collectState() {
  const sessions = await listAgentBrowserSessions();
  const playtestSessions = sessions.filter((session) =>
    playtestSessionPattern.test(session),
  );
  const globalFiles = await listPlaytestGlobalFiles();
  const localRuntimeExists = existsSync(localRuntimeDir);
  const localRuntimeSize = localRuntimeExists ? await pathSize(localRuntimeDir) : 0;

  return {
    globalFiles,
    localRuntimeExists,
    localRuntimeSize,
    playtestSessions,
    sessions,
  };
}

function printDoctor(state) {
  console.log("Agent-browser playtest status");
  console.log(`Active sessions: ${state.sessions.length || 0}`);

  for (const session of state.sessions) {
    const marker = playtestSessionPattern.test(session) ? "ayi" : "keep";
    console.log(`- ${session} (${marker})`);
  }

  console.log(`Global ayi-* pid/engine files: ${state.globalFiles.length}`);
  for (const file of state.globalFiles) {
    console.log(`- ${path.relative(globalAgentBrowserDir, file)}`);
  }

  console.log(
    `Local runtime: ${state.localRuntimeExists ? formatBytes(state.localRuntimeSize) : "missing"}`,
  );
  console.log(`Path: ${localRuntimeDir}`);
}

async function cleanup(state, { dryRun }) {
  const targets = [
    ...state.playtestSessions.map((session) => ({
      label: `session ${session}`,
      run: () => closeSession(session),
    })),
    ...state.globalFiles.map((file) => ({
      label: `global file ${file}`,
      run: () => rm(file, { force: true }),
    })),
  ];

  if (state.localRuntimeExists) {
    targets.push({
      label: `local runtime ${localRuntimeDir}`,
      run: () => rm(localRuntimeDir, { force: true, recursive: true }),
    });
  }

  if (targets.length === 0) {
    console.log("No disposable ayi-* agent-browser playtest artifacts found.");
    return;
  }

  if (dryRun) {
    console.log("Disposable agent-browser playtest artifacts that would be removed:");
    for (const target of targets) {
      console.log(`- ${target.label}`);
    }
    return;
  }

  let failedCount = 0;

  for (const target of targets) {
    try {
      await target.run();
      console.log(`Removed ${target.label}`);
    } catch (error) {
      failedCount += 1;
      console.warn(`Unable to remove ${target.label}: ${formatError(error)}`);
    }
  }

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

async function closeSession(session) {
  await execFileAsync("agent-browser", ["--session", session, "close"], {
    timeout: 8000,
  });
}

async function listAgentBrowserSessions() {
  try {
    const { stdout } = await execFileAsync("agent-browser", ["session", "list"], {
      timeout: 8000,
    });

    return stdout
      .split(/\r?\n/)
      .map((line) => line.replace(/^[\s→*-]+/, "").trim())
      .filter((line) => line && line !== "Active sessions:");
  } catch {
    return [];
  }
}

async function listPlaytestGlobalFiles() {
  try {
    const entries = await readdir(globalAgentBrowserDir);

    return entries
      .filter((entry) => playtestGlobalFilePattern.test(entry))
      .map((entry) => path.join(globalAgentBrowserDir, entry));
  } catch {
    return [];
  }
}

async function pathSize(targetPath) {
  if (!existsSync(targetPath)) return 0;

  const info = await stat(targetPath);
  if (!info.isDirectory()) return info.size;

  const children = await readdir(targetPath);
  const sizes = await Promise.all(
    children.map((child) => pathSize(path.join(targetPath, child))),
  );

  return sizes.reduce((total, size) => total + size, 0);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
