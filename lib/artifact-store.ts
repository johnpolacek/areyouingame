import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type ArtifactType =
  | "source_import"
  | "daily_recap_snapshot"
  | "event_export_bundle"
  | "narrative_memory_bundle"
  | "audit_bundle";

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
  type: ArtifactType;
  version?: string;
};

export function createArtifactObjectKey({
  dailyGameId,
  type,
  version = new Date().toISOString(),
}: {
  dailyGameId?: string;
  type: ArtifactType;
  version?: string;
}): string {
  const safeVersion = version.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
  const scope = dailyGameId ? `daily-games/${dailyGameId}` : "global";

  return `areyouin/${scope}/artifacts/${type}/${safeVersion}.json`;
}

export async function writeArtifactObject({
  body,
  contentType,
  dailyGameId,
  type,
  version = new Date().toISOString(),
}: WriteArtifactInput): Promise<ArtifactObject> {
  const bucket = getRequiredEnv("S3_ARTIFACT_BUCKET");
  const objectKey = createArtifactObjectKey({ dailyGameId, type, version });

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
