import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import { getTodayGameForRequest } from "@/lib/daily-game";
import { acceptPublicGameplayAgreement } from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST() {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const todayGame = await getTodayGameForRequest();
    const player = await acceptPublicGameplayAgreement({
      clerkUserId: userId,
      dailyGameId: todayGame.id,
    });

    return Response.json({ player });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to accept agreement.";

    return Response.json({ error: message }, { status: 400 });
  }
}
