import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildSyntheticUserId,
  createFallbackRandomPersona,
  createFallbackRequestedPersona,
  normalizeCapturedGameText,
  parseEnvFile,
  parsePlaytestArgs,
  slugify,
  writePlaytestReport,
} from "./core.mjs";

describe("persona playtest core", () => {
  it("parses requested and random persona commands", () => {
    expect(parsePlaytestArgs(["--", "a teacher in Australia"])).toMatchObject({
      persona: "a teacher in Australia",
      random: false,
      scenario: "yes-connected-path",
    });
    expect(parsePlaytestArgs(["--random", "--seed", "abc"])).toMatchObject({
      random: true,
      seed: "abc",
    });
  });

  it("defaults playtests to the worktree Portless URL when available", () => {
    const previousUrl = process.env.AREYOUIN_PORTLESS_URL;
    process.env.AREYOUIN_PORTLESS_URL = "https://feature-demo.are-you-in.localhost";

    try {
      expect(parsePlaytestArgs(["--random"])).toMatchObject({
        baseUrl: "https://feature-demo.are-you-in.localhost",
      });
    } finally {
      if (previousUrl === undefined) {
        delete process.env.AREYOUIN_PORTLESS_URL;
      } else {
        process.env.AREYOUIN_PORTLESS_URL = previousUrl;
      }
    }
  });

  it("creates safe synthetic user ids", () => {
    expect(
      buildSyntheticUserId({
        build: "0.1.2",
        personaSlug: "Maya Collins!",
        runSlug: "2026-05-01T03-00",
        scenario: "yes-connected-path",
      }),
    ).toBe("playtest:0-1-2:maya-collins:yes-connected-path:2026-05-01t03-00");
  });

  it("creates useful fallback personas", () => {
    const requested = createFallbackRequestedPersona("a teacher in Australia");
    const random = createFallbackRandomPersona("seed");

    expect(requested.location).toContain("Australia");
    expect(requested.occupation.toLowerCase()).toContain("teacher");
    expect(random.whyInteresting).toBeTruthy();
  });

  it("normalizes captured game text for readable reports", () => {
    const noisy = [
      '(self.__next_s=self.__next_s||[]).push([0,{"children":"script"}])',
      "Admin",
      "Reset",
      "Hi Maya, it is 10:46pm in Melbourne.",
      "Where are you and what are you doing?",
      "SEND",
      "Build 0.1.2",
    ].join("\n");

    expect(normalizeCapturedGameText(JSON.stringify(noisy))).toBe(
      "Hi Maya, it is 10:46pm in Melbourne.\nWhere are you and what are you doing?",
    );
  });

  it("parses .env.local values for the runner", () => {
    expect(
      parseEnvFile([
        "# comment",
        "OPENAI_API_KEY=sk-test",
        'PLAYTEST_OPENAI_MODEL="gpt-test"',
        "export OTHER_VALUE='hello world'",
        "INLINE=value # comment",
      ].join("\n")),
    ).toEqual({
      INLINE: "value",
      OPENAI_API_KEY: "sk-test",
      OTHER_VALUE: "hello world",
      PLAYTEST_OPENAI_MODEL: "gpt-test",
    });
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
