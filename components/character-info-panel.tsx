"use client";

import { type FormEvent, useState } from "react";
import { PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CHARACTER_INFO_SECTION_KEYS,
  type CharacterInfo,
  type CharacterInfoItem,
  type CharacterInfoSectionKey,
} from "@/lib/character-info";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<CharacterInfoSectionKey, string> = {
  currentSituation: "Current Situation",
  relationships: "Relationships",
  resources: "Resources",
  constraints: "Constraints",
  goals: "Goals",
  knowledge: "Knowledge",
  openThreads: "Open Threads",
  recentChanges: "Recent Changes",
};

export function CharacterInfoPanel({
  characterInfo,
  editable = false,
  title = "Character",
}: {
  characterInfo?: CharacterInfo;
  editable?: boolean;
  title?: string;
}) {
  const sections = CHARACTER_INFO_SECTION_KEYS.map((section) => ({
    section,
    items: characterInfo?.sections[section] ?? [],
  })).filter(({ items }) => items.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className="rounded-md border border-border bg-card/75 p-4 shadow-2xl shadow-black/10 backdrop-blur-md dark:border-amber-300/20 dark:bg-black/35 dark:shadow-black/30"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-[0.2em] text-primary uppercase dark:text-amber-200">
          {title}
        </h2>
        {characterInfo?.updatedAt ? (
          <time
            className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
            dateTime={characterInfo.updatedAt}
          >
            {formatShortTime(characterInfo.updatedAt)}
          </time>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2">
        {sections.map(({ section, items }) => (
          <details className="group" key={section} open={!editable}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-t border-border/70 py-2 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase dark:border-amber-200/15">
              <span>{SECTION_LABELS[section]}</span>
              <span
                aria-hidden="true"
                className="text-primary/70 transition group-open:rotate-45 dark:text-amber-300/70"
              >
                +
              </span>
            </summary>
            <ul className="grid gap-2 pb-2">
              {items.map((item) => (
                <CharacterInfoListItem
                  editable={editable}
                  item={item}
                  key={item.id}
                  section={section}
                />
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

function CharacterInfoListItem({
  editable,
  item,
  section,
}: {
  editable: boolean;
  item: CharacterInfoItem;
  section: CharacterInfoSectionKey;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextText = text.trim();

    if (!nextText) {
      setError("Enter character info text.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/players/character-info-correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correction: {
            section,
            itemId: item.id,
            text: nextText,
          },
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to save correction.");
      }

      setIsEditing(false);
      router.refresh();
    } catch (correctionError) {
      setError(
        correctionError instanceof Error
          ? correctionError.message
          : "Unable to save correction.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <li className="rounded-md border border-border/70 bg-background/45 px-3 py-2 text-sm leading-6 text-foreground dark:border-amber-200/12 dark:bg-black/25 dark:text-amber-50/90">
      {editable && isEditing ? (
        <form className="grid gap-2" onSubmit={submitCorrection}>
          <textarea
            className="min-h-20 resize-y rounded-md border border-border bg-card/80 px-3 py-2 text-sm leading-6 outline-none focus:border-primary/70 focus:ring-2 focus:ring-ring/20 dark:border-amber-300/25 dark:bg-black/45"
            maxLength={180}
            onChange={(event) => setText(event.target.value)}
            value={text}
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {error ? (
              <p className="mr-auto text-xs text-destructive dark:text-red-200">
                {error}
              </p>
            ) : null}
            <Button
              className="!h-8 !rounded-[3px] px-3 text-xs"
              onClick={() => {
                setText(item.text);
                setIsEditing(false);
                setError("");
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              className="!h-8 !rounded-[3px] px-3 text-xs"
              disabled={isSaving}
              type="submit"
              variant="outline"
            >
              Save
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start gap-3">
          <p className="min-w-0 flex-1">{item.text}</p>
          {editable ? (
            <button
              aria-label="Correct character info"
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:text-foreground",
                "dark:border-amber-200/20 dark:hover:text-amber-100",
              )}
              onClick={() => setIsEditing(true)}
              type="button"
            >
              <PencilIcon aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </li>
  );
}

function formatShortTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
