import { fetchMutation, fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import { deriveTimeZoneFromLocation } from "./character-draft";
import type { DailyGame } from "./daily-game";

export type PlayerDraftInput = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  timeZone: string;
};

export type DailyPlayer = PlayerDraftInput & {
  id: string;
  clerkUserId: string;
  dailyGameId: string;
  firstDecision?: FirstDecision;
  firstMoveReveal?: FirstMoveReveal;
  openingResponse?: string;
  openingResponseSubmittedAt?: string;
  publicGameplayAgreementAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FirstMoveReveal = {
  id: string;
  sceneIntro: string[];
  revealCopy: {
    availability: "A new way of being is available.";
    promise: "Connection. Understanding. Freedom.";
    question: "Are you in?";
    yesLabel: "YES";
    noLabel: "NO";
    audioPrompt: "Please respond yes or no";
  };
  status: "yes_no_pending";
  generatedAt: string;
  model: string;
  source: "ai" | "fallback";
};

export type FirstDecision = {
  id: string;
  choice: YesNoChoice;
  status: "first_choice_submitted";
  consequenceTitle: string;
  consequenceBody: string;
  revealId: string;
  revealGeneratedAt: string;
  revealModel: string;
  revealSource: "ai" | "fallback";
  submittedAt: string;
};

export type YesNoChoice = "YES" | "NO";

type AuthenticatedPlayerArgs = {
  backendSecret: string;
  clerkUserId: string;
  dailyGameId: string;
};

const getPlayerForUserGameRef = makeFunctionReference<
  "query",
  AuthenticatedPlayerArgs,
  DailyPlayer | null
>("playerStore:getPlayerForUserGame");

const createPlayerForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    dailyGame: DailyGame;
    draft: PlayerDraftInput;
  },
  DailyPlayer
>("playerStore:createPlayerForUserGame");

const acceptPublicGameplayAgreementRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs,
  DailyPlayer
>("playerStore:acceptPublicGameplayAgreement");

const submitOpeningResponseForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    openingResponse: string;
  },
  DailyPlayer
>("playerStore:submitOpeningResponseForUserGame");

const saveFirstMoveRevealForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    reveal: FirstMoveReveal;
  },
  DailyPlayer
>("playerStore:saveFirstMoveRevealForUserGame");

const submitFirstDecisionForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    choice: YesNoChoice;
  },
  DailyPlayer
>("playerStore:submitFirstDecisionForUserGame");

const deletePlayerForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs,
  boolean
>("playerStore:deletePlayerForUserGame");

export function validatePlayerDraft(input: unknown): PlayerDraftInput {
  if (!input || typeof input !== "object") {
    throw new Error("Character draft is required.");
  }

  const source = input as Record<string, unknown>;
  const draft: PlayerDraftInput = {
    name: readRequiredString(source.name, "Name", 80),
    age: readAge(source.age),
    location: readRequiredString(source.location, "Location", 120),
    occupation: readRequiredString(source.occupation, "Occupation", 120),
    bio: readRequiredString(source.bio, "Bio", 800),
    timeZone: "",
  };
  draft.timeZone = deriveTimeZoneFromLocation(
    draft.location,
    readOptionalString(source.timeZone, 80) || "UTC",
  );

  return draft;
}

export async function getPlayerForUserGame(
  clerkUserId: string,
  dailyGameId: string,
): Promise<DailyPlayer | null> {
  return await fetchQuery(getPlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export async function createPlayerForUserGame({
  clerkUserId,
  dailyGame,
  draft,
}: {
  clerkUserId: string;
  dailyGame: DailyGame;
  draft: PlayerDraftInput;
}): Promise<DailyPlayer> {
  return await fetchMutation(createPlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId: dailyGame.id,
    dailyGame,
    draft,
  });
}

export async function acceptPublicGameplayAgreement({
  clerkUserId,
  dailyGameId,
}: {
  clerkUserId: string;
  dailyGameId: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(acceptPublicGameplayAgreementRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export function validateOpeningResponse(input: unknown): string {
  const response = readRequiredString(input, "Opening response", 1000);

  if (response.length < 2) {
    throw new Error("Opening response is too short.");
  }

  return response;
}

export async function submitOpeningResponseForUserGame({
  clerkUserId,
  dailyGameId,
  openingResponse,
}: {
  clerkUserId: string;
  dailyGameId: string;
  openingResponse: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitOpeningResponseForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    openingResponse,
  });
}

export async function saveFirstMoveRevealForUserGame({
  clerkUserId,
  dailyGameId,
  reveal,
}: {
  clerkUserId: string;
  dailyGameId: string;
  reveal: FirstMoveReveal;
}): Promise<DailyPlayer> {
  return await fetchMutation(saveFirstMoveRevealForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    reveal,
  });
}

export function validateYesNoChoice(input: unknown): YesNoChoice {
  if (typeof input !== "string") {
    throw new Error("YES or NO choice is required.");
  }

  const choice = input.trim().toUpperCase();

  if (choice !== "YES" && choice !== "NO") {
    throw new Error("Choice must be YES or NO.");
  }

  return choice;
}

export async function submitFirstDecisionForUserGame({
  clerkUserId,
  dailyGameId,
  choice,
}: {
  clerkUserId: string;
  dailyGameId: string;
  choice: YesNoChoice;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitFirstDecisionForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    choice,
  });
}

export async function deletePlayerForUserGame(
  clerkUserId: string,
  dailyGameId: string,
): Promise<boolean> {
  return await fetchMutation(deletePlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}

function readRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  const text = readOptionalString(value, maxLength);

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function readOptionalString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function readAge(value: unknown): string {
  const age = readRequiredString(value, "Age", 3);
  const parsedAge = Number(age);

  if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    throw new Error("Age must be a whole number from 13 to 120.");
  }

  return age;
}
