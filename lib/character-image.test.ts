import { describe, expect, it } from "vitest";
import {
  characterImageContentType,
  maxCharacterImageBytes,
  validateCharacterImageInput,
  validateCharacterImageUpload,
} from "./character-image";

describe("character image", () => {
  it("accepts supported public image metadata", () => {
    expect(
      validateCharacterImageInput({
        url: "https://areyouin-artifacts-dev.s3.amazonaws.com/areyouin/character-images/user/upload",
        bucket: "areyouin-artifacts-dev",
        objectKey: "areyouin/character-images/user/upload",
        contentType: "image/png",
        sizeBytes: 1000,
        uploadedAt: "2026-05-02T00:00:00.000Z",
      }),
    ).toMatchObject({
      contentType: "image/png",
      objectKey: "areyouin/character-images/user/upload",
    });
  });

  it("rejects unsupported uploads", () => {
    expect(() =>
      validateCharacterImageUpload({
        contentType: "image/png",
        sizeBytes: 1000,
      }),
    ).not.toThrow();

    expect(() =>
      validateCharacterImageUpload({
        contentType: "image/gif",
        sizeBytes: 1000,
      }),
    ).toThrow("PNG");

    expect(() =>
      validateCharacterImageUpload({
        contentType: characterImageContentType,
        sizeBytes: maxCharacterImageBytes + 1,
      }),
    ).toThrow("2.5 MB");
  });

  it("rejects non-public or unexpected object metadata", () => {
    expect(() =>
      validateCharacterImageInput({
        url: "http://example.test/character.webp",
        bucket: "bucket",
        objectKey: "areyouin/character-images/user/upload.webp",
        contentType: characterImageContentType,
        sizeBytes: 1000,
        uploadedAt: "2026-05-02T00:00:00.000Z",
      }),
    ).toThrow("HTTPS");

    expect(() =>
      validateCharacterImageInput({
        url: "https://bucket.s3.amazonaws.com/private/upload.webp",
        bucket: "bucket",
        objectKey: "private/upload.webp",
        contentType: characterImageContentType,
        sizeBytes: 1000,
        uploadedAt: "2026-05-02T00:00:00.000Z",
      }),
    ).toThrow("key");
  });
});
