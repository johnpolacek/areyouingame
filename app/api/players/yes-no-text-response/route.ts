import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { createFirstChoiceConsequence } from "@/lib/first-choice-consequence";
import { classifyFirstRevealTextResponse } from "@/lib/first-reveal-text-response";
import {
  getPlayerForUserGame,
  submitFirstRevealTextResponseForUserGame,
  validateFirstRevealTextResponse,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { responseText?: unknown };
    const responseText = validateFirstRevealTextResponse(body.responseText);
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

    const classification = await classifyFirstRevealTextResponse({
      player: existingPlayer,
      responseText,
    });
    const consequence =
      classification.classification === "YES" ||
      classification.classification === "NO"
        ? await createFirstChoiceConsequence({
            choice: classification.classification,
            finalResponseText: responseText,
            player: existingPlayer,
          })
        : undefined;
    const player = await submitFirstRevealTextResponseForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      responseText,
      classification: classification.classification,
      model: classification.model,
      source: classification.source,
      interruptionText: classification.interruptionText,
      dayEndText: classification.dayEndText,
      consequence,
    });

    return Response.json({ player, classification: classification.classification });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit text response.";

    return Response.json({ error: message }, { status: 400 });
  }
}
