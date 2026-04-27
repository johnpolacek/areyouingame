import { auth } from "@clerk/nextjs/server";
import { getTodayGame } from "@/lib/daily-game";
import {
  deletePlayerForUserGame,
  resetPlayerDayForUserGame,
} from "@/lib/player-store";

export const runtime = "nodejs";

type ResetMode = "day" | "full";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const todayGame = getTodayGame();
  const mode = await readResetMode(request);

  if (mode === "day") {
    const reset = await resetPlayerDayForUserGame(userId, todayGame.id);

    return Response.json({ mode, reset });
  }

  const deleted = await deletePlayerForUserGame(userId, todayGame.id);

  return Response.json({ mode, deleted });
}

async function readResetMode(request: Request): Promise<ResetMode> {
  try {
    const body = (await request.json()) as { mode?: unknown };

    return body.mode === "full" ? "full" : "day";
  } catch {
    return "day";
  }
}
