import { describe, expect, it } from "vitest";
import {
  applyCharacterInfoCorrection,
  applyCharacterInfoUpdates,
  buildCharacterInfoPromptContext,
  createInitialCharacterInfo,
  normalizeCharacterInfoUpdates,
} from "./character-info";

describe("character info", () => {
  it("initializes from public-safe draft context", () => {
    const info = createInitialCharacterInfo({
      draft: {
        name: "Mara",
        age: "34",
        location: "Chicago",
        occupation: "Nurse",
        bio: "Skeptical and practical.",
        timeZone: "America/Chicago",
      },
      now: "2026-05-02T00:00:00.000Z",
    });

    expect(info.sections.currentSituation?.[0]).toMatchObject({
      id: "draft-bio",
      text: "Skeptical and practical.",
      source: "draft",
    });
  });

  it("sanitizes generated updates without breaking the turn", () => {
    const updates = normalizeCharacterInfoUpdates([
      {
        section: "knowledge",
        operation: "add",
        text: "Mara verified that public reports are accelerating.",
      },
      {
        section: "knowledge",
        operation: "add",
        text: "internal packageStatus is not_arrived",
      },
      {
        section: "resources",
        operation: "add",
        text: "",
      },
      {
        section: "bad",
        operation: "add",
        text: "Nope.",
      },
    ]);

    expect(updates).toEqual([
      {
        section: "knowledge",
        operation: "add",
        text: "Mara verified that public reports are accelerating.",
      },
    ]);
  });

  it("merges updates and records player corrections", () => {
    const now = "2026-05-02T00:00:00.000Z";
    const merged = applyCharacterInfoUpdates({
      characterInfo: undefined,
      now,
      sourceTurnId: "turn-1",
      updates: [
        {
          section: "goals",
          operation: "add",
          text: "Find a public source before trusting the prompt.",
        },
      ],
    });

    expect(merged?.sections.goals?.[0]?.sourceTurnId).toBe("turn-1");

    const corrected = applyCharacterInfoCorrection({
      characterInfo: merged,
      now: "2026-05-02T00:01:00.000Z",
      correction: {
        section: "goals",
        itemId: merged?.sections.goals?.[0]?.id,
        text: "Verify with two public sources before trusting the prompt.",
      },
    });

    expect(corrected.sections.goals?.[0]?.text).toBe(
      "Verify with two public sources before trusting the prompt.",
    );
    expect(corrected.corrections?.[0]).toMatchObject({
      section: "goals",
      previousText: "Find a public source before trusting the prompt.",
    });
  });

  it("filters connected reveal facts out of pre-delivery prompt context", () => {
    const context = buildCharacterInfoPromptContext({
      hideConnectedRevealTerms: true,
      characterInfo: {
        updatedAt: "2026-05-02T00:00:00.000Z",
        sections: {
          knowledge: [
            {
              id: "safe",
              text: "Mara has verified only public confusion so far.",
              updatedAt: "2026-05-02T00:00:00.000Z",
              source: "ai",
            },
            {
              id: "hidden",
              text: "A drone delivered a package.",
              updatedAt: "2026-05-02T00:00:00.000Z",
              source: "ai",
            },
          ],
        },
      },
    });

    expect(context).toEqual({
      knowledge: ["Mara has verified only public confusion so far."],
    });
  });
});
