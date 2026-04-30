"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCcwIcon,
  RotateCcwIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getBrowserTimeZone,
  pendingDraftStorageKey,
  persistBrowserTimeZoneCookie,
} from "@/lib/character-draft";

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
    persistBrowserTimeZoneCookie();

    try {
      const response = await fetch("/api/dev/reset-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ browserTimeZone: getBrowserTimeZone(), mode }),
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
        <div className="grid w-64 gap-1 rounded-[4px] border border-border bg-card/85 p-1.5 text-foreground shadow-2xl shadow-black/15 backdrop-blur-md dark:border-amber-200/15 dark:bg-black/70 dark:text-amber-50 dark:shadow-black/40">
          <Button
            aria-label="Start today's flow over"
            className="h-auto justify-start rounded-[3px] px-2.5 py-2 text-left text-[0.72rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase hover:bg-muted hover:text-foreground focus-visible:ring-ring/35 dark:text-amber-100/80 dark:hover:bg-amber-200/10 dark:hover:text-amber-50 dark:focus-visible:ring-amber-200/35"
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
            className="h-auto justify-start rounded-[3px] px-2.5 py-2 text-left text-[0.72rem] font-semibold tracking-[0.12em] text-destructive uppercase hover:bg-destructive/10 focus-visible:ring-destructive/35 dark:text-red-100/75 dark:hover:bg-red-400/10 dark:hover:text-red-50 dark:focus-visible:ring-red-200/35"
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

      <div className="flex items-center gap-2">
        <Button
          aria-label="Open admin dashboard"
          className="h-8 rounded-[3px] border-border bg-card/75 px-3 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-md hover:bg-muted hover:text-foreground focus-visible:ring-ring/35 dark:border-amber-200/20 dark:bg-black/35 dark:text-amber-100/70 dark:hover:bg-amber-200/10 dark:hover:text-amber-50 dark:focus-visible:ring-amber-200/35"
          render={<Link href="/admin" />}
          size="sm"
          variant="ghost"
        >
          <ShieldIcon aria-hidden="true" className="size-3.5" />
          Admin
        </Button>
        <Button
          aria-expanded={isOpen}
          aria-label="Open reset options"
          className="h-8 rounded-[3px] border-border bg-card/75 px-3 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-md hover:bg-muted hover:text-foreground focus-visible:ring-ring/35 dark:border-amber-200/20 dark:bg-black/35 dark:text-amber-100/70 dark:hover:bg-amber-200/10 dark:hover:text-amber-50 dark:focus-visible:ring-amber-200/35"
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
    </div>
  );
}
