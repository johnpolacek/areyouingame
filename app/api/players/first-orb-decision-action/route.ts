import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  buildDay1GameplayContextPayload,
  getOrCreateDay1StorylineContextForDailyGame,
} from "@/lib/day-1-storyline-context";
import { moderateTextOrThrow } from "@/lib/content-moderation";
import { getTodayGameForRequest } from "@/lib/daily-game";
import {
  createFirstOrbDecisionTurnResponse,
  getCurrentOrbLifecycle,
} from "@/lib/first-orb-decision-response";
import {
  getPlayerForUserGame,
  submitFirstOrbDecisionTurnForUserGame,
  validateFirstOrbDecisionAction,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { actionText?: unknown };
    const actionText = validateFirstOrbDecisionAction(body.actionText);
    const todayGame = await getTodayGameForRequest();
    const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

    if (!existingPlayer) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    if (existingPlayer.firstDecision?.choice !== "YES") {
      return Response.json(
        { error: "Orb decision is only available after YES." },
        { status: 400 },
      );
    }

    const firstConnectedPath = existingPlayer.firstConnectedPath;
    const currentOrbLifecycle = getCurrentOrbLifecycle(firstConnectedPath);

    if (
      !firstConnectedPath ||
      firstConnectedPath.packageStatus !== "opened" ||
      firstConnectedPath.orbStatus !== "revealed" ||
      !currentOrbLifecycle
    ) {
      return Response.json(
        { error: "The orb is not available yet." },
        { status: 400 },
      );
    }

    if (
      currentOrbLifecycle === "orb_accepted" ||
      currentOrbLifecycle === "orb_lost"
    ) {
      return Response.json({ player: existingPlayer });
    }

    await moderateTextOrThrow({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      playerId: existingPlayer.id,
      source: "orb_decision_action",
      text: actionText,
    });

    const day1StorylineContext =
      await getOrCreateDay1StorylineContextForDailyGame(todayGame.id);
    const day1GameplayContext = buildDay1GameplayContextPayload({
      dailyGame: todayGame,
      player: existingPlayer,
      storylineContext: day1StorylineContext,
    });
    const generatedResponse = await createFirstOrbDecisionTurnResponse({
      actionText,
      dailyGame: todayGame,
      day1GameplayContext,
      storylineContext: day1StorylineContext,
      player: existingPlayer,
    });
    const player = await submitFirstOrbDecisionTurnForUserGame({
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
      orbLifecycle: generatedResponse.orbLifecycle,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit orb decision action.";

    return Response.json({ error: message }, { status: 400 });
  }
}
