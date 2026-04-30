"use client";

import type { ReactNode } from "react";

export const primaryActionClass =
  "relative isolate h-12 w-full max-w-[31rem] overflow-hidden rounded-lg border border-amber-600/40 bg-gradient-to-b from-amber-300 to-amber-700 px-8 font-accent text-[0.8rem] font-normal tracking-[0.06em] text-primary-foreground uppercase shadow-2xl shadow-black/20 backdrop-blur-md transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:brightness-[1.12] hover:saturate-[1.15] hover:shadow-amber-600/30 active:translate-y-px disabled:opacity-90 dark:border-amber-200/70 dark:from-amber-500 dark:to-amber-950 dark:text-amber-50 dark:shadow-black/60 dark:hover:brightness-[1.18] dark:hover:saturate-[1.2] dark:hover:shadow-amber-400/40 sm:h-[4.5rem] sm:text-[1.12rem] sm:tracking-[0.08em]";

export const playerCreationHeading = "Are You In?";
export const playerCreationSubhead = "Sign up to create your player character";

export type CharacterDraft = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
};

export type CharacterDraftField = keyof CharacterDraft;

export const emptyDraft: CharacterDraft = {
  name: "",
  age: "",
  location: "",
  occupation: "",
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
    draft.bio.trim().length > 0
  );
}

function fieldClass() {
  return "h-7 rounded-md border border-border bg-input px-2 text-xs font-medium tracking-normal text-foreground shadow-inner shadow-black/5 outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/30 dark:bg-black/35 dark:text-amber-50 dark:placeholder:text-amber-700 dark:focus:border-amber-200/70 dark:focus:ring-amber-500/20 sm:h-8 sm:px-2.5 sm:text-sm";
}

export function CharacterSetupForm({
  draft,
  onChange,
  onSubmit,
}: {
  draft: CharacterDraft;
  onChange: (field: CharacterDraftField, value: string) => void;
  onSubmit?: () => void;
}) {
  return (
    <form
      autoComplete="off"
      className="hero-character-form grid w-full max-w-[31rem] grid-cols-2 gap-1.5 rounded-lg border border-border bg-card/80 p-2 text-left shadow-2xl shadow-black/10 backdrop-blur-md dark:border-amber-600/35 dark:bg-slate-950/45 dark:shadow-black/35 sm:gap-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
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
    </form>
  );
}

export function PlayerCreationView({
  actions,
  children,
  error,
  titleId = "player-create-title",
}: {
  actions: ReactNode;
  children: ReactNode;
  error?: string;
  titleId?: string;
}) {
  return (
    <section
      className="player-creation-view relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-6 self-center text-center sm:gap-8"
      aria-labelledby={titleId}
    >
      <div className="player-creation-copy flex w-full max-w-2xl flex-col items-center gap-3 text-center sm:gap-4">
        <h1
          id={titleId}
          className="hero-display-title max-w-2xl text-5xl leading-none font-normal text-balance text-primary dark:text-amber-500 sm:text-8xl"
        >
          {playerCreationHeading}
        </h1>
        <p className="max-w-2xl text-base leading-6 font-medium text-balance text-muted-foreground dark:text-amber-100 sm:text-lg sm:leading-7">
          {playerCreationSubhead}
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
