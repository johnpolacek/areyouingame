import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { createFirstChoiceConsequence } from "@/lib/first-choice-consequence";
import {
  getPlayerForUserGame,
  submitFirstDecisionForUserGame,
  validateYesNoChoice,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { choice?: unknown };
    const choice = validateYesNoChoice(body.choice);
    const todayGame = await getTodayGameForRequest();
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (!existingPlayer.firstMoveReveal) {
      return Response.json(
        { error: "YES/NO reveal is required first." },
        { status: 400 },
      );
    }

    if (existingPlayer.firstDecision) {
      return Response.json(
        { error: "YES/NO choice has already been submitted." },
        { status: 409 },
      );
    }

    const consequence = await createFirstChoiceConsequence({
      choice,
      player: existingPlayer,
    });
    const player = await submitFirstDecisionForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      choice,
      consequence,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit YES/NO choice.";

    return Response.json({ error: message }, { status: 400 });
  }
}
