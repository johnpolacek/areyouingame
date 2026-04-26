import { auth } from "@clerk/nextjs/server";
import { getTodayGame } from "@/lib/daily-game";
import {
  getPlayerForUserGame,
  submitFirstPostChoiceActionForUserGame,
  validateFirstPostChoiceAction,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { actionText?: unknown };
    const actionText = validateFirstPostChoiceAction(body.actionText);
    const todayGame = getTodayGame();
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (!existingPlayer.firstDecision) {
      return Response.json(
        { error: "YES/NO choice is required first." },
        { status: 400 },
      );
    }

    if (existingPlayer.firstPostChoiceAction) {
      return Response.json(
        { error: "First post-choice action has already been submitted." },
        { status: 409 },
      );
    }

    const player = await submitFirstPostChoiceActionForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      actionText,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit first post-choice action.";

    return Response.json({ error: message }, { status: 400 });
  }
}
