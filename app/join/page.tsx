import { redirect } from "next/navigation";
import {
  getTodayGameDestination,
  getTodayGameForRequest,
} from "../../lib/daily-game";
import { getAuthenticatedUserId } from "../../lib/playtest-auth";
import { JoinFlow } from "./join-flow";

export default async function JoinTodaysGamePage() {
  const userId = await getAuthenticatedUserId();
  const todayGame = await getTodayGameForRequest();
  const destination = await getTodayGameDestination(userId, todayGame.id);

  if (destination.reason === "has-player") {
    redirect(destination.href);
  }

  return <JoinFlow fallbackHref={destination.href} successHref="/game/today" />;
}
