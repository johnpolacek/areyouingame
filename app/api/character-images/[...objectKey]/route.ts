import { isCharacterImageContentType } from "@/lib/character-image";
import { readCharacterImageObject } from "@/lib/character-image-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ objectKey: string[] }> },
) {
  const { objectKey: objectKeyParts } = await params;
  const objectKey = objectKeyParts.map(decodeURIComponent).join("/");

  if (!objectKey.startsWith("areyouin/character-images/")) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const object = await readCharacterImageObject({ objectKey });
    const contentType = object.contentType ?? contentTypeFromObjectKey(objectKey);

    if (!isCharacterImageContentType(contentType)) {
      return new Response("Unsupported image type", { status: 415 });
    }

    return new Response(Buffer.from(object.body), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

function contentTypeFromObjectKey(objectKey: string) {
  if (objectKey.endsWith(".png")) {
    return "image/png";
  }

  if (objectKey.endsWith(".jpg") || objectKey.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "image/webp";
}
