import type { ReactNode } from "react";
import Link from "next/link";
import { requireLocalAdminAccess } from "@/lib/admin-access";
import {
  getAiUsageSummaryForAdmin,
  type AiUsageBreakdownRow,
  type AiUsageEvent,
} from "@/lib/ai-usage";
import {
  getOpenAIClassifierModel,
  getOpenAINarrativeModel,
} from "@/lib/openai-models";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireLocalAdminAccess();

  const usage = await getAiUsageSummaryForAdmin(2000);
  const narrativeModel = getOpenAINarrativeModel();
  const classifierModel = getOpenAIClassifierModel();

  return (
    <main className="min-h-svh bg-zinc-950 px-5 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Local Admin
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">
                Operations
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Read-only view of AI model usage and estimated OpenAI spend for
                the configured Convex deployment.
              </p>
            </div>
            <div className="grid gap-1 text-sm text-zinc-300">
              <div>
                Narrative model:{" "}
                <span className="font-mono text-amber-200">
                  {narrativeModel}
                </span>
              </div>
              <div>
                Classifier model:{" "}
                <span className="font-mono text-amber-200">
                  {classifierModel}
                </span>
              </div>
              <Link
                className="text-amber-200 hover:text-amber-100"
                href="/admin/games"
              >
                Game cleanup
              </Link>
              <Link
                className="text-amber-200 hover:text-amber-100"
                href="/admin/playtests"
              >
                Persona playtests
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Estimated Cost"
            value={formatUsd(usage.totals.estimatedCostUsd)}
          />
          <MetricTile label="AI Calls" value={usage.totals.calls.toString()} />
          <MetricTile
            label="Input Tokens"
            value={formatNumber(usage.totals.inputTokens)}
          />
          <MetricTile
            label="Output Tokens"
            value={formatNumber(usage.totals.outputTokens)}
          />
          <MetricTile
            label="Cached Input"
            value={formatNumber(usage.totals.cachedInputTokens)}
          />
          <MetricTile
            label="Reasoning Tokens"
            value={formatNumber(usage.totals.reasoningTokens)}
          />
          <MetricTile
            label="Total Tokens"
            value={formatNumber(usage.totals.totalTokens)}
          />
          <MetricTile label="Errors" value={usage.totals.errors.toString()} />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <BreakdownTable title="By Model" rows={usage.byModel} />
          <BreakdownTable title="By Operation" rows={usage.byOperation} />
          <BreakdownTable title="By Day" rows={usage.byDay} />
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              Recent Calls
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
              <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <HeaderCell>Time</HeaderCell>
                  <HeaderCell>Operation</HeaderCell>
                  <HeaderCell>Model</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  <HeaderCell>Player</HeaderCell>
                  <HeaderCell>Game</HeaderCell>
                  <HeaderCell align="right">Tokens</HeaderCell>
                  <HeaderCell align="right">Cost</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {usage.events.length > 0 ? (
                  usage.events.slice(0, 250).map((event) => (
                    <RecentCallRow event={event} key={event.id} />
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={8}
                    >
                      No AI usage has been recorded yet.
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

function BreakdownTable({
  rows,
  title,
}: {
  rows: AiUsageBreakdownRow[];
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </div>
      <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
        <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell align="right">Calls</HeaderCell>
            <HeaderCell align="right">Tokens</HeaderCell>
            <HeaderCell align="right">Cost</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.key}>
                <BodyCell mono>{row.key}</BodyCell>
                <BodyCell align="right">{formatNumber(row.calls)}</BodyCell>
                <BodyCell align="right">
                  {formatNumber(row.totalTokens)}
                </BodyCell>
                <BodyCell align="right">
                  {formatUsd(row.estimatedCostUsd)}
                </BodyCell>
              </tr>
            ))
          ) : (
            <tr>
              <td className="px-4 py-6 text-center text-zinc-500" colSpan={4}>
                No rows yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function RecentCallRow({ event }: { event: AiUsageEvent }) {
  return (
    <tr>
      <BodyCell>{formatDateTime(event.createdAt)}</BodyCell>
      <BodyCell mono>{event.operation}</BodyCell>
      <BodyCell mono>{event.model}</BodyCell>
      <BodyCell>
        <span
          className={
            event.status === "success"
              ? "text-emerald-300"
              : "text-rose-300"
          }
        >
          {event.status}
        </span>
      </BodyCell>
      <BodyCell mono>{event.playerId ?? event.clerkUserId ?? "-"}</BodyCell>
      <BodyCell mono>{event.dailyGameId ?? "-"}</BodyCell>
      <BodyCell align="right">{formatNumber(event.totalTokens)}</BodyCell>
      <BodyCell align="right">{formatUsd(event.estimatedCostUsd)}</BodyCell>
    </tr>
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
  mono = false,
}: {
  align?: "left" | "right";
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className={[
        "px-4 py-3 text-zinc-300",
        align === "right" ? "text-right" : "",
        mono ? "font-mono text-xs" : "",
      ].join(" ")}
    >
      {children}
    </td>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: value > 0 && value < 0.01 ? 6 : 2,
    style: "currency",
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}
