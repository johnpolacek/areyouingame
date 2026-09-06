import { readCharacterImageObject } from "@/lib/character-image-store";
import { getPublicCharacterImageStorage } from "@/lib/live-browser";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const image = await getPublicCharacterImageStorage(publicId);
  if (!image) return new Response("Not found", { status: 404 });

  try {
    const object = await readCharacterImageObject({
      objectKey: image.objectKey,
    });
    return new Response(Buffer.from(object.body), {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": image.contentType,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
