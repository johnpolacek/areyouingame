import Link from "next/link";
import type { ReactNode } from "react";
import { requireLocalAdminAccess } from "@/lib/admin-access";
import { getAdminGameSummaries } from "@/lib/admin-games";
import { DeleteAllGamesButton, DeleteGameButton } from "./game-delete-controls";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  await requireLocalAdminAccess();

  const games = await getAdminGameSummaries({ limit: 200 });

  return (
    <main className="min-h-svh bg-zinc-950 px-5 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
          <Link className="text-sm text-amber-200 hover:text-amber-100" href="/admin">
            Operations
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Local Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Game Cleanup
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Clear pre-launch game records while developing. Deleting a game
              also removes its players, public activity, gameplay events,
              storyline context, AI usage rows, and related artifact metadata.
            </p>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <MetricTile label="Games" value={games.length.toString()} />
          <MetricTile
            label="Players"
            value={games
              .reduce((total, game) => total + game.playerCount, 0)
              .toString()}
          />
          <MetricTile
            label="Events"
            value={games
              .reduce((total, game) => total + game.activityCount, 0)
              .toString()}
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Stored Games
            </h2>
            <DeleteAllGamesButton disabled={games.length === 0} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
              <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <HeaderCell>Game</HeaderCell>
                  <HeaderCell>Start</HeaderCell>
                  <HeaderCell align="right">Players</HeaderCell>
                  <HeaderCell align="right">Events</HeaderCell>
                  <HeaderCell>Last Activity</HeaderCell>
                  <HeaderCell align="right">Actions</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {games.length > 0 ? (
                  games.map((game) => (
                    <tr key={game.dailyGameId}>
                      <BodyCell>
                        <Link
                          className="font-mono text-amber-200 hover:text-amber-100"
                          href={`/live/${encodeURIComponent(game.dailyGameId)}`}
                        >
                          {game.dailyGameId}
                        </Link>
                      </BodyCell>
                      <BodyCell>{game.eventStartsAtLabel}</BodyCell>
                      <BodyCell align="right">
                        {game.playerCount.toString()}
                      </BodyCell>
                      <BodyCell align="right">
                        {game.activityCount.toString()}
                      </BodyCell>
                      <BodyCell>
                        {formatDateTime(game.lastActivityAt ?? game.updatedAt)}
                      </BodyCell>
                      <BodyCell align="right">
                        <DeleteGameButton dailyGameId={game.dailyGameId} />
                      </BodyCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={6}
                    >
                      No games have been stored yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-2xl font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function HeaderCell({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <th
      className={
        align === "right"
          ? "px-4 py-3 text-right font-medium"
          : "px-4 py-3 font-medium"
      }
      scope="col"
    >
      {children}
    </th>
  );
}

function BodyCell({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: ReactNode;
}) {
  return (
    <td
      className={[
        "px-4 py-3 align-top text-zinc-300",
        align === "right" ? "text-right" : "",
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
