import { getTodayGameForRequest } from "@/lib/daily-game";
import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { generatePlayerTurnImage } from "@/lib/player-turn-images";
import { getPlayerForUserGame } from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { sourceTurnId?: unknown };
    const sourceTurnId =
      typeof body.sourceTurnId === "string" ? body.sourceTurnId.trim() : "";

    if (!sourceTurnId) {
      return Response.json(
        { error: "Source turn id is required." },
        { status: 400 },
      );
    }

    const todayGame = await getTodayGameForRequest();
    const player = await getPlayerForUserGame(userId, todayGame.id);

    if (!player) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    const image = await generatePlayerTurnImage({
      clerkUserId: userId,
      dailyGame: todayGame,
      player,
      sourceTurnId,
    });

    return Response.json({ image });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate turn image.";

    return Response.json({ error: message }, { status: 400 });
  }
}
