import { readArtifactObject } from "@/lib/artifact-store";
import { getPublicPlayerTurnImage } from "@/lib/live-browser";

import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sourceTurnId: string }> },
) {
  const { sourceTurnId } = await params;
  const userId = await getOptionalAuthenticatedUserId();
  const image = await getPublicPlayerTurnImage(
    decodeURIComponent(sourceTurnId),
    userId ?? undefined,
  );

  if (
    !image ||
    image.status !== "ready" ||
    !image.objectKey ||
    !image.contentType
  ) {
    return new Response("Not found", { status: 404 });
  }

  const object = await readArtifactObject({
    ...(image.bucket ? { bucket: image.bucket } : {}),
    objectKey: image.objectKey,
  });

  return new Response(Buffer.from(object.body), {
    headers: {
      "Cache-Control":
        sourceTurnId === image.sourceTurnId
          ? "public, max-age=31536000, immutable"
          : "private, no-store",
      "Content-Type": object.contentType ?? image.contentType,
    },
  });
}
