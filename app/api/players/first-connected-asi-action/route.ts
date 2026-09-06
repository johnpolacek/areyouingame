import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  buildDay1GameplayContextPayload,
  getOrCreateDay1StorylineContextForDailyGame,
} from "@/lib/day-1-storyline-context";
import { moderateTextOrThrow } from "@/lib/content-moderation";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { createFirstConnectedAsiTurnResponse } from "@/lib/first-connected-asi-response";
import {
  getPlayerForUserGame,
  submitFirstConnectedAsiTurnForUserGame,
  validateFirstConnectedAsiAction,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { actionText?: unknown };
    const actionText = validateFirstConnectedAsiAction(body.actionText);
    const todayGame = await getTodayGameForRequest();
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (existingPlayer.firstDecision?.choice !== "YES") {
      return Response.json(
        { error: "Connected ASI interaction is only available after YES." },
        { status: 400 },
      );
    }

    if (existingPlayer.firstConnectedPath?.orbLifecycle !== "orb_accepted") {
      return Response.json(
        { error: "The connected ASI interface is not available yet." },
        { status: 400 },
      );
    }

    if ((existingPlayer.firstConnectedPath.connectedAsiTurns ?? []).length > 0) {
      return Response.json({ player: existingPlayer });
    }

    await moderateTextOrThrow({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      playerId: existingPlayer.id,
      source: "connected_asi_action",
      text: actionText,
    });

    const day1StorylineContext =
      await getOrCreateDay1StorylineContextForDailyGame(todayGame.id);
    const day1GameplayContext = buildDay1GameplayContextPayload({
      dailyGame: todayGame,
      player: existingPlayer,
      storylineContext: day1StorylineContext,
    });
    const generatedResponse = await createFirstConnectedAsiTurnResponse({
      actionText,
      dailyGame: todayGame,
      day1GameplayContext,
      storylineContext: day1StorylineContext,
      player: existingPlayer,
    });
    const player = await submitFirstConnectedAsiTurnForUserGame({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      actionText,
      responseText: generatedResponse.responseText,
      sceneTitle: generatedResponse.sceneTitle,
      responseModel: generatedResponse.responseModel,
      responseSource: generatedResponse.responseSource,
      actionKind: generatedResponse.actionKind,
      playerVisibleFacts: generatedResponse.playerVisibleFacts,
      characterInfoUpdates: generatedResponse.characterInfoUpdates,
      storylineContextSourceVersion:
        generatedResponse.storylineContextSourceVersion,
      expectedTurnNumber: generatedResponse.expectedTurnNumber,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit connected ASI action.";

    return Response.json({ error: message }, { status: 400 });
  }
}
