import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  generateCharacterDraftSuggestion,
  mergeGeneratedCharacterDraft,
  type CharacterDraftFields,
} from "@/lib/character-draft-generation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();

  try {
    const body = (await request.json()) as { draft?: unknown };
    const draft = readCharacterDraftFields(body.draft);
    const suggestion = await generateCharacterDraftSuggestion({
      clerkUserId: userId ?? undefined,
      draft,
    });

    return Response.json({
      draft: mergeGeneratedCharacterDraft(draft, suggestion),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate character.";

    return Response.json({ error: message }, { status: 400 });
  }
}

function readCharacterDraftFields(input: unknown): CharacterDraftFields {
  if (!input || typeof input !== "object") {
    return {};
  }

  const source = input as Record<string, unknown>;

  return {
    name: readOptionalString(source.name),
    age: readOptionalString(source.age),
    location: readOptionalString(source.location),
    occupation: readOptionalString(source.occupation),
    appearance: readOptionalString(source.appearance),
    bio: readOptionalString(source.bio),
  };
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}
