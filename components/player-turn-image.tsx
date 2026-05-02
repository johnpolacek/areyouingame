"use client";

import { useEffect, useState } from "react";
import { LoaderCircleIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerTurnImage as PlayerTurnImageState } from "@/lib/player-store";

type PlayerTurnImageProps = {
  image?: PlayerTurnImageState;
  sourceTurnId: string;
  triggerGeneration?: boolean;
};

export function PlayerTurnImage({
  image,
  sourceTurnId,
  triggerGeneration = false,
}: PlayerTurnImageProps) {
  const [status, setStatus] = useState(image?.status ?? "pending");

  useEffect(() => {
    setStatus(image?.status ?? "pending");
  }, [image?.status]);

  useEffect(() => {
    if (!triggerGeneration || status === "ready" || status === "error") {
      return;
    }

    let isMounted = true;

    async function generateImage() {
      setStatus("generating");

      try {
        const response = await fetch("/api/players/turn-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sourceTurnId }),
        });

        if (!response.ok) {
          throw new Error("Unable to generate turn image.");
        }

        if (isMounted) {
          setStatus("ready");
          window.location.reload();
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    }

    void generateImage();

    return () => {
      isMounted = false;
    };
  }, [sourceTurnId, status, triggerGeneration]);

  if (image?.status === "ready") {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-muted/50">
        <img
          alt=""
          className="aspect-square w-full object-cover"
          loading="lazy"
          src={`/api/player-turn-images/${encodeURIComponent(sourceTurnId)}`}
        />
      </div>
    );
  }

  return (
    <div
      aria-busy={status === "pending" || status === "generating"}
      className={cn(
        "grid aspect-square w-full place-items-center rounded-md border border-border bg-muted/65 text-muted-foreground",
        "dark:border-amber-200/15 dark:bg-black/35 dark:text-amber-100/55",
      )}
    >
      <div className="grid justify-items-center gap-3">
        {status === "error" ? (
          <ImageIcon aria-hidden="true" className="size-7" />
        ) : (
          <LoaderCircleIcon
            aria-label="Generating image"
            className="size-7 animate-spin text-primary dark:text-amber-300"
          />
        )}
      </div>
    </div>
  );
}
