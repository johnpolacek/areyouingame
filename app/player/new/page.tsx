import { HeroBackgroundVideo } from "@/app/hero-background-video";
import { redirect } from "next/navigation";
import { getTodayGameForRequest } from "../../../lib/daily-game";
import { getAuthenticatedUserId } from "../../../lib/playtest-auth";
import { getPlayerForUserGame } from "../../../lib/player-store";
import { NewPlayerForm } from "./new-player-form";

export default async function NewPlayerPage() {
  const userId = await getAuthenticatedUserId();

  const todayGame = await getTodayGameForRequest();
  const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

  if (existingPlayer) {
    redirect("/game/today");
  }

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-background px-5 py-16 text-foreground sm:p-8">
      <HeroBackgroundVideo />
      <NewPlayerForm successHref="/game/today" />
    </main>
  );
}
