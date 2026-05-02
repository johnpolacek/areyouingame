import path from "node:path";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  deleteAllPlaytestRuns,
  deletePlaytestRun,
  readPlaytestIndex,
  type PlaytestIndex,
} from "./playtest-reports";

describe("playtest reports", () => {
  it("deletes one run report and rewrites the indexes", async () => {
    const repoRoot = await createPlaytestRepo({
      runs: [createRun("run-one"), createRun("run-two")],
    });

    await deletePlaytestRun("run-one", repoRoot);

    const index = await readPlaytestIndex(repoRoot);
    expect(index.runs.map((run) => run.id)).toEqual(["run-two"]);
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "run-one.md"), "utf8"),
    ).rejects.toThrow();
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "run-two.md"), "utf8"),
    ).resolves.toContain("run-two");
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "index.md"), "utf8"),
    ).resolves.toContain("run-two");
  });

  it("deletes all indexed run reports", async () => {
    const repoRoot = await createPlaytestRepo({
      runs: [createRun("run-one"), createRun("run-two")],
    });

    await deleteAllPlaytestRuns(repoRoot);

    const index = await readPlaytestIndex(repoRoot);
    expect(index.runs).toEqual([]);
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "run-one.md"), "utf8"),
    ).rejects.toThrow();
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "run-two.md"), "utf8"),
    ).rejects.toThrow();
    await expect(
      readFile(path.join(repoRoot, "wiki", "playtests", "index.md"), "utf8"),
    ).resolves.toContain("| - | - | - | - | - | - | - |");
  });

  it("rejects unsafe run ids", async () => {
    const repoRoot = await createPlaytestRepo({
      runs: [createRun("run-one")],
    });

    await expect(deletePlaytestRun("../run-one", repoRoot)).rejects.toThrow(
      "Invalid playtest run id.",
    );
  });
});

async function createPlaytestRepo(indexInput: Omit<PlaytestIndex, "generatedAt">) {
  const index: PlaytestIndex = {
    generatedAt: "2026-05-02T00:00:00.000Z",
    ...indexInput,
  };
  const repoRoot = await mkdtemp(path.join(tmpdir(), "areyouin-playtests-"));
  const playtestDir = path.join(repoRoot, "wiki", "playtests");

  await mkdir(playtestDir, { recursive: true });
  await Promise.all(
    index.runs.map((run) =>
      writeFile(
        path.join(repoRoot, run.reportPath),
        `# ${run.id}\n`,
        "utf8",
      ),
    ),
  );
  await writeFile(
    path.join(playtestDir, "index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
    "utf8",
  );

  return repoRoot;
}

function createRun(id: string) {
  return {
    buildLabel: "Build 0.1.20",
    buildVersion: "0.1.20",
    completedAt: "2026-05-02T00:00:00.000Z",
    findingCount: 1,
    id,
    personaName: "Test Player",
    personaSummary: "Tester, Localhost",
    reportPath: `wiki/playtests/${id}.md`,
    scenario: "yes-connected-path",
    status: "needs_review",
    topFinding: "A finding",
  };
}
