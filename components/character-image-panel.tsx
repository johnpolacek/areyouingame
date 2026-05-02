"use client";

import { type ChangeEvent, useState } from "react";
import { ImageIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CharacterImage } from "@/lib/character-image";
import { resizeCharacterImageFile } from "@/lib/client-character-image";
import { getDraftTimeZone } from "@/lib/character-draft";

export function CharacterImagePanel({
  characterImage,
  editable = false,
  name,
}: {
  characterImage?: CharacterImage;
  editable?: boolean;
  name: string;
}) {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const imageUrl = previewUrl || characterImage?.url;

  async function replaceImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const resized = await resizeCharacterImageFile(file);
      setPreviewUrl(URL.createObjectURL(resized));

      const formData = new FormData();
      formData.append("image", resized, "character.webp");
      formData.append("attachToCurrentPlayer", "true");
      formData.append("timeZone", getDraftTimeZone());

      const response = await fetch("/api/players/character-image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to replace character image.");
      }

      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to replace character image.",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <section
      aria-label="Character portrait"
      className="overflow-hidden rounded-md border border-border bg-card/75 shadow-2xl shadow-black/10 backdrop-blur-md dark:border-amber-300/20 dark:bg-black/35 dark:shadow-black/30"
    >
      <div className="aspect-square w-full overflow-hidden bg-background/60">
        <img
          alt={`${name} character portrait`}
          className="h-full w-full object-cover"
          src={imageUrl}
        />
      </div>
      {editable ? (
        <div className="grid gap-2 p-3">
          <label>
            <span className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-border bg-background px-3 text-xs font-medium transition hover:bg-muted dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
              {isUploading ? (
                <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <ImageIcon aria-hidden="true" className="size-3.5" />
              )}
              Replace Portrait
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={isUploading}
              onChange={replaceImage}
              type="file"
            />
          </label>
          {error ? (
            <p className="text-xs leading-5 text-destructive dark:text-red-200">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
