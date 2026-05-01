import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { requireLocalAdminAccess } from "@/lib/admin-access";

export const dynamic = "force-dynamic";

export default async function AdminPlaytestRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  await requireLocalAdminAccess();

  const { runId } = await params;
  const safeRunId = decodeURIComponent(runId);

  if (!/^[a-z0-9._-]+(?:__[a-z0-9._-]+)*$/i.test(safeRunId)) {
    notFound();
  }

  const markdown = await readRunMarkdown(safeRunId);

  if (!markdown) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-zinc-950 px-5 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
          <Link
            className="text-sm text-amber-200 hover:text-amber-100"
            href="/admin/playtests"
          >
            Persona Playtests
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Markdown Report
            </p>
            <h1 className="mt-2 break-words font-mono text-2xl font-semibold text-white">
              {safeRunId}
            </h1>
          </div>
        </header>

        <article className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <pre className="whitespace-pre-wrap break-words p-5 text-sm leading-7 text-zinc-200">
            {markdown}
          </pre>
        </article>
      </div>
    </main>
  );
}

async function readRunMarkdown(runId: string): Promise<string | null> {
  try {
    return await readFile(
      path.join(process.cwd(), "wiki", "playtests", `${runId}.md`),
      "utf8",
    );
  } catch {
    return null;
  }
}
