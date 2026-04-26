import { auth } from "@clerk/nextjs/server";
import { getTodayGame } from "@/lib/daily-game";
import {
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
    const todayGame = getTodayGame();
    const player = await submitOpeningResponseForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
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
