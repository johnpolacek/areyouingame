"use client";

import type { ReactNode } from "react";

export const primaryActionClass =
  "relative isolate h-12 w-full max-w-[31rem] transition-all ease-in-out duration-500 overflow-hidden rounded-lg border border-amber-200/70 bg-gradient-to-b from-amber-500 to-amber-950 px-8 font-accent text-[0.8rem] font-normal tracking-[0.06em] text-amber-50 uppercase shadow-2xl shadow-black/60 backdrop-blur-md hover:-translate-y-0.5 hover:brightness-[1.18] hover:saturate-[1.2] hover:shadow-amber-400/40 active:translate-y-px disabled:opacity-90 sm:h-[4.5rem] sm:text-[1.12rem] sm:tracking-[0.08em]";

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
  return "h-7 rounded-md border border-amber-300/30 bg-black/35 px-2 text-xs font-medium tracking-normal text-amber-50 outline-none transition placeholder:text-amber-700 focus:border-amber-200/70 focus:ring-2 focus:ring-amber-500/20 sm:h-8 sm:px-2.5 sm:text-sm";
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
      className="hero-character-form grid w-full max-w-[31rem] grid-cols-2 gap-1.5 rounded-lg border border-amber-600/35 bg-slate-950/45 p-2 text-left shadow-2xl shadow-black/35 backdrop-blur-md sm:gap-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-amber-400 uppercase sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Name
        <input
          autoComplete="name"
          className={fieldClass()}
          name="character-name"
          onChange={(event) => onChange("name", event.target.value)}
          required
          value={draft.name}
        />
      </label>
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-amber-400 uppercase sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Age
        <input
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
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-amber-400 uppercase sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Location
        <input
          autoComplete="address-level2"
          className={fieldClass()}
          name="character-location"
          onChange={(event) => onChange("location", event.target.value)}
          required
          value={draft.location}
        />
      </label>
      <label className="grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-amber-400 uppercase sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Occupation
        <input
          className={fieldClass()}
          name="character-occupation"
          onChange={(event) => onChange("occupation", event.target.value)}
          required
          value={draft.occupation}
        />
      </label>
      <label className="col-span-2 grid gap-0.5 text-[0.56rem] font-bold tracking-[0.16em] text-amber-400 uppercase sm:gap-1 sm:text-[0.62rem] sm:tracking-[0.18em]">
        Bio
        <textarea
          className="min-h-16 resize-none rounded-md border border-amber-300/30 bg-black/35 px-2 py-1.5 text-xs font-medium tracking-normal text-amber-50 outline-none transition placeholder:text-amber-700 focus:border-amber-200/70 focus:ring-2 focus:ring-amber-500/20 sm:min-h-20 sm:px-2.5 sm:py-2 sm:text-sm"
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
          className="hero-display-title max-w-2xl text-5xl leading-none font-normal text-balance text-amber-500 sm:text-8xl"
        >
          {playerCreationHeading}
        </h1>
        <p className="max-w-2xl text-base leading-6 font-medium text-balance text-amber-100 sm:text-lg sm:leading-7">
          {playerCreationSubhead}
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
        {children}
        {error ? (
          <p className="player-creation-error max-w-lg rounded-md border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm leading-6 text-red-100 backdrop-blur">
            {error}
          </p>
        ) : null}
        {actions}
      </div>
    </section>
  );
}
