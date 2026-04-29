import { auth } from "@clerk/nextjs/server";
import {
  formatCurrentTimeForTimeZone,
  getRequestTimeZone,
  getTodayGameForRequest,
} from "@/lib/daily-game";
import { createOpeningSceneContextQuestion } from "@/lib/opening-scene-context";
import {
  getPlayerForUserGame,
  submitOpeningResponseForUserGame,
  validateOpeningResponse,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { openingResponse?: unknown };
    const openingResponse = validateOpeningResponse(body.openingResponse);
    const requestTimeZone = (await getRequestTimeZone()) ?? "UTC";
    const todayGame = await getTodayGameForRequest(new Date(), requestTimeZone);
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    const localGameStart = formatCurrentTimeForTimeZone(requestTimeZone);
    const openingSceneContext = await createOpeningSceneContextQuestion({
      localGameStart,
      openingResponse,
      player: existingPlayer,
    });
    const player = await submitOpeningResponseForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      openingSceneContext,
      openingResponse,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit opening response.";

    return Response.json({ error: message }, { status: 400 });
  }
}
