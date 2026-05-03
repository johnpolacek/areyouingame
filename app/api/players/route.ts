import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { moderateCharacterDraftOrThrow } from "@/lib/content-moderation";
import {
  createPlayerForUserGame,
  validatePlayerDraft,
} from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { draft?: unknown };
    const draft = validatePlayerDraft(body.draft);
    const todayGame = await getTodayGameForRequest(new Date(), draft.timeZone);

    await moderateCharacterDraftOrThrow({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
      draft,
    });

    const player = await createPlayerForUserGame({
      clerkUserId: userId,
      dailyGame: todayGame,
      draft,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create character.";

    return Response.json({ error: message }, { status: 400 });
  }
}
