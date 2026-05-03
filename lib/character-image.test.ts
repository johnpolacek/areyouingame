import { describe, expect, it } from "vitest";
import {
  characterImageContentType,
  maxCharacterImageBytes,
  validateCharacterImageInput,
  validateCharacterImageUpload,
} from "./character-image";
import { createCharacterImageObjectKey } from "./character-image-store";

describe("character image", () => {
  it("creates extensioned object keys for public S3 access", () => {
    expect(
      createCharacterImageObjectKey({
        clerkUserId: "user_123",
        contentType: "image/png",
        uploadId: "upload-id",
      }),
    ).toBe("areyouin/character-images/user_123/upload-id.png");

    expect(
      createCharacterImageObjectKey({
        clerkUserId: "user_123",
        contentType: "image/jpeg",
        uploadId: "upload-id",
      }),
    ).toBe("areyouin/character-images/user_123/upload-id.jpg");
  });

  it("accepts supported public image metadata", () => {
    expect(
      validateCharacterImageInput({
        url: "/api/character-images/areyouin/character-images/user/upload.png",
        bucket: "areyouin-artifacts-dev",
        objectKey: "areyouin/character-images/user/upload.png",
        contentType: "image/png",
        sizeBytes: 1000,
        uploadedAt: "2026-05-02T00:00:00.000Z",
      }),
    ).toMatchObject({
      contentType: "image/png",
      objectKey: "areyouin/character-images/user/upload.png",
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
    ).toThrow("public HTTPS or app-hosted");

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
