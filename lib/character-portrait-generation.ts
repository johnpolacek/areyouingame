import { generateImage } from "ai";
import { characterImageContentType, type CharacterImage } from "./character-image";
import { writeCharacterImageObject } from "./character-image-store";

export const CHARACTER_PORTRAIT_IMAGE_MODEL = "openai/gpt-image-2";
export const CHARACTER_PORTRAIT_IMAGE_QUALITY = "low";
export const CHARACTER_PORTRAIT_IMAGE_SIZE = "1024x1024";

export type CharacterPortraitDraft = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  appearance: string;
  bio: string;
};

export async function generateCharacterPortraitImage({
  clerkUserId,
  draft,
}: {
  clerkUserId: string;
  draft: CharacterPortraitDraft;
}): Promise<CharacterImage> {
  const { image } = await generateImage({
    model: CHARACTER_PORTRAIT_IMAGE_MODEL,
    prompt: buildCharacterPortraitPrompt(draft),
    size: CHARACTER_PORTRAIT_IMAGE_SIZE,
    providerOptions: {
      openai: {
        quality: CHARACTER_PORTRAIT_IMAGE_QUALITY,
        outputFormat: "webp",
      },
    },
  });
  const contentType = image.mediaType || characterImageContentType;

  if (contentType !== characterImageContentType) {
    throw new Error("Generated character portrait must be WebP.");
  }

  return await writeCharacterImageObject({
    body: image.uint8Array,
    clerkUserId,
  });
}

export function buildCharacterPortraitPrompt(
  draft: CharacterPortraitDraft,
): string {
  return [
    "Create a square character portrait for an interactive fiction player character.",
    "Style: grounded cinematic realism, tense near-future speculative fiction, natural light, emotionally specific, no gore.",
    "Frame the character from the chest up. Make the face clear. Do not include captions, UI, logos, symbols, or readable text.",
    `Name: ${draft.name}`,
    `Age: ${draft.age}`,
    `Location: ${draft.location}`,
    `Occupation: ${draft.occupation}`,
    `Appearance: ${draft.appearance}`,
    `Character background: ${draft.bio}`,
  ].join("\n");
}
