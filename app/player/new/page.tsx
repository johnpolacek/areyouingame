import { auth } from "@clerk/nextjs/server";
import { HeroBackgroundVideo } from "@/app/hero-background-video";
import { redirect } from "next/navigation";
import { getTodayGame } from "../../../lib/daily-game";
import { getPlayerForUserGame } from "../../../lib/player-store";
import { NewPlayerForm } from "./new-player-form";

export default async function NewPlayerPage() {
  const { userId } = await auth.protect();

  const todayGame = getTodayGame();
  const existingPlayer = await getPlayerForUserGame(userId, todayGame.id);

  if (existingPlayer) {
    redirect("/game/today");
  }

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-black px-5 py-16 text-amber-50 sm:p-8">
      <HeroBackgroundVideo />
      <NewPlayerForm
        eventStartsAtIso={todayGame.eventStartsAtIso}
        eventStartsAtLabel={todayGame.eventStartsAtLabel}
        gameId={todayGame.id}
        successHref="/game/today"
      />
    </main>
  );
}
