import Link from "next/link";
import { HeroBackgroundVideo } from "../hero-background-video";
import { PublicActivityTimeline } from "@/components/public-activity-timeline";
import { getPublicActivityEvents } from "@/lib/public-activity";

export const dynamic = "force-dynamic";

export default async function LiveActivityPage() {
  const initialEvents = await getPublicActivityEvents({ limit: 100 });
  const realtime = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8">
      <HeroBackgroundVideo />
      <div className="cinematic-vignette absolute inset-0 z-[1]" />
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Live Activity
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-5xl">
              Today&apos;s public transcript
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Player-visible turns from the shared activity stream. Synthetic
              persona runs are shown in the same feed and labeled on each card.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card/70 px-4 text-sm font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-card dark:bg-black/30"
            href="/game/today"
          >
            Open game
          </Link>
        </header>

        {!realtime ? (
          <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:text-amber-100">
            Realtime Convex updates need NEXT_PUBLIC_CONVEX_URL. Showing the
            latest server snapshot.
          </div>
        ) : null}

        <PublicActivityTimeline
          initialEvents={initialEvents}
          realtime={realtime}
        />
      </div>
    </main>
  );
}
