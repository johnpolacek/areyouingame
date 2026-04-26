"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pendingDraftStorageKey } from "@/lib/character-draft";

export function DevResetPlayerButton() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  async function resetPlayer() {
    if (isResetting) {
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch("/api/dev/reset-player", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to reset local player.");
      }

      window.sessionStorage.removeItem(pendingDraftStorageKey);
      router.replace("/player/new");
      router.refresh();
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <Button
      aria-label="Reset today's local player"
      className="absolute top-4 right-4 z-20 h-8 rounded-[3px] border-amber-200/20 bg-black/35 px-3 text-[0.68rem] font-semibold tracking-[0.18em] text-amber-100/70 uppercase backdrop-blur-md hover:bg-amber-200/10 hover:text-amber-50 focus-visible:ring-amber-200/35"
      disabled={isResetting}
      onClick={resetPlayer}
      size="sm"
      type="button"
      variant="ghost"
    >
      <RotateCcwIcon aria-hidden="true" className="size-3.5" />
      {isResetting ? "Resetting" : "Reset"}
    </Button>
  );
}
