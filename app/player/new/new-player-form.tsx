"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDraftTimeZone,
  pendingDraftStorageKey,
  persistBrowserTimeZoneCookie,
} from "@/lib/character-draft";
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
import type { CharacterImage } from "@/lib/character-image";

type NewPlayerFormProps = {
  successHref: string;
};

export function NewPlayerForm({
  successHref,
}: NewPlayerFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CharacterDraft>(emptyDraft);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [error, setError] = useState("");
  const canCreatePlayer = isCompleteDraft(draft) && !isSubmitting;
  const hasEnteredAllFields =
    draft.name.trim().length > 0 &&
    draft.age.trim().length > 0 &&
    draft.location.trim().length > 0 &&
    draft.occupation.trim().length > 0 &&
    draft.appearance.trim().length > 0 &&
    draft.bio.trim().length > 0;

  useEffect(() => {
    persistBrowserTimeZoneCookie();

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
        appearance:
          typeof parsedDraft.appearance === "string"
            ? parsedDraft.appearance
            : "",
        bio: typeof parsedDraft.bio === "string" ? parsedDraft.bio : "",
        characterImageDataUrl:
          typeof parsedDraft.characterImageDataUrl === "string"
            ? parsedDraft.characterImageDataUrl
            : "",
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
    setError("");
  }

  function updateImage(imageDataUrl: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      characterImage: undefined,
      characterImageDataUrl: imageDataUrl,
    }));
    setError("");
  }

  async function generateImage() {
    if (!hasEnteredAllFields) {
      setError("Please fill out all fields before generating a portrait.");
      return;
    }

    setIsGeneratingImage(true);
    setError("");

    try {
      const response = await fetch("/api/players/character-image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft: {
            name: draft.name.trim(),
            age: draft.age.trim(),
            location: draft.location.trim(),
            occupation: draft.occupation.trim(),
            appearance: draft.appearance.trim(),
            bio: draft.bio.trim(),
          },
        }),
      });
      const result = (await response.json()) as {
        image?: CharacterImage;
        error?: string;
      };

      if (!response.ok || !result.image) {
        throw new Error(result.error || "Unable to generate character portrait.");
      }

      setDraft((currentDraft) => ({
        ...currentDraft,
        characterImage: result.image,
        characterImageDataUrl: undefined,
      }));
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Unable to generate character portrait.",
      );
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function createPlayer() {
    if (
      !hasEnteredAllFields ||
      (!draft.characterImage && !draft.characterImageDataUrl)
    ) {
      setError("Please fill out all fields");
      return;
    }

    if (!canCreatePlayer) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const characterImage =
        draft.characterImage ??
        (await uploadCharacterImage(draft.characterImageDataUrl));
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
            appearance: draft.appearance.trim(),
            bio: draft.bio.trim(),
            timeZone: getDraftTimeZone(),
            characterImage,
            characterImageDataUrl: undefined,
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
          disabled={isSubmitting}
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
        isGeneratingImage={isGeneratingImage}
        isPreparingImage={isPreparingImage}
        onChange={updateDraft}
        onGenerateImage={() => {
          void generateImage();
        }}
        onImageChange={(imageDataUrl) => {
          setIsPreparingImage(true);
          updateImage(imageDataUrl);
          setIsPreparingImage(false);
        }}
        onSubmit={createPlayer}
      />
    </PlayerCreationView>
  );
}

async function uploadCharacterImage(imageDataUrl?: string): Promise<CharacterImage> {
  if (!imageDataUrl) {
    throw new Error("Character image is required.");
  }

  const blob = await (await fetch(imageDataUrl)).blob();
  const formData = new FormData();

  formData.append("image", blob, "character.webp");

  const response = await fetch("/api/players/character-image", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json()) as {
    image?: CharacterImage;
    error?: string;
  };

  if (!response.ok || !result.image) {
    throw new Error(result.error || "Unable to upload character image.");
  }

  return result.image;
}
