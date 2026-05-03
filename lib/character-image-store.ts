import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

  const { bucket, region } = getCharacterImageS3Config();
  const objectKey = createCharacterImageObjectKey({
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
    url: createPublicS3Url({ bucket, objectKey, region }),
  };
}

export function createCharacterImageObjectKey({
  clerkUserId,
  uploadId,
}: {
  clerkUserId: string;
  uploadId: string;
}): string {
  const safeUserId = clerkUserId.replaceAll(/[^a-zA-Z0-9._:-]/g, "-").slice(0, 120);

  return `areyouin/character-images/${safeUserId}/${uploadId}`;
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

function createPublicS3Url({
  bucket,
  objectKey,
  region,
}: {
  bucket: string;
  objectKey: string;
  region: string;
}): string {
  const encodedKey = objectKey.split("/").map(encodeURIComponent).join("/");

  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
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
