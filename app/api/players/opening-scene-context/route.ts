import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import {
  answerOpeningSceneContextForUserGame,
  validateOpeningSceneContextAnswer,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { answerText?: unknown };
    const answerText = validateOpeningSceneContextAnswer(body.answerText);
    const todayGame = await getTodayGameForRequest();
    const player = await answerOpeningSceneContextForUserGame({
      answerText,
      clerkUserId: userId,
      dailyGameId: todayGame.id,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit scene context.";

    return Response.json({ error: message }, { status: 400 });
  }
}
