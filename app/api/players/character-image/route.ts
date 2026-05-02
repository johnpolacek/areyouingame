import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { validateCharacterImageUpload } from "@/lib/character-image";
import { writeCharacterImageObject } from "@/lib/character-image-store";
import { updateCharacterImageForUserGame } from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      throw new Error("Character image is required.");
    }

    validateCharacterImageUpload({
      contentType: file.type,
      sizeBytes: file.size,
    });

    const image = await writeCharacterImageObject({
      body: new Uint8Array(await file.arrayBuffer()),
      clerkUserId: userId,
    });
    const shouldAttachToCurrentPlayer =
      formData.get("attachToCurrentPlayer") === "true";

    if (shouldAttachToCurrentPlayer) {
      const timeZone =
        typeof formData.get("timeZone") === "string"
          ? String(formData.get("timeZone"))
          : "UTC";
      const todayGame = await getTodayGameForRequest(new Date(), timeZone);
      const player = await updateCharacterImageForUserGame({
        clerkUserId: userId,
        dailyGameId: todayGame.id,
        characterImage: image,
      });

      return Response.json({ image, player });
    }

    return Response.json({ image });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload character image.";

    return Response.json({ error: message }, { status: 400 });
  }
}
