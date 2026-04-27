import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getTodayGameDestination,
  getTodayGameForRequest,
} from "../../lib/daily-game";
import { JoinFlow } from "./join-flow";

export default async function JoinTodaysGamePage() {
  const { userId } = await auth.protect();
  const todayGame = await getTodayGameForRequest();
  const destination = await getTodayGameDestination(userId, todayGame.id);

  if (destination.reason === "has-player") {
    redirect(destination.href);
  }

  return <JoinFlow fallbackHref={destination.href} successHref="/game/today" />;
}
