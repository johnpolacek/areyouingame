import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ClockIcon,
  MapPinIcon,
  RadioIcon,
} from "lucide-react";
import { notFound } from "next/navigation";
import { HeroBackgroundVideo } from "../../hero-background-video";
import {
  getPublicLiveGameSummaries,
  getPublicLivePlayersForGame,
} from "@/lib/live-browser";

export const dynamic = "force-dynamic";

export default async function LiveGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const dailyGameId = decodeURIComponent(gameId);
  const [games, players] = await Promise.all([
    getPublicLiveGameSummaries({ limit: 100 }),
    getPublicLivePlayersForGame(dailyGameId),
  ]);
  const game = games.find((candidate) => candidate.dailyGameId === dailyGameId);

  if (!game && players.length === 0) {
    notFound();
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8">
      <HeroBackgroundVideo />
      <div className="cinematic-vignette absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border/80 pb-6">
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            href="/live"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
            Live games
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                Game room
              </p>
              <h1 className="mt-2 break-words font-mono text-3xl font-semibold text-foreground sm:text-5xl">
                {dailyGameId}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Select a player to open their public gameplay transcript at a
                game and player-specific URL.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <Metric label="Players" value={players.length.toString()} />
              <Metric
                label="Events"
                value={(game?.activityCount ?? 0).toString()}
              />
            </div>
          </div>
        </header>

        {players.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <Link
                className="group grid min-h-80 gap-5 rounded-lg border border-border bg-card/80 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-card dark:bg-black/35 dark:shadow-black/35"
                href={`/live/${encodeURIComponent(dailyGameId)}/${encodeURIComponent(player.publicId)}`}
                key={player.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-2xl font-semibold text-foreground">
                        {player.name}
                      </h2>
                      {player.choice ? (
                        <span className="rounded-md border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-100">
                          {player.choice}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-muted-foreground">
                      <MapPinIcon aria-hidden="true" className="size-4 shrink-0 text-accent" />
                      {player.age}, {player.location}
                    </p>
                  </div>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
                  />
                </div>

                <p className="text-sm font-medium text-foreground/90">
                  {player.occupation}
                </p>
                <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                  {player.bio}
                </p>

                <div className="mt-auto grid grid-cols-2 gap-3 text-sm">
                  <CardStat
                    icon={<RadioIcon aria-hidden="true" className="size-4" />}
                    label="Turns"
                    value={player.turnCount.toString()}
                  />
                  <CardStat
                    icon={<ClockIcon aria-hidden="true" className="size-4" />}
                    label="Latest"
                    value={formatShortTime(player.lastActivityAt ?? player.updatedAt)}
                  />
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="rounded-lg border border-border bg-card/70 p-8 text-center shadow-2xl shadow-black/10 backdrop-blur-md dark:bg-black/25 dark:shadow-black/35">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Waiting for players
            </p>
            <p className="mt-3 text-lg font-medium text-foreground">
              Player cards will appear here once this game has public activity.
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
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function CardStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border/80 bg-background/55 px-3 py-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function formatShortTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
