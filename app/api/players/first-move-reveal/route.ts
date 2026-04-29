import { auth } from "@clerk/nextjs/server";
import {
  formatPlayerGameStartForTimeZone,
  getTodayGameForRequest,
} from "@/lib/daily-game";
import { generateFirstMoveReveal } from "@/lib/first-move-reveal";
import {
  getPlayerForUserGame,
  saveFirstMoveRevealForUserGame,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayGame = await getTodayGameForRequest();
    const player = await getPlayerForUserGame(userId, todayGame.id);

    if (!player) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (player.firstMoveReveal) {
      return Response.json({ player });
    }

    if (!player.openingResponseSubmittedAt || !player.openingResponse) {
      return Response.json(
        { error: "Opening response is required first." },
        { status: 400 },
      );
    }

    if (player.openingSceneContext?.status === "question_pending") {
      return Response.json(
        { error: "Opening scene context is required first." },
        { status: 400 },
      );
    }

    const localGameStart = formatPlayerGameStartForTimeZone(player);
    const reveal = await generateFirstMoveReveal({
      dailyGame: todayGame,
      localGameStart,
      player,
    });
    const updatedPlayer = await saveFirstMoveRevealForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      reveal,
    });

    return Response.json({ player: updatedPlayer });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate first move reveal.";

    return Response.json({ error: message }, { status: 400 });
  }
}
