"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FirstMoveReveal as FirstMoveRevealState } from "@/lib/player-store";

type FirstMoveRevealProps = {
  reveal: FirstMoveRevealState;
};

type FirstMoveRevealPendingProps = {
  openingResponse: string;
};

export function FirstMoveRevealPending({
  openingResponse,
}: FirstMoveRevealPendingProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function createReveal() {
      try {
        const response = await fetch("/api/players/first-move-reveal", {
          method: "POST",
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error || "Unable to prepare reveal.");
        }

        router.refresh();
      } catch (revealError) {
        if (!isMounted) {
          return;
        }

        setError(
          revealError instanceof Error
            ? revealError.message
            : "Unable to prepare reveal.",
        );
      }
    }

    void createReveal();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <section
      aria-labelledby="first-move-pending-title"
      className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p className="text-[0.68rem] font-bold tracking-[0.22em] text-amber-400 uppercase">
          Response sent
        </p>
        <h1
          id="first-move-pending-title"
          className="text-2xl leading-9 font-semibold text-amber-200 text-balance sm:text-4xl sm:leading-12"
        >
          The game is finding you there.
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 font-medium text-amber-100/85 text-balance sm:text-lg sm:leading-8">
          Your opening move is becoming the first contact reveal.
        </p>
      </div>

      <blockquote className="w-full rounded-md border border-amber-300/30 bg-black/45 px-4 py-3 text-left text-base leading-7 font-medium text-amber-50 shadow-2xl shadow-black/35 backdrop-blur-md sm:text-lg">
        {openingResponse}
      </blockquote>

      {error ? (
        <p className="max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
          {error}
        </p>
      ) : (
        <LoaderCircleIcon
          aria-hidden="true"
          className="size-6 animate-spin text-amber-300"
        />
      )}
    </section>
  );
}

export function FirstMoveReveal({ reveal }: FirstMoveRevealProps) {
  return (
    <section
      aria-labelledby="first-move-reveal-title"
      className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-8 text-center"
    >
      <div className="grid w-full gap-4 text-left sm:text-center">
        {reveal.sceneIntro.map((paragraph) => (
          <p
            className="text-base leading-7 font-medium text-amber-100 text-balance sm:text-lg sm:leading-8"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="grid gap-4">
        <p className="text-xl leading-8 font-semibold text-amber-200 text-balance sm:text-3xl sm:leading-11">
          {reveal.revealCopy.availability}
        </p>
        <p className="text-xl leading-8 font-semibold text-amber-200 text-balance sm:text-3xl sm:leading-11">
          {reveal.revealCopy.promise}
        </p>
        <h1
          id="first-move-reveal-title"
          className="font-accent text-4xl leading-12 font-normal tracking-normal text-amber-50 uppercase sm:text-6xl sm:leading-18"
        >
          {reveal.revealCopy.question}
        </h1>
      </div>

      <div
        aria-label={reveal.revealCopy.audioPrompt}
        className="grid w-full max-w-sm grid-cols-2 gap-3"
      >
        <Button className="h-14 border border-emerald-200/70 bg-emerald-600/80 font-accent text-lg font-normal tracking-normal text-emerald-50 shadow-2xl shadow-black/60 hover:bg-emerald-500">
          {reveal.revealCopy.yesLabel}
        </Button>
        <Button className="h-14 border border-red-200/70 bg-red-800/80 font-accent text-lg font-normal tracking-normal text-red-50 shadow-2xl shadow-black/60 hover:bg-red-700">
          {reveal.revealCopy.noLabel}
        </Button>
      </div>
    </section>
  );
}
