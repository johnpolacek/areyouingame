"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pendingDraftStorageKey } from "@/lib/character-draft";

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
      const rawDraft = window.sessionStorage.getItem(pendingDraftStorageKey);

      if (!rawDraft) {
        router.replace(fallbackHref);
        return;
      }

      try {
        const response = await fetch("/api/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            draft: JSON.parse(rawDraft),
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
        className="min-h-screen bg-black"
      />
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-16 text-amber-50">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="font-accent text-xl tracking-normal text-amber-300">
          Character Creation Paused
        </h1>
        <p className="text-sm leading-6 text-amber-100/80">{errorMessage}</p>
      </div>
    </main>
  );
}
