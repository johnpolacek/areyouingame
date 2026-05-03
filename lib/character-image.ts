export const characterImageContentType = "image/webp";
export const characterImageContentTypes = [
  "image/webp",
  "image/png",
  "image/jpeg",
] as const;
export const maxCharacterImageBytes = 2_500_000;

export type CharacterImageContentType = (typeof characterImageContentTypes)[number];

export type CharacterImage = {
  url: string;
  bucket: string;
  objectKey: string;
  contentType: CharacterImageContentType;
  sizeBytes: number;
  uploadedAt: string;
};

export type CharacterImageInput = CharacterImage;

export function validateCharacterImageInput(input: unknown): CharacterImageInput {
  if (!input || typeof input !== "object") {
    throw new Error("Character image is required.");
  }

  const source = input as Record<string, unknown>;
  const image = {
    url: readRequiredString(source.url, "Character image URL", 2048),
    bucket: readRequiredString(source.bucket, "Character image bucket", 160),
    objectKey: readRequiredString(source.objectKey, "Character image key", 512),
    contentType: readRequiredString(source.contentType, "Character image type", 40),
    sizeBytes: readSizeBytes(source.sizeBytes),
    uploadedAt: readRequiredString(source.uploadedAt, "Character image upload time", 80),
  };

  if (!isCharacterImageContentType(image.contentType)) {
    throw new Error("Character image must be WebP, PNG, or JPEG.");
  }

  if (!image.url.startsWith("https://")) {
    throw new Error("Character image URL must be public HTTPS.");
  }

  if (!image.objectKey.startsWith("areyouin/character-images/")) {
    throw new Error("Character image key is invalid.");
  }

  return {
    ...image,
    contentType: image.contentType,
  };
}

export function validateCharacterImageUpload({
  contentType,
  sizeBytes,
}: {
  contentType: string;
  sizeBytes: number;
}) {
  if (!isCharacterImageContentType(contentType)) {
    throw new Error("Upload a WebP, PNG, or JPEG character image.");
  }

  if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
    throw new Error("Character image is empty.");
  }

  if (sizeBytes > maxCharacterImageBytes) {
    throw new Error("Character image must be 2.5 MB or smaller.");
  }
}

export function isCharacterImageContentType(
  contentType: string,
): contentType is CharacterImageContentType {
  return characterImageContentTypes.includes(
    contentType as CharacterImageContentType,
  );
}

function readRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new Error(`${label} is required.`);
  }

  const text = value.trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function readSizeBytes(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error("Character image size is required.");
  }

  return value;
}
