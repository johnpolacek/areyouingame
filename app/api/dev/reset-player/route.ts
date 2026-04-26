import { auth } from "@clerk/nextjs/server";
import { getTodayGame } from "@/lib/daily-game";
import { deletePlayerForUserGame } from "@/lib/player-store";

export const runtime = "nodejs";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const todayGame = getTodayGame();
  const deleted = await deletePlayerForUserGame(userId, todayGame.id);

  return Response.json({ deleted });
}
