import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type ArtifactType =
  | "source_import"
  | "daily_recap_snapshot"
  | "event_export_bundle"
  | "narrative_memory_bundle"
  | "audit_bundle"
  | "player_turn_image";

export type ArtifactObject = {
  bucket: string;
  contentType: string;
  objectKey: string;
  version: string;
};

type WriteArtifactInput = {
  body: string | Uint8Array;
  contentType: string;
  dailyGameId?: string;
  extension?: string;
  type: ArtifactType;
  version?: string;
};

export function createArtifactObjectKey({
  dailyGameId,
  extension = "json",
  type,
  version = new Date().toISOString(),
}: {
  dailyGameId?: string;
  extension?: string;
  type: ArtifactType;
  version?: string;
}): string {
  const safeVersion = version.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
  const safeExtension = extension.replaceAll(/[^a-zA-Z0-9]/g, "") || "json";
  const scope = dailyGameId ? `daily-games/${dailyGameId}` : "global";

  return `areyouin/${scope}/artifacts/${type}/${safeVersion}.${safeExtension}`;
}

export async function writeArtifactObject({
  body,
  contentType,
  dailyGameId,
  extension,
  type,
  version = new Date().toISOString(),
}: WriteArtifactInput): Promise<ArtifactObject> {
  const bucket = getRequiredEnv("S3_ARTIFACT_BUCKET");
  const objectKey = createArtifactObjectKey({
    dailyGameId,
    extension,
    type,
    version,
  });

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    bucket,
    contentType,
    objectKey,
    version,
  };
}

export async function readArtifactObject({
  bucket = getRequiredEnv("S3_ARTIFACT_BUCKET"),
  objectKey,
}: {
  bucket?: string;
  objectKey: string;
}): Promise<{ body: Uint8Array; contentType?: string }> {
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

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_ARTIFACT_REGION || "us-east-1",
    credentials:
      process.env.S3_ARTIFACT_ACCESS_KEY_ID &&
      process.env.S3_ARTIFACT_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ARTIFACT_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_ARTIFACT_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
