import { redirect } from "next/navigation";
import { HeroBackgroundVideo } from "../../hero-background-video";
import {
  formatCurrentTimeForTimeZone,
  getRequestTimeZone,
  getTodayGameForRequest,
} from "../../../lib/daily-game";
import { cn } from "../../../lib/utils";
import {
  getDailyGameStats,
  getPlayerForUserGame,
} from "../../../lib/player-store";
import { getAuthenticatedUserId } from "../../../lib/playtest-auth";
import { BeforeWeBegin } from "./before-we-begin";
import { DevResetPlayerButton } from "./dev-reset-player-button";
import {
  FirstChoiceConsequence,
  FirstMoveReveal,
  FirstMoveRevealPending,
} from "./first-move-reveal";
import { OpeningPrompt, OpeningSceneContextPrompt } from "./opening-prompt";

export default async function TodaysGamePage() {
  const userId = await getAuthenticatedUserId();

  const requestTimeZone = (await getRequestTimeZone()) ?? "UTC";
  const todayGame = await getTodayGameForRequest(new Date(), requestTimeZone);
  const [player, dailyGameStats] = await Promise.all([
    getPlayerForUserGame(userId, todayGame.id),
    getDailyGameStats(todayGame.id),
  ]);

  if (!player) {
    redirect("/player/new");
  }

  const currentTime = new Date();
  const localGameStart = formatCurrentTimeForTimeZone(
    requestTimeZone,
    currentTime,
  );
  const hasConsoleLayout = Boolean(
    player.firstPostChoiceAction?.responseText ||
      (player.firstPostChoiceTurns?.length ?? 0) > 0 ||
      (player.firstConnectedPath?.turns.length ?? 0) > 0 ||
      (player.firstConnectedPath?.orbDecisionTurns?.length ?? 0) > 0,
  );

  return (
    <main
      className={cn(
        "relative isolate bg-background px-5 text-foreground sm:p-8",
        hasConsoleLayout
          ? "h-svh overflow-hidden py-6"
          : "grid min-h-svh place-items-center overflow-hidden py-16",
      )}
    >
      <HeroBackgroundVideo />
      <div className="cinematic-vignette absolute inset-0 z-[1]" />
      {process.env.NODE_ENV === "development" ? (
        <DevResetPlayerButton />
      ) : null}

      {player.firstDecision ? (
        <FirstChoiceConsequence
          dailyGameStats={dailyGameStats}
          characterImage={player.characterImage}
          characterInfo={player.characterInfo}
          decision={player.firstDecision}
          firstConnectedPath={player.firstConnectedPath}
          firstPostChoiceAction={player.firstPostChoiceAction}
          firstPostChoiceTurns={player.firstPostChoiceTurns}
          localTime={localGameStart}
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
          currentTimeIso={currentTime.toISOString()}
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
