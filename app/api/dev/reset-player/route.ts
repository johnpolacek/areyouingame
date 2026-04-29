import { auth } from "@clerk/nextjs/server";
import {
  clearDevTodayGameReroll,
  getRequestTimeZone,
  getTodayGameForRequest,
  rerollTodayGameForRequest,
  resolveValidTimeZone,
} from "@/lib/daily-game";
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

  const body = await readResetRequest(request);
  const requestTimeZone =
    body.browserTimeZone ?? (await getRequestTimeZone()) ?? "UTC";
  const todayGame = await getTodayGameForRequest(new Date(), requestTimeZone);

  if (body.mode === "day") {
    const reset = await resetPlayerDayForUserGame(userId, todayGame.id);
    const rerolledGame = await rerollTodayGameForRequest(
      new Date(),
      requestTimeZone,
    );

    return Response.json({ mode: body.mode, reset, todayGame: rerolledGame });
  }

  await clearDevTodayGameReroll();
  const deleted = await deletePlayerForUserGame(userId, todayGame.id);

  return Response.json({ mode: body.mode, deleted });
}

async function readResetRequest(
  request: Request,
): Promise<{ browserTimeZone: string | null; mode: ResetMode }> {
  try {
    const body = (await request.json()) as {
      browserTimeZone?: unknown;
      mode?: unknown;
    };

    return {
      browserTimeZone:
        typeof body.browserTimeZone === "string"
          ? resolveValidTimeZone(body.browserTimeZone)
          : null,
      mode: body.mode === "full" ? "full" : "day",
    };
  } catch {
    return { browserTimeZone: null, mode: "day" };
  }
}
