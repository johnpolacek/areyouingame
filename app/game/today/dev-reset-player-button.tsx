"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcwIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pendingDraftStorageKey } from "@/lib/character-draft";

type ResetMode = "day" | "full";

export function DevResetPlayerButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [resettingMode, setResettingMode] = useState<ResetMode | null>(null);

  async function resetPlayer(mode: ResetMode) {
    if (resettingMode) {
      return;
    }

    setResettingMode(mode);

    try {
      const response = await fetch("/api/dev/reset-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode }),
      });

      if (!response.ok) {
        throw new Error("Unable to reset local player.");
      }

      if (mode === "full") {
        window.sessionStorage.removeItem(pendingDraftStorageKey);
        router.replace("/player/new");
      } else {
        router.replace("/game/today");
      }

      router.refresh();
    } finally {
      setResettingMode(null);
      setIsOpen(false);
    }
  }

  return (
    <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-2">
      {isOpen ? (
        <div className="grid w-64 gap-1 rounded-[4px] border border-amber-200/15 bg-black/70 p-1.5 text-amber-50 shadow-2xl shadow-black/40 backdrop-blur-md">
          <Button
            aria-label="Start today's flow over"
            className="h-auto justify-start rounded-[3px] px-2.5 py-2 text-left text-[0.72rem] font-semibold tracking-[0.12em] text-amber-100/80 uppercase hover:bg-amber-200/10 hover:text-amber-50 focus-visible:ring-amber-200/35"
            disabled={resettingMode !== null}
            onClick={() => resetPlayer("day")}
            size="sm"
            type="button"
            variant="ghost"
          >
            <RefreshCcwIcon aria-hidden="true" className="size-3.5" />
            {resettingMode === "day" ? "Starting Day" : "Start Day Over"}
          </Button>
          <Button
            aria-label="Delete today's local player and start over completely"
            className="h-auto justify-start rounded-[3px] px-2.5 py-2 text-left text-[0.72rem] font-semibold tracking-[0.12em] text-red-100/75 uppercase hover:bg-red-400/10 hover:text-red-50 focus-visible:ring-red-200/35"
            disabled={resettingMode !== null}
            onClick={() => resetPlayer("full")}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Trash2Icon aria-hidden="true" className="size-3.5" />
            {resettingMode === "full" ? "Deleting Player" : "Start Over"}
          </Button>
        </div>
      ) : null}

      <Button
        aria-expanded={isOpen}
        aria-label="Open reset options"
        className="h-8 rounded-[3px] border-amber-200/20 bg-black/35 px-3 text-[0.68rem] font-semibold tracking-[0.18em] text-amber-100/70 uppercase backdrop-blur-md hover:bg-amber-200/10 hover:text-amber-50 focus-visible:ring-amber-200/35"
        disabled={resettingMode !== null}
        onClick={() => setIsOpen((current) => !current)}
        size="sm"
        type="button"
        variant="ghost"
      >
        <RotateCcwIcon aria-hidden="true" className="size-3.5" />
        {resettingMode ? "Resetting" : "Reset"}
      </Button>
    </div>
  );
}
