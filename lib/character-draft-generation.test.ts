import { describe, expect, it } from "vitest";
import {
  buildCharacterDraftFillPrompt,
  mergeGeneratedCharacterDraft,
  parseCharacterDraftSuggestion,
} from "./character-draft-generation";

describe("character draft generation", () => {
  it("uses populated fields as fixed facts in the prompt", () => {
    const prompt = buildCharacterDraftFillPrompt({
      name: "Matthew",
      age: "52",
    });

    expect(prompt).toContain("Use any populated fields as fixed facts.");
    expect(prompt).toContain("name: Matthew");
    expect(prompt).toContain("age: 52");
    expect(prompt).toContain(
      "Missing fields: location, occupation, appearance, bio",
    );
  });

  it("parses generated JSON suggestions", () => {
    expect(
      parseCharacterDraftSuggestion(`Here is JSON:
      {
        "name": "Matthew",
        "age": "52",
        "location": "Clearwater FL",
        "occupation": "Harbor dispatcher",
        "appearance": "Weathered face, gray stubble, sun-faded work shirt.",
        "bio": "He works long shifts and keeps an eye on radio chatter."
      }`),
    ).toMatchObject({
      name: "Matthew",
      age: "52",
      occupation: "Harbor dispatcher",
    });
  });

  it("does not overwrite populated fields when merging", () => {
    expect(
      mergeGeneratedCharacterDraft(
        {
          name: "Matthew",
          age: "52",
          location: "",
          occupation: "",
          appearance: "",
          bio: "",
        },
        {
          name: "Mara",
          age: "31",
          location: "Clearwater FL",
          occupation: "Marine radio operator",
          appearance: "Broad shoulders, tired eyes, salt-stiff jacket.",
          bio: "He knows the harbor schedule too well.",
        },
      ),
    ).toMatchObject({
      name: "Matthew",
      age: "52",
      location: "Clearwater FL",
      occupation: "Marine radio operator",
    });
  });
});
