import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HeroBackgroundVideo } from "../../hero-background-video";
import {
  formatGameStartForTimeZone,
  getTodayGameForRequest,
} from "../../../lib/daily-game";
import { getPlayerForUserGame } from "../../../lib/player-store";
import { BeforeWeBegin } from "./before-we-begin";
import { DevResetPlayerButton } from "./dev-reset-player-button";
import {
  FirstChoiceConsequence,
  FirstMoveReveal,
  FirstMoveRevealPending,
} from "./first-move-reveal";
import { OpeningPrompt, OpeningSceneContextPrompt } from "./opening-prompt";

export default async function TodaysGamePage() {
  const { userId } = await auth.protect();

  const todayGame = await getTodayGameForRequest();
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
      {process.env.NODE_ENV === "development" ? (
        <DevResetPlayerButton />
      ) : null}

      {player.firstDecision ? (
        <FirstChoiceConsequence
          decision={player.firstDecision}
          firstConnectedPath={player.firstConnectedPath}
          firstPostChoiceAction={player.firstPostChoiceAction}
        />
      ) : player.firstMoveReveal ? (
        <FirstMoveReveal
          firstRevealTextResponses={player.firstRevealTextResponses}
          reveal={player.firstMoveReveal}
        />
      ) : player.openingSceneContext?.status === "question_pending" ? (
        <OpeningSceneContextPrompt question={player.openingSceneContext} />
      ) : player.openingResponseSubmittedAt && player.openingResponse ? (
        <FirstMoveRevealPending />
      ) : player.publicGameplayAgreementAcceptedAt ? (
        <OpeningPrompt
          eventStartsAtIso={todayGame.eventStartsAtIso}
          localGameStart={localGameStart}
          playerLocation={player.location}
          playerName={player.name}
        />
      ) : (
        <BeforeWeBegin />
      )}
    </main>
  );
}
