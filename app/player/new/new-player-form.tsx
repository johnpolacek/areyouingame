"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pendingDraftStorageKey } from "@/lib/character-draft";
import {
  CharacterSetupForm,
  type CharacterDraft,
  type CharacterDraftField,
  emptyDraft,
  isCompleteDraft,
  primaryActionClass,
  PrimaryActionLabel,
} from "../../character-draft-form";

type NewPlayerFormProps = {
  eventStartsAtIso: string;
  eventStartsAtLabel: string;
  gameId: string;
  successHref: string;
};

export function NewPlayerForm({
  eventStartsAtIso,
  eventStartsAtLabel,
  gameId,
  successHref,
}: NewPlayerFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canCreatePlayer = isCompleteDraft(draft) && !isSubmitting;

  useEffect(() => {
    const rawDraft = window.sessionStorage.getItem(pendingDraftStorageKey);

    if (!rawDraft) {
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as Partial<CharacterDraft>;

      setDraft({
        name: typeof parsedDraft.name === "string" ? parsedDraft.name : "",
        age: typeof parsedDraft.age === "string" ? parsedDraft.age : "",
        location:
          typeof parsedDraft.location === "string" ? parsedDraft.location : "",
        occupation:
          typeof parsedDraft.occupation === "string"
            ? parsedDraft.occupation
            : "",
        bio: typeof parsedDraft.bio === "string" ? parsedDraft.bio : "",
      });
    } catch {
      window.sessionStorage.removeItem(pendingDraftStorageKey);
    }
  }, []);

  function updateDraft(field: CharacterDraftField, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  async function createPlayer() {
    if (!canCreatePlayer) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft: {
            ...draft,
            name: draft.name.trim(),
            age: draft.age.trim(),
            location: draft.location.trim(),
            occupation: draft.occupation.trim(),
            bio: draft.bio.trim(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          },
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to create character.");
      }

      window.sessionStorage.removeItem(pendingDraftStorageKey);
      router.replace(successHref);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create character.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-7 text-center sm:gap-8"
      aria-labelledby="player-create-title"
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <p className="rounded-full border border-amber-500/30 bg-black/30 px-4 py-1 text-[0.62rem] font-bold tracking-[0.22em] text-amber-300 uppercase shadow-lg shadow-black/30 backdrop-blur">
          Game {gameId}
        </p>
        <h1
          id="player-create-title"
          className="hero-display-title max-w-3xl bg-gradient-to-t from-amber-600/90 via-amber-500 to-amber-200 bg-clip-text text-[clamp(4.25rem,14vw,10rem)] leading-[0.82] font-normal tracking-normal text-transparent [font-kerning:none] [text-rendering:optimizeSpeed]"
        >
          Are You In?
        </h1>
        <p className="max-w-2xl text-base leading-6 font-medium text-balance text-amber-100 sm:text-lg sm:leading-7">
          Create your player character for the world as it stands at{" "}
          <time dateTime={eventStartsAtIso}>{eventStartsAtLabel}</time>.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
        <CharacterSetupForm
          draft={draft}
          onChange={updateDraft}
          onSubmit={createPlayer}
        />
        {error ? (
          <p className="max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
            {error}
          </p>
        ) : null}
        <Button
          className={`${primaryActionClass} hero-create-account`}
          disabled={!canCreatePlayer}
          onClick={createPlayer}
        >
          {isSubmitting ? (
            <LoaderCircleIcon
              aria-hidden="true"
              className="relative z-[1] size-5 animate-spin"
            />
          ) : (
            <PrimaryActionLabel>Create Player</PrimaryActionLabel>
          )}
        </Button>
      </div>
    </section>
  );
}
