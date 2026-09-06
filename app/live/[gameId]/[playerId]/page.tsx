import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  MapPinIcon,
} from "lucide-react";
import { notFound } from "next/navigation";
import { HeroBackgroundVideo } from "../../../hero-background-video";
import { CharacterInfoPanel } from "@/components/character-info-panel";
import { PlayerTurnImage } from "@/components/player-turn-image";
import { getPublicLivePlayer } from "@/lib/live-browser";

export const dynamic = "force-dynamic";

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
            <div className="grid gap-3">
              {player.characterImage ? (
                <div className="aspect-square overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-black/10 dark:bg-black/35">
                  <img
                    alt={`${player.name} character portrait`}
                    className="h-full w-full object-cover"
                    src={player.characterImage.url}
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Choice" value={player.choice ?? "-"} />
                <Metric label="Turns" value={player.turnCount.toString()} />
              </div>
            </div>
          </div>
        </header>

        <CharacterInfoPanel
          characterInfo={player.characterInfo}
          title="Living Character Sheet"
        />

        <Link className="text-sm font-semibold underline" href={`/live/${encodeURIComponent(dailyGameId)}/${encodeURIComponent(decodedPlayerId)}/history`}>
          Browse full activity history
        </Link>
        {player.transcript.length > 0 ? (
          <section className="grid gap-4">
            {player.transcript.map((entry, index) => (
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
                        sourceTurnId={entry.turnImage.sourceTurnId}
                      />
                    </div>
                  ) : null}
                  {entry.narratorText ? (
                    <TranscriptBlock label="Narrator" text={entry.narratorText} />
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
