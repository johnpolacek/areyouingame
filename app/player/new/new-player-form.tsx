"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDraftTimeZone, pendingDraftStorageKey } from "@/lib/character-draft";
import {
  CharacterSetupForm,
  type CharacterDraft,
  type CharacterDraftField,
  emptyDraft,
  isCompleteDraft,
  PlayerCreationView,
  primaryActionClass,
  PrimaryActionLabel,
} from "../../character-draft-form";

type NewPlayerFormProps = {
  successHref: string;
};

export function NewPlayerForm({
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
            timeZone: getDraftTimeZone(draft.location),
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
    <PlayerCreationView
      actions={
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
      }
      error={error}
    >
      <CharacterSetupForm
        draft={draft}
        onChange={updateDraft}
        onSubmit={createPlayer}
      />
    </PlayerCreationView>
  );
}
