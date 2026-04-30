import { auth } from "@clerk/nextjs/server";
import {
  buildDay1GameplayContextPayload,
  getOrCreateDay1StorylineContextForDailyGame,
} from "@/lib/day-1-storyline-context";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { createFirstConnectedPathTurnResponse } from "@/lib/first-connected-path-response";
import {
  getPlayerForUserGame,
  submitFirstConnectedPathTurnForUserGame,
  validateFirstConnectedPathAction,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { actionText?: unknown };
    const actionText = validateFirstConnectedPathAction(body.actionText);
    const todayGame = await getTodayGameForRequest();
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

    if (existingPlayer.firstDecision.choice !== "YES") {
      return Response.json(
        { error: "The connected path is only available after YES." },
        { status: 400 },
      );
    }

    if (existingPlayer.firstConnectedPath?.orbStatus === "revealed") {
      return Response.json({ player: existingPlayer });
    }

    const day1StorylineContext =
      await getOrCreateDay1StorylineContextForDailyGame(todayGame.id);
    const day1GameplayContext = buildDay1GameplayContextPayload({
      dailyGame: todayGame,
      player: existingPlayer,
      storylineContext: day1StorylineContext,
    });
    const generatedResponse = await createFirstConnectedPathTurnResponse({
      actionText,
      dailyGame: todayGame,
      day1GameplayContext,
      storylineContext: day1StorylineContext,
      player: existingPlayer,
    });
    const player = await submitFirstConnectedPathTurnForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      actionText,
      responseText: generatedResponse.responseText,
      sceneTitle: generatedResponse.sceneTitle,
      responseModel: generatedResponse.responseModel,
      responseSource: generatedResponse.responseSource,
      actionKind: generatedResponse.actionKind,
      playerVisibleFacts: generatedResponse.playerVisibleFacts,
      storylineContextSourceVersion:
        generatedResponse.storylineContextSourceVersion,
      expectedTurnNumber: generatedResponse.expectedTurnNumber,
      status: generatedResponse.status,
      deliveryStatus: generatedResponse.deliveryStatus,
      packageStatus: generatedResponse.packageStatus,
      orbStatus: generatedResponse.orbStatus,
    });

    return Response.json({ day1GameplayContext, player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit connected path action.";

    return Response.json({ error: message }, { status: 400 });
  }
}
