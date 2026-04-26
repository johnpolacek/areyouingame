"use client";

import { useState } from "react";
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
  const [response, setResponse] = useState("");
  const canSend = response.trim().length > 0;

  return (
    <section
      aria-labelledby="opening-question"
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
        value={response}
      />

      <Button
        className="h-12 w-full max-w-sm border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-950 px-6 font-accent text-[0.84rem] font-normal tracking-[0.06em] text-amber-50 uppercase shadow-2xl shadow-black/60 backdrop-blur-md hover:brightness-[1.15] disabled:brightness-75 sm:h-14"
        disabled={!canSend}
      >
        Send
      </Button>
    </section>
  );
}
