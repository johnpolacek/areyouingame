"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBrowserTimeZone, persistBrowserTimeZoneCookie } from "@/lib/character-draft";
import type { OpeningSceneContextQuestion } from "@/lib/player-store";

type OpeningPromptProps = {
  currentTimeIso: string;
  localGameStart: string;
  playerLocation: string;
  playerName: string;
};

export function OpeningPrompt({
  currentTimeIso,
  localGameStart,
  playerLocation,
  playerName,
}: OpeningPromptProps) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [displayTime, setDisplayTime] = useState(localGameStart);
  const [displayTimeIso, setDisplayTimeIso] = useState(currentTimeIso);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canSend = response.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    persistBrowserTimeZoneCookie();

    const now = new Date();
    const browserTimeZone = getBrowserTimeZone();

    setDisplayTime(formatBrowserCurrentTime(now, browserTimeZone));
    setDisplayTimeIso(now.toISOString());
  }, []);

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
          browserTimeZone: getBrowserTimeZone(),
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
          className="text-base leading-7 font-medium text-muted-foreground text-balance dark:text-amber-100 sm:text-lg sm:leading-8"
        >
          Hi {playerName}, it is{" "}
          <time dateTime={displayTimeIso}>{displayTime}</time> in{" "}
          {playerLocation}.
        </p>
        <p className="text-2xl leading-9 font-semibold text-primary text-balance dark:text-amber-200 sm:text-4xl sm:leading-12">
          Where are you and what are you doing?
        </p>
      </div>

      <textarea
        autoFocus
        className="min-h-40 w-full resize-none rounded-md border border-border bg-card/80 px-4 py-3 text-base font-medium tracking-normal text-foreground shadow-2xl shadow-black/10 outline-none backdrop-blur-md transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/45 dark:text-amber-50 dark:shadow-black/35 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:min-h-48 sm:text-lg"
        name="opening-response"
        onChange={(event) => setResponse(event.target.value)}
        placeholder="I am..."
        readOnly={isSubmitting}
        value={response}
      />

      {error ? (
        <p className="max-w-lg rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive backdrop-blur dark:border-red-400/30 dark:bg-red-950/35 dark:text-red-100">
          {error}
        </p>
      ) : null}

      <Button
        className="h-12 w-full max-w-sm border border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-700 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-primary-foreground uppercase shadow-2xl shadow-black/20 backdrop-blur-md hover:brightness-[1.12] disabled:brightness-75 dark:border-amber-200/70 dark:from-amber-500 dark:to-amber-950 dark:text-amber-50 dark:shadow-black/60 dark:hover:brightness-[1.15] sm:h-14"
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

function formatBrowserCurrentTime(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
    weekday: "long",
  }).formatToParts(date);
  const weekday = getDatePart(parts, "weekday");
  const hour = Number(getDatePart(parts, "hour"));
  const minute = getDatePart(parts, "minute");
  const meridiem = hour < 12 ? "am" : "pm";
  const displayHour = hour % 12 || 12;
  const displayTime =
    minute === "00"
      ? `${displayHour}${meridiem}`
      : `${displayHour}:${minute}${meridiem}`;

  return `${displayTime} on ${weekday} ${getDaypart(hour)}`;
}

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function getDaypart(
  hour: number,
): "early morning" | "morning" | "afternoon" | "evening" | "night" {
  if (hour < 5) {
    return "early morning";
  }

  if (hour < 12) {
    return "morning";
  }

  if (hour < 17) {
    return "afternoon";
  }

  if (hour < 22) {
    return "evening";
  }

  return "night";
}

export function OpeningSceneContextPrompt({
  question,
}: {
  question: OpeningSceneContextQuestion;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canSend = answer.trim().length > 0 && !isSubmitting;

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const submitRequest = await fetch("/api/players/opening-scene-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answerText: answer.trim(),
        }),
      });
      const result = (await submitRequest.json()) as { error?: string };

      if (!submitRequest.ok) {
        throw new Error(result.error || "Unable to send answer.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send answer.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-labelledby="opening-scene-context-question"
      onSubmit={submitAnswer}
      className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-7 text-center"
    >
      <div className="grid gap-4">
        <p className="text-base leading-7 font-medium text-muted-foreground text-balance dark:text-amber-100/85 sm:text-lg sm:leading-8">
          The game needs one detail before the moment can continue.
        </p>
        <p
          id="opening-scene-context-question"
          className="text-2xl leading-9 font-semibold text-primary text-balance dark:text-amber-200 sm:text-4xl sm:leading-12"
        >
          {question.promptText}
        </p>
      </div>

      <textarea
        autoFocus
        className="min-h-32 w-full resize-none rounded-md border border-border bg-card/80 px-4 py-3 text-base font-medium tracking-normal text-foreground shadow-2xl shadow-black/10 outline-none backdrop-blur-md transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/45 dark:text-amber-50 dark:shadow-black/35 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:min-h-40 sm:text-lg"
        name="opening-scene-context-answer"
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="I..."
        readOnly={isSubmitting}
        value={answer}
      />

      {error ? (
        <p className="max-w-lg rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive backdrop-blur dark:border-red-400/30 dark:bg-red-950/35 dark:text-red-100">
          {error}
        </p>
      ) : null}

      <Button
        className="h-12 w-full max-w-sm border border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-700 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-primary-foreground uppercase shadow-2xl shadow-black/20 backdrop-blur-md hover:brightness-[1.12] disabled:brightness-75 dark:border-amber-200/70 dark:from-amber-500 dark:to-amber-950 dark:text-amber-50 dark:shadow-black/60 dark:hover:brightness-[1.15] sm:h-14"
        disabled={!canSend}
        type="submit"
      >
        {isSubmitting ? (
          <LoaderCircleIcon aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}
