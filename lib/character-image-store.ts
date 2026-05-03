import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  characterImageContentType,
  type CharacterImageContentType,
  maxCharacterImageBytes,
  validateCharacterImageUpload,
  type CharacterImage,
} from "./character-image";

type WriteCharacterImageInput = {
  body: Uint8Array;
  clerkUserId: string;
  contentType?: CharacterImageContentType;
};

export async function writeCharacterImageObject({
  body,
  clerkUserId,
  contentType = characterImageContentType,
}: WriteCharacterImageInput): Promise<CharacterImage> {
  validateCharacterImageUpload({
    contentType,
    sizeBytes: body.byteLength,
  });

  const { bucket } = getCharacterImageS3Config();
  const objectKey = createCharacterImageObjectKey({
    contentType,
    clerkUserId,
    uploadId: randomUUID(),
  });

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    bucket,
    objectKey,
    contentType,
    sizeBytes: body.byteLength,
    uploadedAt: new Date().toISOString(),
    url: createAppCharacterImageUrl(objectKey),
  };
}

export async function readCharacterImageObject({
  objectKey,
}: {
  objectKey: string;
}): Promise<{ body: Uint8Array; contentType?: string }> {
  if (!objectKey.startsWith("areyouin/character-images/")) {
    throw new Error("Character image key is invalid.");
  }

  const { bucket } = getCharacterImageS3Config();
  const response = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );

  if (!response.Body) {
    throw new Error("S3 object did not include a body.");
  }

  return {
    body: await response.Body.transformToByteArray(),
    contentType: response.ContentType,
  };
}

export function createCharacterImageObjectKey({
  contentType = characterImageContentType,
  clerkUserId,
  uploadId,
}: {
  contentType?: CharacterImageContentType;
  clerkUserId: string;
  uploadId: string;
}): string {
  const safeUserId = clerkUserId.replaceAll(/[^a-zA-Z0-9._:-]/g, "-").slice(0, 120);

  return `areyouin/character-images/${safeUserId}/${uploadId}.${extensionFromContentType(contentType)}`;
}

function extensionFromContentType(contentType: CharacterImageContentType): string {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/jpeg") {
    return "jpg";
  }

  return "webp";
}

function getCharacterImageS3Config() {
  const bucket =
    process.env.S3_CHARACTER_IMAGES_BUCKET || process.env.S3_ARTIFACT_BUCKET;
  const region =
    process.env.S3_CHARACTER_IMAGES_REGION ||
    process.env.S3_ARTIFACT_REGION ||
    "us-east-1";

  if (!bucket) {
    throw new Error("S3_CHARACTER_IMAGES_BUCKET or S3_ARTIFACT_BUCKET is required.");
  }

  return { bucket, region };
}

function createAppCharacterImageUrl(objectKey: string): string {
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");

  return `/api/character-images/${encodedKey}`;
}

function getS3Client(): S3Client {
  const accessKeyId =
    process.env.S3_CHARACTER_IMAGES_ACCESS_KEY_ID ||
    process.env.S3_ARTIFACT_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.S3_CHARACTER_IMAGES_SECRET_ACCESS_KEY ||
    process.env.S3_ARTIFACT_SECRET_ACCESS_KEY;
  const region =
    process.env.S3_CHARACTER_IMAGES_REGION ||
    process.env.S3_ARTIFACT_REGION ||
    "us-east-1";

  return new S3Client({
    region,
    credentials:
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
  });
}

export { maxCharacterImageBytes };
