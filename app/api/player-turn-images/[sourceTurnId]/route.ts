import { readArtifactObject } from "@/lib/artifact-store";
import { getPublicPlayerTurnImage } from "@/lib/live-browser";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sourceTurnId: string }> },
) {
  const { sourceTurnId } = await params;
  const image = await getPublicPlayerTurnImage(decodeURIComponent(sourceTurnId));

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
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": object.contentType ?? image.contentType,
    },
  });
}
