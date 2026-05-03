import { createHash } from "node:crypto";
import { fetchMutation } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";

export type ModerationSource =
  | "character_draft"
  | "character_image_upload"
  | "opening_response"
  | "yes_no_text_response"
  | "post_choice_action"
  | "connected_path_action"
  | "orb_decision_action"
  | "connected_asi_action"
  | "character_info_correction";

export type ModerationDecision = "allow" | "review" | "block";

export type ModerationEvent = {
  id: string;
  source: ModerationSource;
  decision: ModerationDecision;
  model: string;
  inputType: "text" | "image";
  textHash?: string;
  dailyGameId?: string;
  playerId?: string;
  clerkUserId?: string;
  flagged: boolean;
  categories: ModerationCategory[];
  createdAt: string;
};

export type ModerationCategory = {
  category: string;
  flagged: boolean;
  score: number;
};

type ModerationInput =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

const moderationModel = "omni-moderation-latest";
const hardBlockCategories = new Set([
  "harassment/threatening",
  "hate/threatening",
  "illicit/violent",
  "self-harm/instructions",
  "sexual/minors",
  "violence/graphic",
]);

const recordModerationEventRef = makeFunctionReference<
  "mutation",
  {
    backendSecret: string;
    event: ModerationEvent;
  },
  null
>("playerStore:recordModerationEvent");

export class ModerationBlockedError extends Error {
  constructor(public readonly event: ModerationEvent) {
    super("This submission can't be used. Please revise it and try again.");
    this.name = "ModerationBlockedError";
  }
}

export async function moderateTextOrThrow({
  clerkUserId,
  dailyGameId,
  playerId,
  source,
  text,
}: {
  clerkUserId?: string;
  dailyGameId?: string;
  playerId?: string;
  source: ModerationSource;
  text: string;
}): Promise<ModerationEvent> {
  const event = await moderateContent({
    clerkUserId,
    dailyGameId,
    input: text,
    inputType: "text",
    playerId,
    source,
    textHash: hashText(text),
  });

  if (event.decision === "block") {
    throw new ModerationBlockedError(event);
  }

  return event;
}

export async function moderateCharacterDraftOrThrow({
  clerkUserId,
  dailyGameId,
  draft,
}: {
  clerkUserId?: string;
  dailyGameId?: string;
  draft: {
    name: string;
    age: string;
    location: string;
    occupation: string;
    appearance?: string;
    bio: string;
  };
}): Promise<ModerationEvent> {
  return await moderateTextOrThrow({
    clerkUserId,
    dailyGameId,
    source: "character_draft",
    text: [
      `Name: ${draft.name}`,
      `Age: ${draft.age}`,
      `Location: ${draft.location}`,
      `Occupation: ${draft.occupation}`,
      draft.appearance ? `Appearance: ${draft.appearance}` : "",
      `Bio: ${draft.bio}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function moderateImageUploadOrThrow({
  bytes,
  clerkUserId,
  contentType,
  source,
}: {
  bytes: Uint8Array;
  clerkUserId?: string;
  contentType: string;
  source: "character_image_upload";
}): Promise<ModerationEvent> {
  const dataUrl = `data:${contentType};base64,${Buffer.from(bytes).toString("base64")}`;
  const event = await moderateContent({
    clerkUserId,
    input: [
      { type: "text", text: "Direct user-uploaded Are You In character portrait." },
      { type: "image_url", image_url: { url: dataUrl } },
    ],
    inputType: "image",
    source,
  });

  if (event.decision !== "allow") {
    throw new ModerationBlockedError(event);
  }

  return event;
}

async function moderateContent({
  clerkUserId,
  dailyGameId,
  input,
  inputType,
  playerId,
  source,
  textHash,
}: {
  clerkUserId?: string;
  dailyGameId?: string;
  input: ModerationInput;
  inputType: "text" | "image";
  playerId?: string;
  source: ModerationSource;
  textHash?: string;
}): Promise<ModerationEvent> {
  const response = await fetch("https://api.openai.com/v1/moderations", {
    body: JSON.stringify({
      input,
      model: moderationModel,
    }),
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to moderate submission.");
  }

  const result = (await response.json()) as {
    model?: string;
    results?: Array<{
      flagged?: boolean;
      categories?: Record<string, boolean>;
      category_scores?: Record<string, number>;
    }>;
  };
  const firstResult = result.results?.[0];

  if (!firstResult) {
    throw new Error("Moderation response was empty.");
  }

  const categories = normalizeCategories(
    firstResult.categories,
    firstResult.category_scores,
  );
  const flagged = Boolean(firstResult.flagged);
  const decision = decideModerationAction({
    categories,
    flagged,
    inputType,
  });
  const event = {
    id: crypto.randomUUID(),
    source,
    decision,
    model: result.model ?? moderationModel,
    inputType,
    ...(textHash ? { textHash } : {}),
    ...(dailyGameId ? { dailyGameId } : {}),
    ...(playerId ? { playerId } : {}),
    ...(clerkUserId ? { clerkUserId } : {}),
    flagged,
    categories,
    createdAt: new Date().toISOString(),
  };

  await recordModerationEvent(event);

  return event;
}

export function decideModerationAction({
  categories,
  flagged,
  inputType,
}: {
  categories: ModerationCategory[];
  flagged: boolean;
  inputType: "text" | "image";
}): ModerationDecision {
  if (!flagged) {
    return "allow";
  }

  if (inputType === "image") {
    return "block";
  }

  return categories.some(
    (category) =>
      category.flagged && hardBlockCategories.has(category.category),
  )
    ? "block"
    : "review";
}

function normalizeCategories(
  categories: Record<string, boolean> | undefined,
  scores: Record<string, number> | undefined,
): ModerationCategory[] {
  const categoryNames = new Set([
    ...Object.keys(categories ?? {}),
    ...Object.keys(scores ?? {}),
  ]);

  return [...categoryNames]
    .map((category) => ({
      category,
      flagged: Boolean(categories?.[category]),
      score: readScore(scores?.[category]),
    }))
    .sort((left, right) => left.category.localeCompare(right.category));
}

async function recordModerationEvent(event: ModerationEvent) {
  try {
    await fetchMutation(recordModerationEventRef, {
      backendSecret: getBackendSecret(),
      event,
    });
  } catch (error) {
    console.error("Unable to record moderation event.", error);
  }
}

function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function readScore(value: number | undefined): number {
  return Number.isFinite(value) && value ? value : 0;
}

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  return apiKey;
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}
