import { getTodayGameForRequest } from "@/lib/daily-game";
import {
  correctCharacterInfoForUserGame,
  validateCharacterInfoCorrection,
} from "@/lib/player-store";
import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { correction?: unknown };
    const correction = validateCharacterInfoCorrection(body.correction);
    const todayGame = await getTodayGameForRequest();
    const player = await correctCharacterInfoForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      correction,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to correct character info.";

    return Response.json({ error: message }, { status: 400 });
  }
}
