import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicLivePlayer, getPublicPlayerActivityPage } from "@/lib/live-browser";

export const dynamic = "force-dynamic";

export default async function PlayerHistoryPage({ params, searchParams }: {
  params: Promise<{ gameId: string; playerId: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const [{ gameId, playerId }, { cursor }] = await Promise.all([params, searchParams]);
  const player = await getPublicLivePlayer({ dailyGameId: gameId, playerId });
  if (!player) notFound();
  const result = await getPublicPlayerActivityPage(playerId, cursor ?? null);
  const base = `/live/${encodeURIComponent(gameId)}/${encodeURIComponent(playerId)}`;
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8">
      <Link className="text-sm underline" href={base}>Back to {player.name}</Link>
      <h1 className="text-3xl font-semibold">Activity history</h1>
      <p className="text-sm text-muted-foreground">Newest activity first.</p>
      {result.page.map(event => (
        <article key={event.id} className="grid gap-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">{event.sceneTitle ?? event.eventKind.replaceAll("_", " ")}</h2>
          <time className="text-xs text-muted-foreground" dateTime={event.createdAt}>{event.createdAt}</time>
          {event.gameText && <p className="whitespace-pre-wrap">{event.gameText}</p>}
          {event.playerInput && <p className="whitespace-pre-wrap font-medium">{event.playerInput}</p>}
          {event.narratorResponse && <p className="whitespace-pre-wrap">{event.narratorResponse}</p>}
        </article>
      ))}
      <nav aria-label="Activity pages" className="flex gap-6 text-sm font-semibold underline">
        {cursor && <Link href={`${base}/history`}>Latest activity</Link>}
        {!result.isDone && <Link href={`?cursor=${encodeURIComponent(result.continueCursor)}`}>Older activity</Link>}
      </nav>
    </main>
  );
}
