"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type OpeningPromptProps = {
  eventStartsAtIso: string;
  localGameStart: string;
  playerLocation: string;
  playerName: string;
};

export function OpeningPrompt({
  eventStartsAtIso,
  localGameStart,
  playerLocation,
  playerName,
}: OpeningPromptProps) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canSend = response.trim().length > 0 && !isSubmitting;

  async function submitResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const submitRequest = await fetch("/api/players/opening-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openingResponse: response.trim(),
        }),
      });
      const result = (await submitRequest.json()) as { error?: string };

      if (!submitRequest.ok) {
        throw new Error(result.error || "Unable to send response.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send response.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-labelledby="opening-question"
      onSubmit={submitResponse}
      className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p
          id="opening-question"
          className="text-base leading-7 font-medium text-amber-100 text-balance sm:text-lg sm:leading-8"
        >
          Hi {playerName}, it is{" "}
          <time dateTime={eventStartsAtIso}>{localGameStart}</time> in{" "}
          {playerLocation}.
        </p>
        <p className="text-2xl leading-9 font-semibold text-amber-200 text-balance sm:text-4xl sm:leading-12">
          Where are you and what are you doing?
        </p>
      </div>

      <textarea
        autoFocus
        className="min-h-40 w-full resize-none rounded-md border border-amber-300/30 bg-black/45 px-4 py-3 text-base font-medium tracking-normal text-amber-50 shadow-2xl shadow-black/35 outline-none backdrop-blur-md transition placeholder:text-amber-700 focus:border-amber-200/70 focus:ring-2 focus:ring-amber-500/20 sm:min-h-48 sm:text-lg"
        name="opening-response"
        onChange={(event) => setResponse(event.target.value)}
        placeholder="I am..."
        readOnly={isSubmitting}
        value={response}
      />

      {error ? (
        <p className="max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
          {error}
        </p>
      ) : null}

      <Button
        className="h-12 w-full max-w-sm border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-950 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-amber-50 uppercase shadow-2xl shadow-black/60 backdrop-blur-md hover:brightness-[1.15] disabled:brightness-75 sm:h-14"
        disabled={!canSend}
        type="submit"
      >
        {isSubmitting ? (
          <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          "Send"
        )}
      </Button>
    </form>
  );
}
