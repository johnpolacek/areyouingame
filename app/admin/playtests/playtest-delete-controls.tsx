"use client";

import { useState, useTransition } from "react";
import {
  deleteAllPlaytestRunsAction,
  deletePlaytestRunAction,
} from "./actions";

type ConfirmTarget =
  | { kind: "all" }
  | { kind: "run"; runId: string }
  | null;

export function DeletePlaytestRunButton({ runId }: { runId: string }) {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [isPending, startTransition] = useTransition();
  const isConfirming =
    confirmTarget?.kind === "run" && confirmTarget.runId === runId;

  return (
    <form
      action={(formData) => {
        if (!isConfirming) {
          setConfirmTarget({ kind: "run", runId });
          return;
        }

        startTransition(async () => {
          await deletePlaytestRunAction(formData);
          setConfirmTarget(null);
        });
      }}
      className="flex justify-end"
    >
      <input name="runId" type="hidden" value={runId} />
      <button
        className={[
          "rounded-[4px] border px-2 py-1 text-xs font-semibold transition-colors",
          isConfirming
            ? "border-rose-400/70 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
            : "border-zinc-700 text-zinc-400 hover:border-rose-400/60 hover:text-rose-200",
        ].join(" ")}
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Deleting" : isConfirming ? "Confirm delete" : "Delete"}
      </button>
    </form>
  );
}

export function DeleteAllPlaytestRunsButton({
  disabled,
}: {
  disabled: boolean;
}) {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [isPending, startTransition] = useTransition();
  const isConfirming = confirmTarget?.kind === "all";

  return (
    <form
      action={() => {
        if (!isConfirming) {
          setConfirmTarget({ kind: "all" });
          return;
        }

        startTransition(async () => {
          await deleteAllPlaytestRunsAction();
          setConfirmTarget(null);
        });
      }}
    >
      <button
        className={[
          "rounded-[4px] border px-3 py-1.5 text-xs font-semibold transition-colors",
          isConfirming
            ? "border-rose-400/70 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
            : "border-zinc-700 text-zinc-300 hover:border-rose-400/60 hover:text-rose-200",
        ].join(" ")}
        disabled={disabled || isPending}
        type="submit"
      >
        {isPending
          ? "Deleting"
          : isConfirming
            ? "Confirm delete all"
            : "Delete all"}
      </button>
    </form>
  );
}
