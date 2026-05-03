import { trackedGenerateText } from "./ai-usage";
import { getOpenAIClassifierModel } from "./openai-models";

export type CharacterDraftFields = {
  name?: string;
  age?: string;
  location?: string;
  occupation?: string;
  appearance?: string;
  bio?: string;
};

export type CharacterDraftSuggestion = Required<CharacterDraftFields>;

const fieldLimits = {
  name: 80,
  age: 3,
  location: 120,
  occupation: 120,
  appearance: 600,
  bio: 800,
} as const;

export async function generateCharacterDraftSuggestion({
  draft,
  clerkUserId,
}: {
  draft: CharacterDraftFields;
  clerkUserId?: string;
}): Promise<CharacterDraftSuggestion> {
  const model = getOpenAIClassifierModel();
  const result = await trackedGenerateText({
    model,
    operation: "character_draft_fill",
    clerkUserId,
    system:
      "You create concise, grounded player characters for a near-future interactive fiction game. Return only valid JSON.",
    prompt: buildCharacterDraftFillPrompt(draft),
  });

  return parseCharacterDraftSuggestion(result.text);
}

export function buildCharacterDraftFillPrompt(
  draft: CharacterDraftFields,
): string {
  const populatedFields = characterDraftFieldNames
    .filter((field) => readTrimmed(draft[field]))
    .map((field) => `${field}: ${readTrimmed(draft[field])}`)
    .join("\n");
  const missingFields = characterDraftFieldNames
    .filter((field) => !readTrimmed(draft[field]))
    .join(", ");

  return [
    "Fill a character creation form for Are You In.",
    "Use any populated fields as fixed facts.",
    "Do not contradict populated fields.",
    "Infer plausible missing details from populated facts such as name, age, location, occupation, appearance, and bio.",
    "Avoid stereotypes. Keep the character specific, playable, and grounded in the present day or near future.",
    "Return every field in JSON, including populated fields unchanged and missing fields completed.",
    "Use these exact keys: name, age, location, occupation, appearance, bio.",
    "Keep age as a numeric string from 13 to 120.",
    "Keep location short. Keep occupation short.",
    "Appearance should be one vivid paragraph with concrete visual details.",
    "Bio should be one compact paragraph with a current life situation and playable tension.",
    populatedFields
      ? `Populated fields:\n${populatedFields}`
      : "Populated fields: none",
    missingFields ? `Missing fields: ${missingFields}` : "Missing fields: none",
  ].join("\n\n");
}

export function parseCharacterDraftSuggestion(
  text: string,
): CharacterDraftSuggestion {
  const parsed = JSON.parse(extractJsonObject(text)) as Record<string, unknown>;
  const suggestion = {
    name: readRequiredGeneratedString(parsed.name, "name"),
    age: readGeneratedAge(parsed.age),
    location: readRequiredGeneratedString(parsed.location, "location"),
    occupation: readRequiredGeneratedString(parsed.occupation, "occupation"),
    appearance: readRequiredGeneratedString(parsed.appearance, "appearance"),
    bio: readRequiredGeneratedString(parsed.bio, "bio"),
  };

  return trimSuggestionToLimits(suggestion);
}

export function mergeGeneratedCharacterDraft(
  currentDraft: CharacterDraftFields,
  suggestion: CharacterDraftSuggestion,
): CharacterDraftSuggestion {
  return {
    name: readTrimmed(currentDraft.name) || suggestion.name,
    age: readTrimmed(currentDraft.age) || suggestion.age,
    location: readTrimmed(currentDraft.location) || suggestion.location,
    occupation: readTrimmed(currentDraft.occupation) || suggestion.occupation,
    appearance: readTrimmed(currentDraft.appearance) || suggestion.appearance,
    bio: readTrimmed(currentDraft.bio) || suggestion.bio,
  };
}

const characterDraftFieldNames = [
  "name",
  "age",
  "location",
  "occupation",
  "appearance",
  "bio",
] as const;

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("Generated character draft was not valid JSON.");
  }

  return text.slice(start, end + 1);
}

function readRequiredGeneratedString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Generated character draft is missing ${field}.`);
  }

  return value.trim();
}

function readGeneratedAge(value: unknown): string {
  const ageText = readRequiredGeneratedString(value, "age");
  const age = Number(ageText);

  if (!Number.isInteger(age) || age < 13 || age > 120) {
    throw new Error("Generated character age must be from 13 to 120.");
  }

  return String(age);
}

function trimSuggestionToLimits(
  suggestion: CharacterDraftSuggestion,
): CharacterDraftSuggestion {
  return {
    name: suggestion.name.slice(0, fieldLimits.name),
    age: suggestion.age.slice(0, fieldLimits.age),
    location: suggestion.location.slice(0, fieldLimits.location),
    occupation: suggestion.occupation.slice(0, fieldLimits.occupation),
    appearance: suggestion.appearance.slice(0, fieldLimits.appearance),
    bio: suggestion.bio.slice(0, fieldLimits.bio),
  };
}

function readTrimmed(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}
