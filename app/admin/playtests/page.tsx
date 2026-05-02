import Link from "next/link";
import type { ReactNode } from "react";
import { requireLocalAdminAccess } from "@/lib/admin-access";
import { readPlaytestIndex } from "@/lib/playtest-reports";
import {
  DeleteAllPlaytestRunsButton,
  DeletePlaytestRunButton,
} from "./playtest-delete-controls";

export const dynamic = "force-dynamic";

export default async function AdminPlaytestsPage() {
  await requireLocalAdminAccess();

  const index = await readPlaytestIndex();

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
              Persona Playtests
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Generated persona playthrough reports stored in the project wiki.
              Delete individual test runs or clear the full local report list.
            </p>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <MetricTile label="Runs" value={index.runs.length.toString()} />
          <MetricTile
            label="Needs Review"
            value={index.runs
              .filter((run) => run.status === "needs_review")
              .length.toString()}
          />
          <MetricTile
            label="Last Generated"
            value={formatDateTime(index.generatedAt)}
          />
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Generated Runs
            </h2>
            <DeleteAllPlaytestRunsButton disabled={index.runs.length === 0} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
              <thead className="bg-zinc-900/70 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <HeaderCell>Run</HeaderCell>
                  <HeaderCell>Build</HeaderCell>
                  <HeaderCell>Persona</HeaderCell>
                  <HeaderCell>Scenario</HeaderCell>
                  <HeaderCell>Status</HeaderCell>
                  <HeaderCell align="right">Findings</HeaderCell>
                  <HeaderCell>Top Finding</HeaderCell>
                  <HeaderCell align="right">Actions</HeaderCell>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {index.runs.length > 0 ? (
                  index.runs.map((run) => (
                    <tr key={run.id}>
                      <BodyCell>
                        <Link
                          className="font-mono text-amber-200 hover:text-amber-100"
                          href={`/admin/playtests/${encodeURIComponent(run.id)}`}
                        >
                          {run.id}
                        </Link>
                      </BodyCell>
                      <BodyCell mono>{run.buildVersion}</BodyCell>
                      <BodyCell>
                        <div className="font-medium text-zinc-100">
                          {run.personaName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {run.personaSummary}
                        </div>
                      </BodyCell>
                      <BodyCell mono>{run.scenario}</BodyCell>
                      <BodyCell>
                        <span
                          className={
                            run.status === "passed"
                              ? "text-emerald-300"
                              : run.status === "failed"
                              ? "text-rose-300"
                              : "text-amber-200"
                          }
                        >
                          {run.status}
                        </span>
                      </BodyCell>
                      <BodyCell align="right">
                        {run.findingCount.toString()}
                      </BodyCell>
                      <BodyCell>{run.topFinding || "-"}</BodyCell>
                      <BodyCell align="right">
                        <DeletePlaytestRunButton runId={run.id} />
                      </BodyCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-zinc-500"
                      colSpan={8}
                    >
                      No persona playtests have been generated yet.
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
  mono = false,
}: {
  align?: "left" | "right";
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <td
      className={[
        "px-4 py-3 align-top text-zinc-300",
        align === "right" ? "text-right" : "",
        mono ? "font-mono" : "",
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
