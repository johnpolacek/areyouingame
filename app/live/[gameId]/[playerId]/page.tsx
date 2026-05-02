import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  MapPinIcon,
  RadioIcon,
} from "lucide-react";
import { notFound } from "next/navigation";
import { HeroBackgroundVideo } from "../../../hero-background-video";
import { CharacterInfoPanel } from "@/components/character-info-panel";
import { PlayerTurnImage } from "@/components/player-turn-image";
import { getPublicLivePlayer, type PublicLivePlayer } from "@/lib/live-browser";
import type {
  FirstConnectedAsiTurn,
  FirstConnectedPathTurn,
  FirstOrbDecisionTurn,
  FirstPostChoiceTurn,
  PlayerTurnImage as PlayerTurnImageState,
} from "@/lib/player-store";

export const dynamic = "force-dynamic";

type GameplayEntry = {
  id: string;
  at: string;
  label: string;
  title: string;
  playerText?: string;
  gameText?: string;
  narratorText?: string;
  meta?: string;
  turnImage?: PlayerTurnImageState;
};

export default async function LivePlayerPage({
  params,
}: {
  params: Promise<{ gameId: string; playerId: string }>;
}) {
  const { gameId, playerId } = await params;
  const dailyGameId = decodeURIComponent(gameId);
  const decodedPlayerId = decodeURIComponent(playerId);
  const player = await getPublicLivePlayer({
    dailyGameId,
    playerId: decodedPlayerId,
  });

  if (!player) {
    notFound();
  }

  const entries = buildGameplayEntries(player);

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8">
      <HeroBackgroundVideo />
      <div className="cinematic-vignette absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border/80 pb-6">
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            href={`/live/${encodeURIComponent(dailyGameId)}`}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            {dailyGameId}
          </Link>
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Player gameplay
              </p>
              <h1 className="mt-2 break-words text-3xl font-semibold text-foreground sm:text-5xl">
                {player.name}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm leading-6 text-muted-foreground sm:text-base">
                <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-accent" />
                {player.age}, {player.location} / {player.occupation}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {player.bio}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Choice" value={player.firstDecision?.choice ?? "-"} />
              <Metric label="Turns" value={entries.length.toString()} />
            </div>
          </div>
        </header>

        <CharacterInfoPanel
          characterInfo={player.characterInfo}
          title="Living Character Sheet"
        />

        {entries.length > 0 ? (
          <section className="grid gap-4">
            {entries.map((entry, index) => (
              <article
                className="overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl dark:bg-black/35 dark:shadow-black/35"
                key={entry.id}
              >
                <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {entry.label}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      {index + 1}. {entry.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    <CalendarClockIcon aria-hidden="true" className="size-4 text-accent" />
                    <time dateTime={entry.at}>{formatDateTime(entry.at)}</time>
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-5 sm:px-5">
                  {entry.gameText ? (
                    <TranscriptBlock label="Game" text={entry.gameText} />
                  ) : null}
                  {entry.playerText ? (
                    <TranscriptBlock label="Player" text={entry.playerText} />
                  ) : null}
                  {entry.turnImage ? (
                    <div className="max-w-md">
                      <PlayerTurnImage
                        image={entry.turnImage}
                        sourceTurnId={entry.id}
                      />
                    </div>
                  ) : null}
                  {entry.narratorText ? (
                    <TranscriptBlock label="Narrator" text={entry.narratorText} />
                  ) : null}
                  {entry.meta ? (
                    <div className="flex items-center gap-2 border-t border-border/70 pt-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      <RadioIcon aria-hidden="true" className="size-4 text-accent" />
                      {entry.meta}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-lg border border-border bg-card/70 p-8 text-center shadow-2xl shadow-black/10 backdrop-blur-md dark:bg-black/25 dark:shadow-black/35">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              No gameplay yet
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              This player exists, but has not submitted public gameplay turns.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function buildGameplayEntries(player: PublicLivePlayer): GameplayEntry[] {
  const entries: GameplayEntry[] = [];
  const imagesByTurnId = new Map(
    (player.turnImages ?? []).map((image) => [image.sourceTurnId, image]),
  );

  if (player.openingResponse && player.openingResponseSubmittedAt) {
    entries.push({
      id: `${player.id}:opening-response`,
      at: player.openingResponseSubmittedAt,
      label: "Opening",
      title: "Before we begin",
      playerText: player.openingResponse,
    });
  }

  if (player.openingSceneContext?.answerText && player.openingSceneContext.answeredAt) {
    entries.push({
      id: `${player.id}:opening-context`,
      at: player.openingSceneContext.answeredAt,
      label: "Opening context",
      title: player.openingSceneContext.promptText,
      playerText: player.openingSceneContext.answerText,
      meta: player.openingSceneContext.reason,
    });
  }

  if (player.firstMoveReveal) {
    entries.push({
      id: player.firstMoveReveal.id,
      at: player.firstMoveReveal.generatedAt,
      label: "Reveal",
      title: player.firstMoveReveal.revealCopy.question,
      gameText: [
        ...player.firstMoveReveal.sceneIntro,
        player.firstMoveReveal.revealCopy.availability,
        player.firstMoveReveal.revealCopy.promise,
      ].join("\n\n"),
      meta: player.firstMoveReveal.model,
    });
  }

  if (player.firstDecision) {
    entries.push({
      id: player.firstDecision.id,
      at: player.firstDecision.submittedAt,
      label: "Decision",
      title: player.firstDecision.consequenceTitle,
      playerText: player.firstDecision.choice,
      narratorText: player.firstDecision.consequenceBody,
      meta: player.firstDecision.consequenceModel,
    });
  }

  for (const response of player.firstRevealTextResponses ?? []) {
    entries.push({
      id: response.id,
      at: response.submittedAt,
      label: "Voice response",
      title: response.classification,
      playerText: response.inputText,
      narratorText: response.interruptionText ?? response.dayEndText,
      meta: response.model,
    });
  }

  for (const turn of player.firstPostChoiceTurns ?? []) {
    entries.push(postChoiceEntry(turn, imagesByTurnId));
  }

  for (const turn of player.firstConnectedPath?.turns ?? []) {
    entries.push(connectedPathEntry(turn, imagesByTurnId));
  }

  for (const turn of player.firstConnectedPath?.orbDecisionTurns ?? []) {
    entries.push(orbDecisionEntry(turn, imagesByTurnId));
  }

  for (const turn of player.firstConnectedPath?.connectedAsiTurns ?? []) {
    entries.push(connectedAsiEntry(turn, imagesByTurnId));
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

function postChoiceEntry(
  turn: FirstPostChoiceTurn,
  imagesByTurnId: Map<string, PlayerTurnImageState>,
): GameplayEntry {
  return {
    id: turn.id,
    at: turn.resolvedAt,
    label: `Turn ${turn.turnNumber}`,
    title: turn.sceneTitle,
    playerText: turn.actionText,
    narratorText: turn.responseText,
    meta: turn.actionKind,
    turnImage: imagesByTurnId.get(turn.id),
  };
}

function connectedPathEntry(
  turn: FirstConnectedPathTurn,
  imagesByTurnId: Map<string, PlayerTurnImageState>,
): GameplayEntry {
  return {
    id: turn.id,
    at: turn.resolvedAt,
    label: `Connected path ${turn.turnNumber}`,
    title: turn.sceneTitle ?? "Connected path",
    playerText: turn.actionText,
    narratorText: turn.responseText,
    meta: `${turn.deliveryStatus} / ${turn.packageStatus} / ${turn.orbStatus}`,
    turnImage: imagesByTurnId.get(turn.id),
  };
}

function orbDecisionEntry(
  turn: FirstOrbDecisionTurn,
  imagesByTurnId: Map<string, PlayerTurnImageState>,
): GameplayEntry {
  return {
    id: turn.id,
    at: turn.resolvedAt,
    label: `Orb ${turn.turnNumber}`,
    title: turn.sceneTitle ?? "Orb decision",
    playerText: turn.actionText,
    narratorText: turn.responseText,
    meta: turn.orbLifecycle,
    turnImage: imagesByTurnId.get(turn.id),
  };
}

function connectedAsiEntry(
  turn: FirstConnectedAsiTurn,
  imagesByTurnId: Map<string, PlayerTurnImageState>,
): GameplayEntry {
  return {
    id: turn.id,
    at: turn.resolvedAt,
    label: `ASI ${turn.turnNumber}`,
    title: turn.sceneTitle ?? "Connected ASI",
    playerText: turn.actionText,
    narratorText: turn.responseText,
    meta: turn.actionKind,
    turnImage: imagesByTurnId.get(turn.id),
  };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/80 bg-card/70 px-3 py-3 text-right backdrop-blur-md dark:bg-black/30">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-2xl font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function TranscriptBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <p className="whitespace-pre-line text-sm leading-6 text-foreground sm:text-base sm:leading-7">
        {text}
      </p>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
