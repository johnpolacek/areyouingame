import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  formatCurrentTimeForTimeZone,
  getRequestTimeZone,
  getTodayGameForRequest,
  resolveValidTimeZone,
} from "@/lib/daily-game";
import { moderateTextOrThrow } from "@/lib/content-moderation";
import { createOpeningSceneContextQuestion } from "@/lib/opening-scene-context";
import {
  getPlayerForUserGame,
  submitOpeningResponseForUserGame,
  validateOpeningResponse,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      browserTimeZone?: unknown;
      openingResponse?: unknown;
    };
    const openingResponse = validateOpeningResponse(body.openingResponse);
    const submittedTimeZone =
      typeof body.browserTimeZone === "string"
        ? resolveValidTimeZone(body.browserTimeZone)
        : null;
    const requestTimeZone =
      submittedTimeZone ?? (await getRequestTimeZone()) ?? "UTC";
    const todayGame = await getTodayGameForRequest(new Date(), requestTimeZone);
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    await moderateTextOrThrow({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      playerId: existingPlayer.id,
      source: "opening_response",
      text: openingResponse,
    });

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
