"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BeforeWeBegin() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function continueToGame() {
    if (!hasAccepted || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/players/public-gameplay-agreement", {
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to continue.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to continue.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="before-we-begin-title"
      className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p className="text-[0.68rem] font-bold tracking-[0.22em] text-amber-400 uppercase">
          Before we begin
        </p>
        <p
          id="before-we-begin-title"
          className="mx-auto max-w-xl text-base leading-7 font-medium text-amber-100/85 text-balance sm:text-lg sm:leading-8"
        >
          Your gameplay helps shape the shared story and will be published at
          the end of each day&apos;s session as part of the daily recap.
        </p>
      </div>

      <label className="flex w-full max-w-xl items-start gap-3 rounded-md border border-amber-500/30 bg-black/45 p-4 text-left text-sm leading-6 text-amber-100 shadow-2xl shadow-black/35 backdrop-blur-md">
        <input
          checked={hasAccepted}
          className="mt-1 size-4 shrink-0 accent-amber-400"
          onChange={(event) => setHasAccepted(event.target.checked)}
          type="checkbox"
        />
        <span>
          I understand and agree that my gameplay will be published at the end
          of the day&apos;s session, and I agree to the Terms and Conditions.
        </span>
      </label>

      {error ? (
        <p className="max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
          {error}
        </p>
      ) : null}

      <Button
        className="h-12 w-full max-w-sm border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-950 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-amber-50 uppercase shadow-2xl shadow-black/60 backdrop-blur-md hover:brightness-[1.15] disabled:brightness-75 sm:h-14"
        disabled={!hasAccepted || isSubmitting}
        onClick={continueToGame}
      >
        {isSubmitting ? (
          <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          "Continue"
        )}
      </Button>
    </section>
  );
}
