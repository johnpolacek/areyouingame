"use client";

import { useQuery } from "convex/react";
import { RadioIcon, SparklesIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { PublicActivityEvent } from "@/lib/public-activity";

export function PublicActivityTimeline({
  initialEvents,
  realtime,
}: {
  initialEvents: PublicActivityEvent[];
  realtime: boolean;
}) {
  const liveEvents = useQuery(
    api.playerStore.getPublicActivityEvents,
    realtime ? { limit: 100 } : "skip",
  ) as PublicActivityEvent[] | undefined;
  const events = liveEvents ?? initialEvents;

  return (
    <section className="grid gap-4" aria-live="polite" aria-busy={!liveEvents && realtime}>
      {events.length > 0 ? (
        events.map((event) => (
          <ActivityCard event={event} key={event.id} />
        ))
      ) : (
        <div className="rounded-lg border border-border bg-card/70 p-8 text-center shadow-2xl shadow-black/10 backdrop-blur-md dark:bg-black/25 dark:shadow-black/35">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Waiting for activity
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">
            Start a player session or run a persona playtest.
          </p>
        </div>
      )}
    </section>
  );
}

function ActivityCard({ event }: { event: PublicActivityEvent }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl dark:bg-black/35 dark:shadow-black/35">
      <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {event.character.name}
            </h2>
            {event.playtest ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-cyan-300/35 bg-cyan-400/10 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cyan-200 dark:text-cyan-100">
                <SparklesIcon aria-hidden="true" className="size-3.5" />
                AI Playtest
              </span>
            ) : null}
            {event.choice ? (
              <span className="rounded-md border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-100">
                {event.choice}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {event.character.age}, {event.character.location} ·{" "}
            {event.character.occupation}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <RadioIcon aria-hidden="true" className="size-4 text-accent" />
          <time dateTime={event.createdAt}>{formatTime(event.createdAt)}</time>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>{formatEventKind(event.eventKind)}</span>
          {event.sceneTitle ? (
            <span className="normal-case tracking-normal text-foreground/70">
              {event.sceneTitle}
            </span>
          ) : null}
        </div>

        {event.gameText ? (
          <TranscriptBlock label="Game" text={event.gameText} />
        ) : null}
        {event.playerInput ? (
          <TranscriptBlock label="Player" text={event.playerInput} />
        ) : null}
        {event.narratorResponse ? (
          <TranscriptBlock label="Narrator" text={event.narratorResponse} />
        ) : null}

        {event.playtest ? (
          <div className="flex flex-wrap gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            {event.playtest.build ? <MetaPill label="Build" value={event.playtest.build} /> : null}
            {event.playtest.scenario ? <MetaPill label="Scenario" value={event.playtest.scenario} /> : null}
            {event.playtest.run ? <MetaPill label="Run" value={event.playtest.run} /> : null}
          </div>
        ) : null}
      </div>
    </article>
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

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-border bg-background/60 px-2 py-1">
      {label}: <span className="font-mono text-foreground/80">{value}</span>
    </span>
  );
}

function formatEventKind(kind: PublicActivityEvent["eventKind"]): string {
  return kind
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
