import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  generateCharacterPortraitImage,
  type CharacterPortraitDraft,
} from "@/lib/character-portrait-generation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { draft?: unknown };
    const draft = validateCharacterPortraitDraft(body.draft);
    const image = await generateCharacterPortraitImage({
      clerkUserId: userId,
      draft,
    });

    return Response.json({ image });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate character portrait.";

    return Response.json({ error: message }, { status: 400 });
  }
}

function validateCharacterPortraitDraft(input: unknown): CharacterPortraitDraft {
  if (!input || typeof input !== "object") {
    throw new Error("Character draft is required.");
  }

  const source = input as Record<string, unknown>;

  return {
    name: readRequiredString(source.name, "Name", 80),
    age: readRequiredString(source.age, "Age", 3),
    location: readRequiredString(source.location, "Location", 120),
    occupation: readRequiredString(source.occupation, "Occupation", 120),
    appearance: readRequiredString(source.appearance, "Appearance", 600),
    bio: readRequiredString(source.bio, "Bio", 800),
  };
}

function readRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new Error(`${label} is required.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return trimmed;
}
