import { describe, expect, it } from "vitest";
import { validatePlayerDraft } from "./player-store";

const validCharacterImage = {
  url: "https://areyouin-artifacts-dev.s3.amazonaws.com/areyouin/character-images/user/upload.webp",
  bucket: "areyouin-artifacts-dev",
  objectKey: "areyouin/character-images/user/upload.webp",
  contentType: "image/webp",
  sizeBytes: 1000,
  uploadedAt: "2026-05-02T00:00:00.000Z",
};

describe("validatePlayerDraft", () => {
  it("requires appearance for new player creation", () => {
    expect(() =>
      validatePlayerDraft({
        name: "Mara",
        age: "31",
        location: "Chicago IL",
        occupation: "EMT",
        appearance: "",
        bio: "Works nights.",
        timeZone: "America/Chicago",
        characterImage: validCharacterImage,
      }),
    ).toThrow("Appearance is required");
  });

  it("returns a trimmed appearance", () => {
    expect(
      validatePlayerDraft({
        name: "Mara",
        age: "31",
        location: "Chicago IL",
        occupation: "EMT",
        appearance: "  Close-cropped hair and a faded red jacket.  ",
        bio: "Works nights.",
        timeZone: "America/Chicago",
        characterImage: validCharacterImage,
      }),
    ).toMatchObject({
      appearance: "Close-cropped hair and a faded red jacket.",
    });
  });
});
