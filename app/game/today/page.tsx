import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SendIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroBackgroundVideo } from "../../hero-background-video";
import {
  formatGameStartForTimeZone,
  getTodayGame,
} from "../../../lib/daily-game";
import { getPlayerForUserGame } from "../../../lib/player-store";

export default async function TodaysGamePage() {
  const { userId } = await auth.protect();

  const todayGame = getTodayGame();
  const player = await getPlayerForUserGame(userId, todayGame.id);

  if (!player) {
    redirect("/player/new");
  }

  const localGameStart = formatGameStartForTimeZone(
    todayGame.eventStartsAtIso,
    player.timeZone,
  );

  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-black px-5 py-16 text-amber-50 sm:p-8">
      <HeroBackgroundVideo />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.24)_42%,rgba(0,0,0,0.86)_100%)]" />

      <section
        aria-labelledby="first-question-title"
        className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 text-center"
      >
        <Badge
          className="border-amber-300/30 bg-black/35 text-amber-100 shadow-lg shadow-black/30 backdrop-blur"
          variant="outline"
        >
          Game {todayGame.id}
        </Badge>
        <div className="grid gap-4">
          <p className="text-sm font-semibold tracking-[0.32em] text-amber-400 uppercase">
            Private Transmission
          </p>
          <h1
            id="first-question-title"
            className="hero-display-title bg-gradient-to-t from-amber-600/90 via-amber-500 to-amber-200 bg-clip-text text-5xl leading-none font-normal tracking-normal text-transparent sm:text-8xl"
          >
            Are You In?
          </h1>
        </div>

        <div className="grid w-full gap-6 rounded-lg border border-amber-600/35 bg-slate-950/45 p-4 text-left shadow-2xl shadow-black/35 backdrop-blur-md sm:p-7">
          <div className="grid gap-4 text-center">
            <p className="text-xl leading-8 font-medium text-amber-50 sm:text-3xl sm:leading-11">
              Hi {player.name}, it is{" "}
              <time dateTime={todayGame.eventStartsAtIso}>
                {localGameStart}
              </time>{" "}
              at {player.location}.
            </p>
            <p className="text-2xl leading-9 font-semibold text-amber-200 sm:text-4xl sm:leading-12">
              Where are you and what are you doing?
            </p>
          </div>

          <label className="grid gap-2 text-[0.68rem] font-bold tracking-[0.18em] text-amber-400 uppercase">
            Response
            <textarea
              className="min-h-36 resize-none rounded-md border border-amber-300/30 bg-black/45 px-4 py-3 text-base font-medium tracking-normal text-amber-50 outline-none transition placeholder:text-amber-700 focus:border-amber-200/70 focus:ring-2 focus:ring-amber-500/20"
              name="opening-response"
              placeholder="I am..."
            />
          </label>
        </div>

        <Button
          className="h-12 w-full max-w-sm border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-950 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-amber-50 uppercase shadow-2xl shadow-black/60 backdrop-blur-md hover:brightness-[1.15] sm:h-14"
          disabled
        >
          Send
          <SendIcon data-icon="inline-end" />
        </Button>
      </section>
    </main>
  );
}
