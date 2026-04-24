import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodayGame, getTodayGameDestination } from "../../lib/daily-game";

export default async function JoinTodaysGamePage() {
  const { userId } = await auth.protect();
  const todayGame = getTodayGame();
  const destination = await getTodayGameDestination(userId, todayGame.id);

  redirect(destination.href);
}
