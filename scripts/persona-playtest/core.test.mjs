import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildSyntheticUserId,
  createFallbackRandomPersona,
  createFallbackRequestedPersona,
  parsePlaytestArgs,
  slugify,
  writePlaytestReport,
} from "./core.mjs";

describe("persona playtest core", () => {
  it("parses requested and random persona commands", () => {
    expect(parsePlaytestArgs(["--", "a teacher in Australia"])).toMatchObject({
      persona: "a teacher in Australia",
      random: false,
      scenario: "day-1-opening-branch",
    });
    expect(parsePlaytestArgs(["--random", "--seed", "abc"])).toMatchObject({
      random: true,
      seed: "abc",
    });
  });

  it("creates safe synthetic user ids", () => {
    expect(
      buildSyntheticUserId({
        build: "0.1.2",
        personaSlug: "Maya Collins!",
        scenario: "yes-connected-path",
      }),
    ).toBe("playtest:0-1-2:maya-collins:yes-connected-path");
  });

  it("creates useful fallback personas", () => {
    const requested = createFallbackRequestedPersona("a teacher in Australia");
    const random = createFallbackRandomPersona("seed");

    expect(requested.location).toContain("Australia");
    expect(requested.occupation.toLowerCase()).toContain("teacher");
    expect(random.whyInteresting).toBeTruthy();
  });

  it("writes markdown reports and index files", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "areyouin-playtest-"));

    try {
      const persona = createFallbackRequestedPersona("a teacher in Australia");
      const run = {
        analysis: {
          emotionalArc: ["wary", "curious"],
          memorableMoment: "The first reveal lands.",
          recommendedChanges: ["Make the stakes more concrete."],
          status: "needs_review",
          summary: "The persona wanted clearer consent.",
          topFindings: [
            {
              category: "pacing",
              evidence: "The persona asked what YES meant.",
              recommendation: "Add a grounded consequence before the choice.",
              severity: "medium",
              title: "Choice arrives before concrete stakes",
            },
          ],
        },
        build: {
          label: "Build 0.1.2",
          version: "0.1.2",
        },
        completedAt: "2026-05-01T12:00:00.000Z",
        id: slugify("0.1.2 day-1 teacher"),
        persona,
        scenario: "day-1-opening-branch",
        startedAt: "2026-05-01T11:59:00.000Z",
        syntheticUserId: "playtest:0-1-2:teacher:day-1-opening-branch",
        turns: [
          {
            gameText: "Where are you and what are you doing?",
            label: "Opening prompt",
            persona: {
              choice: "DEFERRED",
              confusionLevel: 0.2,
              emotionalState: "focused",
              engagementLevel: 0.8,
              intent: "answer concretely",
              responseText: persona.openingResponse,
              trustLevel: 0.3,
            },
          },
        ],
      };

      await writePlaytestReport({ repoRoot: root, run });

      const markdown = await readFile(
        path.join(root, "wiki", "playtests", `${run.id}.md`),
        "utf8",
      );
      const index = JSON.parse(
        await readFile(path.join(root, "wiki", "playtests", "index.json"), "utf8"),
      );

      expect(markdown).toContain("Choice arrives before concrete stakes");
      expect(index.runs[0]).toMatchObject({
        buildVersion: "0.1.2",
        findingCount: 1,
        personaName: persona.name,
      });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});
