import { copyFile, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
import {
  assertNoRuntimeProcessesForPath,
  listRuntimeProcesses,
  printRuntimeStatus,
  worktreesRoot,
} from "./worktree-runtime-guard.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceRoot = dirname(repoRoot);
const defaultWorktreesRoot = join(workspaceRoot, "AreYouIn.worktrees");
const appName = "are-you-in";

const args = process.argv.slice(2);
const command = args.shift();

const commands = new Map([
  ["create", createWorktree],
  ["list", listWorktrees],
  ["doctor", doctorWorktrees],
  ["runtime", runtimeWorktrees],
  ["overlap", overlapWorktrees],
  ["finish", finishWorktree],
  ["prune", pruneWorktrees],
  ["clean", cleanWorktrees],
]);

function usage(exitCode = 0) {
  const text = `
Usage:
  pnpm wt:create <branch> [--base main] [--path <path>] [--convex shared|isolated] [--no-install] [--polish]
  pnpm wt:list
  pnpm wt:doctor
  pnpm wt:runtime
  pnpm wt:overlap
  pnpm wt:finish <branch> [--base main] [--keep-branch] [--no-clean] [--no-pull]
  pnpm wt:prune
  pnpm wt:clean [--older-than-days 14] [--force]

Examples:
  pnpm wt:create feature/orb-rejection
  pnpm wt:create polish --polish
  pnpm wt:finish feature/orb-rejection
  pnpm wt:create state/schema-test --convex isolated
`;

  console.log(text.trim());
  process.exit(exitCode);
}

function parseFlags(argv) {
  const flags = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.replaceAll("-", "_");

    if (inlineValue !== undefined) {
      flags[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      index += 1;
    } else {
      flags[key] = true;
    }
  }

  return { flags, positional };
}

function runGit(gitArgs, options = {}) {
  const output = execFileSync("git", gitArgs, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });

  return typeof output === "string" ? output.trim() : "";
}

function runCommand(commandName, commandArgs, options = {}) {
  const result = spawnSync(commandName, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
  };
}

function commandExists(commandName) {
  return runCommand("sh", ["-lc", `command -v ${quoteShell(commandName)}`]).status === 0;
}

function quoteShell(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function sanitizeBranch(branch) {
  return branch
    .replace(/^refs\/heads\//, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function branchUrl(branch) {
  return `https://${portlessRouteName(branch)}.localhost`;
}

function portlessRouteName(branch) {
  return branch === "main" ? appName : `${portlessWorktreePrefix(branch)}.${appName}`;
}

function portlessWorktreePrefix(branch) {
  return sanitizeBranch(String(branch).split("/").at(-1) || branch);
}

function parseWorktrees() {
  const raw = runGit(["worktree", "list", "--porcelain"]);
  const entries = [];
  let current = {};

  for (const line of raw.split("\n")) {
    if (!line.trim()) {
      if (current.path) entries.push(current);
      current = {};
      continue;
    }

    const [key, ...rest] = line.split(" ");
    const value = rest.join(" ");

    if (key === "worktree") current.path = value;
    if (key === "HEAD") current.head = value;
    if (key === "branch") current.branch = value.replace("refs/heads/", "");
    if (key === "detached") current.detached = true;
    if (key === "bare") current.bare = true;
  }

  if (current.path) entries.push(current);
  return entries;
}

function branchExists(branch) {
  return runCommand("git", ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`], {
    cwd: repoRoot,
  }).status === 0;
}

async function pathSize(path) {
  if (!existsSync(path)) return 0;

  const result = runCommand("du", ["-sk", path]);
  if (result.status !== 0) return 0;

  const kilobytes = Number.parseInt(result.stdout.split(/\s+/)[0] ?? "0", 10);
  return Number.isNaN(kilobytes) ? 0 : kilobytes * 1024;
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

function statusShort(path) {
  return runGit(["status", "--short"], { cwd: path });
}

function currentBranch(path = repoRoot) {
  return runGit(["branch", "--show-current"], { cwd: path });
}

function remoteBranchExists(remote, branch) {
  return runCommand("git", ["show-ref", "--verify", "--quiet", `refs/remotes/${remote}/${branch}`], {
    cwd: repoRoot,
  }).status === 0;
}

function countRevRange(range) {
  const output = runGit(["rev-list", "--count", range]);
  const count = Number.parseInt(output, 10);
  return Number.isNaN(count) ? 0 : count;
}

function changedFiles(path) {
  const output = runGit(["status", "--short"], { cwd: path });
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3).split(" -> ").at(-1))
    .filter(Boolean);
}

async function copyEnvFiles(destination, convexMode, slug, branch) {
  const envSource = join(repoRoot, ".env.local");
  const envExample = join(repoRoot, ".env.example");
  const envDestination = join(destination, ".env.local");

  if (!existsSync(envDestination)) {
    if (existsSync(envSource)) {
      await copyFile(envSource, envDestination);
      console.log("Copied .env.local from the main checkout.");
    } else if (existsSync(envExample)) {
      await copyFile(envExample, envDestination);
      console.log("Created .env.local from .env.example. Fill in real secrets before running dev.");
    }
  } else {
    console.log("Kept existing .env.local in the worktree.");
  }

  const metadata = [
    "# Generated by pnpm wt:create for local worktree coordination.",
    `AREYOUIN_WORKTREE_SLUG=${slug}`,
    `AREYOUIN_CONVEX_MODE=${convexMode}`,
    `AREYOUIN_PORTLESS_ROUTE_NAME=${portlessRouteName(branch)}`,
    `AREYOUIN_PORTLESS_BASE_NAME=${appName}`,
    `AREYOUIN_PORTLESS_URL=${branchUrl(branch)}`,
    "",
  ].join("\n");

  const metadataPath = join(destination, ".env.worktree.local");
  if (!existsSync(metadataPath)) {
    await writeFile(metadataPath, metadata);
  }
}

async function createWorktree(argv) {
  const { flags, positional } = parseFlags(argv);
  const branch = positional[0] ?? (flags.polish ? "polish" : undefined);

  if (!branch) {
    console.error("Missing branch name.");
    usage(1);
  }

  const base = flags.base ?? "main";
  const convexMode = flags.convex ?? "shared";
  const allowedConvexModes = new Set(["shared", "isolated"]);

  if (!allowedConvexModes.has(convexMode)) {
    throw new Error(`Unsupported --convex value "${convexMode}". Use shared or isolated.`);
  }

  const slug = sanitizeBranch(branch);
  if (!slug) throw new Error(`Could not derive a safe worktree slug from "${branch}".`);

  const destination = resolve(flags.path ?? join(defaultWorktreesRoot, slug));
  await mkdir(dirname(destination), { recursive: true });

  if (existsSync(destination)) {
    throw new Error(`Destination already exists: ${destination}`);
  }

  const gitArgs = branchExists(branch)
    ? ["worktree", "add", destination, branch]
    : ["worktree", "add", "-b", branch, destination, base];

  console.log(`Creating worktree ${branch} at ${destination}`);
  runGit(gitArgs, { stdio: "inherit" });

  await copyEnvFiles(destination, convexMode, slug, branch);

  if (!flags.no_install) {
    console.log("Installing dependencies with pnpm install --frozen-lockfile...");
    const result = runCommand("pnpm", ["install", "--frozen-lockfile"], {
      cwd: destination,
      stdio: "inherit",
    });

    if (result.status !== 0) {
      throw new Error("pnpm install failed in the new worktree.");
    }
  }

  console.log("");
  console.log(`Worktree ready: ${destination}`);
  console.log(`Branch: ${branch}`);
  console.log(`Portless route: ${portlessRouteName(branch)}`);
  console.log(`Dev URL: ${branchUrl(branch)}`);
  console.log(`Start it with: cd ${quoteShell(destination)} && pnpm dev`);

  if (flags.polish || branch === "polish") {
    console.log("");
    console.log("Polish lane: keep this branch for small bug fixes and UI/UX tweaks, then merge it back frequently.");
  }

  if (convexMode === "isolated") {
    console.log("");
    console.log("Convex mode is isolated. Create/select a branch-specific Convex deployment, update .env.local, then run:");
    console.log("  pnpm convex:sync-secret");
    console.log("  pnpm wt:doctor");
  }
}

async function listWorktrees() {
  const worktrees = parseWorktrees();

  for (const worktree of worktrees) {
    const size = await pathSize(worktree.path);
    const relativePath = relative(workspaceRoot, worktree.path) || ".";
    const dirty = statusShort(worktree.path) ? "dirty" : "clean";
    const branch = worktree.branch ?? "(detached)";

    console.log(`${branch}`);
    console.log(`  path: ${relativePath}`);
    console.log(`  url:  ${worktree.branch ? branchUrl(worktree.branch) : "(detached)"}`);
    console.log(`  disk: ${formatBytes(size)}`);
    console.log(`  state: ${dirty}`);
  }
}

async function doctorWorktrees() {
  let failures = 0;

  function check(label, ok, detail = "", severity = "warn") {
    const prefix = ok ? "OK" : severity === "error" ? "ERROR" : "WARN";
    console.log(`${prefix} ${label}${detail ? ` - ${detail}` : ""}`);
    if (!ok && severity === "error") failures += 1;
  }

  check("portless on PATH", commandExists("portless"), "", "error");
  if (commandExists("portless")) {
    const version = runCommand("portless", ["--version"]);
    check("portless version", version.status === 0, version.stdout || version.stderr);
  }

  check(".env.local in main checkout", existsSync(join(repoRoot, ".env.local")));

  const worktrees = parseWorktrees();
  const branches = new Map();

  for (const worktree of worktrees) {
    if (!worktree.branch) continue;
    const paths = branches.get(worktree.branch) ?? [];
    paths.push(worktree.path);
    branches.set(worktree.branch, paths);
  }

  for (const [branch, paths] of branches) {
    check(`branch ${branch} checked out once`, paths.length === 1, paths.join(", "));
  }

  for (const worktree of worktrees) {
    const branch = worktree.branch ?? "(detached)";
    check(`${branch}: node_modules`, existsSync(join(worktree.path, "node_modules")), worktree.path);
    check(`${branch}: .env.local`, existsSync(join(worktree.path, ".env.local")), worktree.path);
  }

  const secretCheck = runCommand("pnpm", ["convex:check-secret"], { cwd: repoRoot });
  check("main Convex backend secret fingerprint", secretCheck.status === 0, secretCheck.stdout || secretCheck.stderr);

  const runtimeProcesses = listRuntimeProcesses();
  const staleRuntimeProcesses = runtimeProcesses.filter(
    (processInfo) =>
      processInfo.worktreePath &&
      processInfo.worktreePath.startsWith(worktreesRoot) &&
      !existsSync(processInfo.worktreePath),
  );
  const convexDevByPath = runtimeProcesses
    .filter((processInfo) => processInfo.kind === "convex-dev" && processInfo.repoPath)
    .reduce((paths, processInfo) => paths.add(processInfo.repoPath), new Set());

  check(
    "no stale deleted-worktree runtime processes",
    staleRuntimeProcesses.length === 0,
    staleRuntimeProcesses.map((processInfo) => `pid ${processInfo.pid}`).join(", "),
    "error",
  );
  check(
    "at most one active Convex dev checkout",
    convexDevByPath.size <= 1,
    [...convexDevByPath].join(", "),
    "error",
  );

  if (failures > 0) {
    process.exitCode = 1;
  }
}

async function runtimeWorktrees() {
  printRuntimeStatus();
}

async function overlapWorktrees() {
  const worktrees = parseWorktrees().filter((worktree) => worktree.branch);
  const byFile = new Map();

  for (const worktree of worktrees) {
    for (const file of changedFiles(worktree.path)) {
      const entries = byFile.get(file) ?? [];
      entries.push(worktree);
      byFile.set(file, entries);
    }
  }

  const overlaps = [...byFile.entries()].filter(([, entries]) => entries.length > 1);

  if (overlaps.length === 0) {
    console.log("No changed-file overlap across active worktrees.");
    return;
  }

  console.log("Changed-file overlap detected:");
  for (const [file, entries] of overlaps) {
    console.log(`- ${file}`);
    for (const entry of entries) {
      console.log(`  ${entry.branch}: ${entry.path}`);
    }
  }

  process.exitCode = 1;
}

async function finishWorktree(argv) {
  const { flags, positional } = parseFlags(argv);
  const branch = positional[0];
  const base = flags.base ?? "main";
  const keepBranch = Boolean(flags.keep_branch) || branch === "polish";
  const shouldClean = !flags.no_clean;
  const shouldPull = !flags.no_pull;

  if (!branch) {
    console.error("Missing branch name.");
    usage(1);
  }

  if (branch === base) {
    throw new Error(`Refusing to finish the integration branch "${base}".`);
  }

  if (statusShort(repoRoot)) {
    throw new Error(`Main checkout has uncommitted changes. Commit or stash before finishing ${branch}.`);
  }

  const integrationBranch = currentBranch(repoRoot);
  if (integrationBranch !== base) {
    throw new Error(`Main checkout must be on ${base}; currently on ${integrationBranch || "(detached)"}.`);
  }

  const worktree = parseWorktrees().find((entry) => entry.branch === branch);
  if (!worktree) {
    throw new Error(`No active worktree found for branch "${branch}".`);
  }

  if (worktree.path === repoRoot) {
    throw new Error(`Branch "${branch}" is checked out in the main checkout; use a linked worktree branch.`);
  }

  if (!worktree.path.startsWith(defaultWorktreesRoot)) {
    throw new Error(`Refusing to clean worktree outside ${defaultWorktreesRoot}: ${worktree.path}`);
  }

  if (statusShort(worktree.path)) {
    throw new Error(`Worktree ${branch} has uncommitted changes. Commit or stash before finishing.`);
  }

  assertNoRuntimeProcessesForPath(worktree.path);

  console.log(`Finishing ${branch} from ${worktree.path}`);

  if (shouldPull) {
    if (remoteBranchExists("origin", base)) {
      console.log(`Updating ${base} with git pull --ff-only origin ${base}`);
      runGit(["pull", "--ff-only", "origin", base], { stdio: "inherit" });
    } else {
      console.log(`Skipping pull: origin/${base} is not available locally.`);
    }
  }

  console.log("Checking changed-file overlap across active worktrees...");
  await overlapWorktrees();
  if (process.exitCode) {
    throw new Error("Resolve changed-file overlap before finishing the worktree.");
  }

  const ahead = countRevRange(`${base}..${branch}`);
  if (ahead === 0) {
    console.log(`${branch} has no commits ahead of ${base}; skipping merge.`);
  } else {
    console.log(`Merging ${ahead} commit${ahead === 1 ? "" : "s"} from ${branch} into ${base}.`);
    runGit(["merge", "--no-ff", "--log", branch], { stdio: "inherit" });
  }

  if (shouldClean) {
    console.log(`Removing worktree ${worktree.path}`);
    assertNoRuntimeProcessesForPath(worktree.path);
    runGit(["worktree", "remove", worktree.path], { stdio: "inherit" });
  } else {
    console.log("Keeping worktree because --no-clean was provided.");
  }

  if (!keepBranch) {
    console.log(`Deleting merged branch ${branch}`);
    runGit(["branch", "-d", branch], { stdio: "inherit" });
  } else {
    console.log(`Keeping branch ${branch}.`);
  }

  await pruneWorktrees();
  console.log(`Finished ${branch}.`);
}

async function pruneWorktrees() {
  runGit(["worktree", "prune"], { stdio: "inherit" });

  if (commandExists("portless")) {
    const help = runCommand("portless", ["--help"]);
    if (help.stdout.includes("portless prune")) {
      const result = runCommand("portless", ["prune"], { stdio: "inherit" });
      if (result.status !== 0) {
        console.log("Portless prune failed; run portless list to inspect active routes.");
      }
    } else {
      console.log("Installed Portless does not expose prune; run portless list to inspect active routes.");
    }
  }

  console.log("Pruned git worktree records.");
}

async function cleanWorktrees(argv) {
  const { flags } = parseFlags(argv);
  const olderThanDays = Number.parseInt(flags.older_than_days ?? "14", 10);
  const force = Boolean(flags.force);

  if (Number.isNaN(olderThanDays) || olderThanDays < 0) {
    throw new Error("--older-than-days must be a non-negative number.");
  }

  const worktrees = parseWorktrees().filter(
    (worktree) => worktree.path.startsWith(defaultWorktreesRoot) && worktree.path !== repoRoot,
  );

  const now = Date.now();
  const candidates = [];

  for (const worktree of worktrees) {
    const info = await stat(worktree.path);
    const ageDays = Math.floor((now - info.mtimeMs) / (24 * 60 * 60 * 1000));
    if (ageDays >= olderThanDays) {
      candidates.push({ ...worktree, ageDays, dirty: Boolean(statusShort(worktree.path)) });
    }
  }

  if (candidates.length === 0) {
    console.log(`No worktrees under ${defaultWorktreesRoot} are older than ${olderThanDays} days.`);
    return;
  }

  for (const candidate of candidates) {
    if (candidate.dirty && !force) {
      console.log(`Skipping dirty worktree ${candidate.branch}: ${candidate.path}`);
      continue;
    }

    console.log(`Removing ${candidate.branch} (${candidate.ageDays} days old): ${candidate.path}`);
    assertNoRuntimeProcessesForPath(candidate.path);
    runGit(["worktree", "remove", candidate.path, ...(force ? ["--force"] : [])], { stdio: "inherit" });
    await rm(candidate.path, { recursive: true, force: true });
  }

  await pruneWorktrees();
}

if (!command || command === "help" || command === "--help") {
  usage(command ? 0 : 1);
}

const handler = commands.get(command);
if (!handler) {
  console.error(`Unknown worktree command: ${command}`);
  usage(1);
}

try {
  await handler(args);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
