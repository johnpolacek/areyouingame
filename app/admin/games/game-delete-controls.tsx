"use client";

import { useState, useTransition } from "react";
import { deleteAllDailyGamesAction, deleteDailyGameAction } from "./actions";

type ConfirmTarget =
  | { kind: "all" }
  | { kind: "game"; dailyGameId: string }
  | null;

export function DeleteGameButton({ dailyGameId }: { dailyGameId: string }) {
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [isPending, startTransition] = useTransition();
  const isConfirming =
    confirmTarget?.kind === "game" &&
    confirmTarget.dailyGameId === dailyGameId;

  return (
    <form
      action={(formData) => {
        if (!isConfirming) {
          setConfirmTarget({ kind: "game", dailyGameId });
          return;
        }

        startTransition(async () => {
          await deleteDailyGameAction(formData);
          setConfirmTarget(null);
        });
      }}
      className="flex justify-end"
    >
      <input name="dailyGameId" type="hidden" value={dailyGameId} />
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

export function DeleteAllGamesButton({ disabled }: { disabled: boolean }) {
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
          await deleteAllDailyGamesAction();
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
