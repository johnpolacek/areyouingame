"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { pendingDraftStorageKey } from "@/lib/character-draft";

type JoinFlowProps = {
  fallbackHref: string;
  successHref: string;
};

type ClaimState = "claiming" | "missing-draft" | "error";

export function JoinFlow({ fallbackHref, successHref }: JoinFlowProps) {
  const router = useRouter();
  const [state, setState] = useState<ClaimState>("claiming");
  const [message, setMessage] = useState("Creating your character...");

  useEffect(() => {
    let isMounted = true;

    async function claimPendingDraft() {
      const rawDraft = window.sessionStorage.getItem(pendingDraftStorageKey);

      if (!rawDraft) {
        setState("missing-draft");
        setMessage("No pending character draft was found.");
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

        setState("error");
        setMessage(
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

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-16 text-amber-50">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        {state === "claiming" ? (
          <LoaderCircleIcon
            aria-hidden="true"
            className="animate-spin text-amber-300"
            data-icon="inline-start"
          />
        ) : null}
        <h1 className="font-accent text-xl tracking-normal text-amber-300">
          {state === "error" ? "Character Creation Paused" : "Joining Game"}
        </h1>
        <p className="text-sm leading-6 text-amber-100/80">{message}</p>
      </div>
    </main>
  );
}
