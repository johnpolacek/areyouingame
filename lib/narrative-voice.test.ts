import { describe, expect, it } from "vitest";
import {
  createPlayerFacingNarrativePrompt,
  sanitizePlayerFacingNarration,
} from "./narrative-voice";

describe("createPlayerFacingNarrativePrompt", () => {
  it("includes durable Narration Style guidance", () => {
    const prompt = createPlayerFacingNarrativePrompt();

    expect(prompt).toContain("Narration Style");
    expect(prompt).toContain("Use short paragraphs.");
    expect(prompt).toContain("Use strong visual beats.");
    expect(prompt).toContain(
      "Make every response feel like tense interactive fiction",
    );
    expect(prompt).toContain(
      "Do not use colons, semicolons, or em dashes in player-facing narration.",
    );
    expect(prompt).toContain("What is visibly true now");
  });
});

describe("sanitizePlayerFacingNarration", () => {
  it("removes punctuation banned from player-facing narration", () => {
    expect(
      sanitizePlayerFacingNarration(
        "You look down: the screen clicks; someone whispers\u2014then backs away.",
      ),
    ).toBe(
      "You look down. the screen clicks. someone whispers, then backs away.",
    );
  });
});
