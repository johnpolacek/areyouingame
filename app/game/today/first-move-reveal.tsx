"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  FirstDecision,
  FirstMoveReveal as FirstMoveRevealState,
  YesNoChoice,
} from "@/lib/player-store";

type FirstMoveRevealProps = {
  reveal: FirstMoveRevealState;
};

type FirstChoiceConsequenceProps = {
  decision: FirstDecision;
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
  const router = useRouter();
  const [submittedChoice, setSubmittedChoice] = useState<YesNoChoice | null>(
    null,
  );
  const [error, setError] = useState("");
  const isSubmitting = submittedChoice !== null;

  async function submitChoice(choice: YesNoChoice) {
    if (isSubmitting) {
      return;
    }

    setSubmittedChoice(choice);
    setError("");

    try {
      const response = await fetch("/api/players/yes-no-choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to record choice.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to record choice.",
      );
      setSubmittedChoice(null);
    }
  }

  return (
    <section
      aria-labelledby="first-move-reveal-title"
      className="relative z-10 flex w-full max-w-[96rem] flex-col items-center text-center"
    >
      <div className="grid w-full max-w-2xl gap-5 text-left sm:text-center">
        {reveal.sceneIntro.map((paragraph) => (
          <p
            className="text-base leading-8 font-medium text-amber-100/90 text-balance sm:text-lg sm:leading-9"
            key={paragraph}
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-9 grid w-full justify-items-center gap-4 sm:mt-11">
        <div className="grid gap-3 text-amber-200">
          <p className="text-lg leading-8 font-normal tracking-[0.12em] text-balance sm:text-2xl sm:leading-10 sm:tracking-[0.18em]">
            {reveal.revealCopy.availability}
          </p>
          <p className="text-lg leading-8 font-normal tracking-[0.12em] text-balance sm:text-2xl sm:leading-10 sm:tracking-[0.18em]">
            {reveal.revealCopy.promise}
          </p>
        </div>

        <div className="first-move-glint my-3 h-px w-full max-w-md" />

        <h1
          id="first-move-reveal-title"
          className="first-move-question whitespace-nowrap text-[2.25rem] leading-none font-light tracking-[0.08em] text-amber-50 uppercase sm:text-7xl sm:tracking-[0.18em] md:text-8xl md:tracking-[0.22em] lg:text-9xl"
        >
          {reveal.revealCopy.question}
        </h1>
      </div>

      <div
        aria-label={reveal.revealCopy.audioPrompt}
        className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-9"
      >
        <Button
          disabled={isSubmitting}
          onClick={() => void submitChoice("YES")}
          type="button"
          variant="ghost"
          className="first-move-answer !h-16 !rounded-[3px] border border-emerald-300/70 bg-black/20 font-sans text-xl font-light tracking-[0.48em] text-emerald-200 shadow-[0_0_34px_rgba(34,197,94,0.14)] backdrop-blur-sm hover:border-emerald-200 hover:bg-emerald-400/10 hover:text-emerald-100 focus-visible:border-emerald-100 focus-visible:ring-emerald-300/35 sm:!h-18"
        >
          {submittedChoice === "YES" ? (
            <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            reveal.revealCopy.yesLabel
          )}
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={() => void submitChoice("NO")}
          type="button"
          variant="ghost"
          className="first-move-answer !h-16 !rounded-[3px] border border-red-400/75 bg-black/20 font-sans text-xl font-light tracking-[0.48em] text-red-300 shadow-[0_0_34px_rgba(239,68,68,0.13)] backdrop-blur-sm hover:border-red-200 hover:bg-red-500/10 hover:text-red-100 focus-visible:border-red-100 focus-visible:ring-red-300/35 sm:!h-18"
        >
          {submittedChoice === "NO" ? (
            <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            reveal.revealCopy.noLabel
          )}
        </Button>
      </div>

      {error ? (
        <p className="mt-6 max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function FirstChoiceConsequence({
  decision,
}: FirstChoiceConsequenceProps) {
  const choiceClass =
    decision.choice === "YES" ? "text-emerald-200" : "text-red-300";

  return (
    <section
      aria-labelledby="first-choice-consequence-title"
      className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p className="text-[0.68rem] font-bold tracking-[0.22em] text-amber-400 uppercase">
          Choice recorded for today
        </p>
        <p
          className={`text-5xl leading-none font-light tracking-[0.2em] ${choiceClass} sm:text-7xl`}
        >
          {decision.choice}
        </p>
        <h1
          id="first-choice-consequence-title"
          className="text-2xl leading-9 font-semibold text-amber-200 text-balance sm:text-4xl sm:leading-12"
        >
          {decision.consequenceTitle}
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 font-medium text-amber-100/85 text-balance sm:text-lg sm:leading-8">
          {decision.consequenceBody}
        </p>
      </div>

      <p className="rounded-md border border-amber-300/25 bg-black/35 px-4 py-3 text-sm leading-6 font-medium text-amber-100/80 backdrop-blur">
        Your {decision.choice} is locked for today&apos;s game.
      </p>
    </section>
  );
}
