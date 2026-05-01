#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const playtestSessionPattern = /^ayi-[a-z0-9-]+$/;
const protectedSessions = new Set(["areyouin-john"]);

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sessions = await listAgentBrowserSessions();
  const playtestSessions = sessions.filter(
    (session) =>
      playtestSessionPattern.test(session) && !protectedSessions.has(session),
  );

  if (playtestSessions.length === 0) {
    console.log("No disposable ayi-* agent-browser sessions found.");
    return;
  }

  if (dryRun) {
    console.log("Disposable ayi-* sessions that would be closed:");
    for (const session of playtestSessions) {
      console.log(`- ${session}`);
    }
    return;
  }

  let failedCount = 0;

  for (const session of playtestSessions) {
    try {
      await execFileAsync("agent-browser", ["--session", session, "close"], {
        timeout: 8000,
      });
      console.log(`Closed ${session}`);
    } catch (error) {
      failedCount += 1;
      console.warn(`Unable to close ${session}: ${formatError(error)}`);
    }
  }

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

async function listAgentBrowserSessions() {
  const { stdout } = await execFileAsync("agent-browser", ["session", "list"]);

  return stdout
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s→*-]+/, "").trim())
    .filter((line) => line && line !== "Active sessions:");
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
