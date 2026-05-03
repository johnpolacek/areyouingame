"use client";

import { ImageIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useState } from "react";
import type { CharacterImage } from "@/lib/character-image";
import { resizeCharacterImageFile } from "@/lib/client-character-image";

export const primaryActionClass =
  "relative isolate h-12 w-full max-w-[31rem] overflow-hidden rounded-lg border border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-700 px-8 font-accent text-[0.8rem] font-normal tracking-[0.06em] text-primary-foreground uppercase shadow-2xl shadow-black/20 backdrop-blur-md transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:brightness-[1.12] hover:saturate-[1.15] hover:shadow-amber-600/30 active:translate-y-px disabled:opacity-90 dark:border-amber-200/70 dark:from-amber-500 dark:to-amber-950 dark:text-amber-50 dark:shadow-black/60 dark:hover:brightness-[1.18] dark:hover:saturate-[1.2] dark:hover:shadow-amber-400/40 sm:h-[4.5rem] sm:text-[1.12rem] sm:tracking-[0.08em]";

export const playerCreationHeading = "Are You In?";
export const playerCreationSubhead = "Sign up to create your player character";

export type CharacterDraft = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  appearance: string;
  bio: string;
  characterImage?: CharacterImage;
  characterImageDataUrl?: string;
};

export type CharacterDraftField =
  | "name"
  | "age"
  | "location"
  | "occupation"
  | "appearance"
  | "bio";

export const emptyDraft: CharacterDraft = {
  name: "",
  age: "",
  location: "",
  occupation: "",
  appearance: "",
  bio: "",
};

export function PrimaryActionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative z-[1] inline-flex min-w-[min(12rem,58vw)] translate-y-px items-center justify-center">
      {children}
    </span>
  );
}

export function isCompleteDraft(draft: CharacterDraft) {
  const age = Number(draft.age);

  return (
    draft.name.trim().length > 0 &&
    Number.isInteger(age) &&
    age >= 13 &&
    age <= 120 &&
    draft.location.trim().length > 0 &&
    draft.occupation.trim().length > 0 &&
    draft.appearance.trim().length > 0 &&
    draft.bio.trim().length > 0 &&
    Boolean(draft.characterImage || draft.characterImageDataUrl)
  );
}

function fieldClass() {
  return "h-7 rounded-md border border-border bg-input px-2 text-xs font-medium tracking-normal text-foreground shadow-inner shadow-black/5 outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/35 dark:text-amber-50 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:h-8 sm:px-2.5 sm:text-sm";
}

export function CharacterSetupForm({
  draft,
  onChange,
  onGenerateDraft,
  onImageChange,
  onGenerateImage,
  onSubmit,
  isGeneratingDraft = false,
  isGeneratingImage = false,
  isPreparingImage = false,
}: {
  draft: CharacterDraft;
  onChange: (field: CharacterDraftField, value: string) => void;
  onGenerateDraft?: () => void;
  onImageChange?: (imageDataUrl: string) => void;
  onGenerateImage?: () => void;
  onSubmit?: () => void;
  isGeneratingDraft?: boolean;
  isGeneratingImage?: boolean;
  isPreparingImage?: boolean;
}) {
  const [imageError, setImageError] = useState("");
  const canGenerateImage =
    Boolean(onGenerateImage) &&
    draft.name.trim().length > 0 &&
    draft.age.trim().length > 0 &&
    draft.location.trim().length > 0 &&
    draft.occupation.trim().length > 0 &&
    draft.appearance.trim().length > 0;

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !onImageChange) {
      return;
    }

    try {
      setImageError("");
      const resized = await resizeCharacterImageFile(file);
      const dataUrl = await blobToDataUrl(resized);

      onImageChange(dataUrl);
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Unable to prepare image.",
      );
    }
  }

  return (
    <form
      autoComplete="off"
      className="hero-character-form grid w-full max-w-[31rem] grid-cols-2 gap-1.5 rounded-lg border border-border bg-card/80 p-2 text-left shadow-2xl shadow-black/10 backdrop-blur-md dark:border-amber-600/35 dark:bg-slate-950/45 dark:shadow-black/35 sm:gap-3 sm:p-4 lg:max-w-5xl lg:grid-cols-[repeat(2,minmax(0,15.5rem))_minmax(16rem,24rem)] lg:items-start"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      {onGenerateDraft ? (
        <div className="col-span-2 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold tracking-[0.12em] text-primary uppercase transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-200/35 dark:bg-amber-400/10 dark:text-amber-100"
            disabled={isGeneratingDraft}
            onClick={() => onGenerateDraft()}
            type="button"
          >
            {isGeneratingDraft ? (
              <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <SparklesIcon aria-hidden="true" className="size-3.5" />
            )}
            Generate Character
          </button>
        </div>
      ) : null}
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Name
        <input
          autoComplete="off"
          className={fieldClass()}
          name="character-name"
          onChange={(event) => onChange("name", event.target.value)}
          required
          value={draft.name}
        />
      </label>
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Age
        <input
          autoComplete="off"
          className={fieldClass()}
          inputMode="numeric"
          max="120"
          min="13"
          name="character-age"
          onChange={(event) => onChange("age", event.target.value)}
          required
          type="number"
          value={draft.age}
        />
      </label>
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Location
        <input
          autoComplete="off"
          className={fieldClass()}
          name="character-location"
          onChange={(event) => onChange("location", event.target.value)}
          required
          value={draft.location}
        />
      </label>
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Occupation
        <input
          autoComplete="off"
          className={fieldClass()}
          name="character-occupation"
          onChange={(event) => onChange("occupation", event.target.value)}
          required
          value={draft.occupation}
        />
      </label>
      <label className="col-span-2 grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Appearance
        <textarea
          autoComplete="off"
          className="min-h-14 resize-none rounded-md border border-border bg-input px-2 py-1.5 text-xs font-medium tracking-normal text-foreground shadow-inner shadow-black/5 outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/35 dark:text-amber-50 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:min-h-16 sm:px-2.5 sm:py-2 sm:text-sm"
          maxLength={600}
          name="character-appearance"
          onChange={(event) => onChange("appearance", event.target.value)}
          required
          value={draft.appearance}
        />
      </label>
      <label className="col-span-2 grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Bio
        <textarea
          autoComplete="off"
          className="min-h-16 resize-none rounded-md border border-border bg-input px-2 py-1.5 text-xs font-medium tracking-normal text-foreground shadow-inner shadow-black/5 outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/35 dark:text-amber-50 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:min-h-20 sm:px-2.5 sm:py-2 sm:text-sm"
          maxLength={800}
          name="character-bio"
          onChange={(event) => onChange("bio", event.target.value)}
          required
          value={draft.bio}
        />
      </label>
      <label className="col-span-2 grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-primary uppercase dark:text-amber-400 sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em] lg:col-span-1 lg:col-start-3 lg:row-span-5 lg:row-start-1">
        Portrait
        <span className="grid gap-2 rounded-md border border-border bg-input p-2 text-left shadow-inner shadow-black/5 dark:border-amber-300/30 dark:bg-black/35">
          <span className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-md border border-border/70 bg-background/70 dark:border-amber-200/20 dark:bg-black/35">
            {draft.characterImageDataUrl || draft.characterImage?.url ? (
              <img
                alt=""
                className="h-full w-full object-cover"
                src={draft.characterImageDataUrl ?? draft.characterImage?.url}
              />
            ) : (
              <ImageIcon
                aria-hidden="true"
                className="size-8 text-muted-foreground dark:text-amber-100/45"
              />
            )}
          </span>
          <span className="flex min-w-0 flex-wrap gap-2">
            {onGenerateImage ? (
              <button
                className="inline-flex w-fit items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-bold tracking-[0.12em] text-foreground uppercase transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-200/35 dark:bg-amber-400/10 dark:text-amber-100"
                disabled={!canGenerateImage || isGeneratingImage}
                onClick={() => onGenerateImage()}
                type="button"
              >
                {isGeneratingImage ? (
                  <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin" />
                ) : (
                  <SparklesIcon aria-hidden="true" className="size-3.5" />
                )}
                Generate
              </button>
            ) : null}
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-2 text-xs font-bold tracking-[0.12em] text-foreground uppercase transition hover:bg-muted dark:border-amber-200/25 dark:bg-black/30 dark:text-amber-100">
              {isPreparingImage ? (
                <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <ImageIcon aria-hidden="true" className="size-3.5" />
              )}
              Choose Image
            </span>
          </span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            name="character-image"
            onChange={handleImageChange}
            required={!draft.characterImage && !draft.characterImageDataUrl}
            type="file"
          />
          {imageError ? (
            <span className="text-xs leading-5 font-semibold tracking-normal text-destructive normal-case dark:text-red-200">
              {imageError}
            </span>
          ) : null}
        </span>
      </label>
    </form>
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export function PlayerCreationView({
  actions,
  children,
  error,
  showSubhead = true,
  titleId = "player-create-title",
}: {
  actions: ReactNode;
  children: ReactNode;
  error?: string;
  showSubhead?: boolean;
  titleId?: string;
}) {
  return (
    <section
      className="player-creation-view relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 self-center text-center sm:gap-8"
      aria-labelledby={titleId}
    >
      <div className="player-creation-copy flex w-full max-w-2xl flex-col items-center gap-3 text-center sm:gap-4">
        <h1
          id={titleId}
          className="hero-display-title max-w-2xl text-5xl leading-none font-normal text-balance text-primary dark:text-amber-500 sm:text-8xl"
        >
          {playerCreationHeading}
        </h1>
        {showSubhead ? (
          <p className="max-w-2xl text-base leading-6 font-medium text-balance text-muted-foreground dark:text-amber-100 sm:text-lg sm:leading-7">
            {playerCreationSubhead}
          </p>
        ) : null}
        <p className="max-w-md text-base leading-6 font-medium text-muted-foreground/80 dark:text-amber-100/70">
          Heads up: your character and gameplay will be public.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
        {children}
        {error ? (
          <p className="player-creation-error max-w-lg rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive backdrop-blur dark:border-red-400/30 dark:bg-red-950/35 dark:text-red-100">
            {error}
          </p>
        ) : null}
        {actions}
      </div>
    </section>
  );
}
