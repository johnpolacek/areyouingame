import path from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

export type PlaytestIndex = {
  generatedAt: string;
  runs: PlaytestRunIndexEntry[];
};

export type PlaytestRunIndexEntry = {
  buildLabel: string;
  buildVersion: string;
  completedAt: string;
  findingCount: number;
  id: string;
  personaName: string;
  personaSummary: string;
  reportPath: string;
  scenario: string;
  status: string;
  topFinding: string;
};

const playtestIndexJsonPath = path.join("wiki", "playtests", "index.json");
const playtestIndexMarkdownPath = path.join("wiki", "playtests", "index.md");

export async function readPlaytestIndex(
  repoRoot = process.cwd(),
): Promise<PlaytestIndex> {
  try {
    const raw = await readFile(path.join(repoRoot, playtestIndexJsonPath), "utf8");
    const parsed = JSON.parse(raw) as Partial<PlaytestIndex>;

    return {
      generatedAt:
        typeof parsed.generatedAt === "string"
          ? parsed.generatedAt
          : new Date().toISOString(),
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    };
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      runs: [],
    };
  }
}

export async function deletePlaytestRun(
  runId: string,
  repoRoot = process.cwd(),
): Promise<PlaytestIndex> {
  assertSafeRunId(runId);

  const index = await readPlaytestIndex(repoRoot);
  const target = index.runs.find((run) => run.id === runId);
  const nextIndex = {
    generatedAt: new Date().toISOString(),
    runs: index.runs.filter((run) => run.id !== runId),
  };

  if (target) {
    await deleteRunMarkdown(target, repoRoot);
  }

  await writePlaytestIndex(nextIndex, repoRoot);

  return nextIndex;
}

export async function deleteAllPlaytestRuns(
  repoRoot = process.cwd(),
): Promise<PlaytestIndex> {
  const index = await readPlaytestIndex(repoRoot);

  await Promise.all(index.runs.map((run) => deleteRunMarkdown(run, repoRoot)));

  const nextIndex = {
    generatedAt: new Date().toISOString(),
    runs: [],
  };

  await writePlaytestIndex(nextIndex, repoRoot);

  return nextIndex;
}

export function createPlaytestIndexMarkdown(index: PlaytestIndex): string {
  const rows = index.runs
    .map(
      (run) =>
        `| [${run.id}](${path.basename(run.reportPath)}) | ${run.buildVersion} | ${escapeTable(run.personaName)} | ${escapeTable(run.scenario)} | ${run.status} | ${run.findingCount} | ${escapeTable(run.topFinding || "-")} |`,
    )
    .join("\n");

  return `# Persona Playtests\n\nGenerated persona playthrough reports for AreYouIn builds.\n\nLast generated: ${index.generatedAt}\n\n| Run | Build | Persona | Scenario | Status | Findings | Top Finding |\n| --- | --- | --- | --- | --- | ---: | --- |\n${rows || "| - | - | - | - | - | - | - |"}\n`;
}

async function writePlaytestIndex(index: PlaytestIndex, repoRoot: string) {
  await mkdir(path.join(repoRoot, "wiki", "playtests"), { recursive: true });

  await writeFile(
    path.join(repoRoot, playtestIndexJsonPath),
    `${JSON.stringify(index, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(repoRoot, playtestIndexMarkdownPath),
    createPlaytestIndexMarkdown(index),
    "utf8",
  );
}

async function deleteRunMarkdown(
  run: PlaytestRunIndexEntry,
  repoRoot: string,
) {
  assertSafeRunId(run.id);
  const reportPath = getSafeReportPath(run, repoRoot);

  await rm(reportPath, { force: true });
}

function getSafeReportPath(run: PlaytestRunIndexEntry, repoRoot: string) {
  const expectedReportPath = path.resolve(
    repoRoot,
    "wiki",
    "playtests",
    `${run.id}.md`,
  );
  const indexedReportPath = path.resolve(repoRoot, run.reportPath);

  return indexedReportPath === expectedReportPath
    ? indexedReportPath
    : expectedReportPath;
}

function assertSafeRunId(runId: string) {
  if (!/^[a-z0-9._-]+(?:__[a-z0-9._-]+)*$/i.test(runId)) {
    throw new Error("Invalid playtest run id.");
  }
}

function escapeTable(value: string) {
  return value.replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}
