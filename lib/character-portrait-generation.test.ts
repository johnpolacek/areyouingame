import { describe, expect, it } from "vitest";
import { buildCharacterPortraitPrompt } from "./character-portrait-generation";

describe("character portrait generation", () => {
  it("builds a grounded portrait prompt from the player appearance", () => {
    const prompt = buildCharacterPortraitPrompt({
      name: "Mara Ilyin",
      age: "31",
      location: "Chicago IL",
      occupation: "EMT",
      appearance:
        "Close-cropped black hair, tired eyes, faded red jacket, small scar on left cheek.",
      bio: "She works nights and keeps checking on neighbors after storms.",
    });

    expect(prompt).toContain("square character portrait");
    expect(prompt).toContain("Appearance: Close-cropped black hair");
    expect(prompt).toContain("Do not include captions");
    expect(prompt).toContain("EMT");
  });
});
