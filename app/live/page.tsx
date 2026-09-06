import Link from "next/link";
import type { ReactNode } from "react";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  RadioIcon,
  UsersIcon,
} from "lucide-react";
import { HeroBackgroundVideo } from "../hero-background-video";
import {
  getPublicActivityEvents,
  getPublicGamesPage,
  type PublicActivityEvent,
} from "@/lib/live-browser";

export const dynamic = "force-dynamic";

export default async function LiveGamesPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const { cursor } = await searchParams;
  const [result, recentActivity] = await Promise.all([
    getPublicGamesPage(cursor ?? null),
    getPublicActivityEvents({ limit: 12 }),
  ]);

  const games = result.page;
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8">
      <HeroBackgroundVideo />
      <div className="cinematic-vignette absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Live
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-5xl">
              Public game rooms
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Browse the active public games, then open a room to inspect each
              player&apos;s visible gameplay path.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card/70 px-4 text-sm font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-card dark:bg-black/30"
            href="/game/today"
          >
            Open game
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </header>

        {games.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {games.map((game) => (
                <Link
                  className="group grid gap-5 rounded-lg border border-border bg-card/80 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-card dark:bg-black/35 dark:shadow-black/35"
                  href={`/live/${encodeURIComponent(game.dailyGameId)}`}
                  key={game.dailyGameId}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <CalendarDaysIcon
                          aria-hidden="true"
                          className="size-4 text-accent"
                        />
                        {game.eventStartsAtLabel}
                      </p>
                      <h2 className="mt-3 break-words font-mono text-xl font-semibold text-foreground">
                        {game.dailyGameId}
                      </h2>
                    </div>
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground transition group-hover:text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      icon={<UsersIcon aria-hidden="true" className="size-4" />}
                      label="Players"
                      value={game.playerCount.toString()}
                    />
                    <Metric
                      icon={<RadioIcon aria-hidden="true" className="size-4" />}
                      label="Events"
                      value={game.activityCount.toString()}
                    />
                  </div>

                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Last activity{" "}
                    <span className="normal-case tracking-normal text-foreground/80">
                      {formatDateTime(game.lastActivityAt ?? game.updatedAt)}
                    </span>
                  </p>
                </Link>
              ))}
            </section>
            <RecentActivity events={recentActivity} />
          </div>
        ) : (
          <EmptyState
            title="No public games yet"
            body="Create a player or run a persona playtest to populate the live browser."
          />
        )}
        <nav aria-label="Game pages" className="flex gap-6 text-sm font-semibold underline">
          {cursor && <Link href="/live">Latest games</Link>}
          {!result.isDone && <Link href={`/live?cursor=${encodeURIComponent(result.continueCursor)}`}>More games</Link>}
        </nav>
      </div>
    </main>
  );
}

function RecentActivity({ events }: { events: PublicActivityEvent[] }) {
  return (
    <aside className="grid h-fit gap-3 rounded-lg border border-border bg-card/80 p-4 shadow-2xl shadow-black/10 backdrop-blur-xl dark:bg-black/35 dark:shadow-black/35">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Feed
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Recent activity
          </h2>
        </div>
        <ActivityIcon aria-hidden="true" className="size-5 text-muted-foreground" />
      </div>
      {events.length > 0 ? (
        <div className="grid gap-2">
          {events.map((event) => {
            const href = event.playerId
              ? `/live/${encodeURIComponent(event.dailyGameId)}/${encodeURIComponent(event.playerId)}`
              : `/live/${encodeURIComponent(event.dailyGameId)}`;

            return (
              <Link
                className="group grid gap-1 rounded-md border border-border/80 bg-background/55 p-3 transition hover:bg-background/80"
                href={href}
                key={event.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-semibold text-foreground">
                    {event.sceneTitle || eventTitle(event)}
                  </p>
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground"
                  />
                </div>
                <p className="truncate text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {event.character.name} / {event.dailyGameId}
                </p>
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {event.playerInput ||
                    event.narratorResponse ||
                    event.gameText ||
                    event.choice ||
                    eventTitle(event)}
                </p>
                <time
                  className="text-xs font-medium text-muted-foreground"
                  dateTime={event.createdAt}
                >
                  {formatDateTime(event.createdAt)}
                </time>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Public events will appear here as playthroughs advance.
        </p>
      )}
    </aside>
  );
}

function eventTitle(event: PublicActivityEvent) {
  if (event.choice) {
    return `${event.choice} submitted`;
  }

  return event.eventKind
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function Metric({
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
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-8 text-center shadow-2xl shadow-black/10 backdrop-blur-md dark:bg-black/25 dark:shadow-black/35">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-3 text-lg font-medium text-foreground">{body}</p>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
