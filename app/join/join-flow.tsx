"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  pendingDraftStorageKey,
  persistBrowserTimeZoneCookie,
} from "@/lib/character-draft";
import type { CharacterImage } from "@/lib/character-image";

type JoinFlowProps = {
  fallbackHref: string;
  successHref: string;
};

export function JoinFlow({ fallbackHref, successHref }: JoinFlowProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function claimPendingDraft() {
      persistBrowserTimeZoneCookie();

      const rawDraft = window.sessionStorage.getItem(pendingDraftStorageKey);

      if (!rawDraft) {
        router.replace(fallbackHref);
        return;
      }

      try {
        const draft = JSON.parse(rawDraft) as Record<string, unknown>;
        const characterImage =
          isCharacterImage(draft.characterImage)
            ? draft.characterImage
            : await uploadCharacterImage(
                typeof draft.characterImageDataUrl === "string"
                  ? draft.characterImageDataUrl
                  : undefined,
              );
        const response = await fetch("/api/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft: {
              ...draft,
              characterImage,
              characterImageDataUrl: undefined,
            },
          }),
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "Unable to create character.");
        }

        window.sessionStorage.removeItem(pendingDraftStorageKey);
        router.replace(successHref);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to create character.",
        );
      }
    }

    void claimPendingDraft();

    return () => {
      isMounted = false;
    };
  }, [fallbackHref, router, successHref]);

  if (!errorMessage) {
    return (
      <main
        aria-busy="true"
        aria-label="Joining game"
        className="min-h-screen bg-background"
      />
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-16 text-foreground">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="font-accent text-xl tracking-normal text-primary">
          Character Creation Paused
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {errorMessage}
        </p>
      </div>
    </main>
  );
}

function isCharacterImage(value: unknown): value is CharacterImage {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as CharacterImage).contentType === "image/webp" &&
    typeof (value as CharacterImage).url === "string"
  );
}

async function uploadCharacterImage(
  imageDataUrl?: string,
): Promise<CharacterImage> {
  if (!imageDataUrl) {
    throw new Error("Character image is required.");
  }

  const blob = await (await fetch(imageDataUrl)).blob();
  const formData = new FormData();

  formData.append("image", blob, "character.webp");

  const response = await fetch("/api/players/character-image", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as {
    image?: CharacterImage;
    error?: string;
  };

  if (!response.ok || !result.image) {
    throw new Error(result.error || "Unable to upload character image.");
  }

  return result.image;
}
