import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { deriveTimeZoneFromLocation } from "./character-draft";

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

type PlayerStoreFile = {
  players: DailyPlayer[];
};

const storePath = path.join(process.cwd(), ".data", "players.json");

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
  const store = await readStore();

  return (
    store.players.find(
      (player) =>
        player.clerkUserId === clerkUserId && player.dailyGameId === dailyGameId,
    ) ?? null
  );
}

export async function createPlayerForUserGame({
  clerkUserId,
  dailyGameId,
  draft,
}: {
  clerkUserId: string;
  dailyGameId: string;
  draft: PlayerDraftInput;
}): Promise<DailyPlayer> {
  const store = await readStore();
  const existingPlayer = store.players.find(
    (player) =>
      player.clerkUserId === clerkUserId && player.dailyGameId === dailyGameId,
  );

  if (existingPlayer) {
    return existingPlayer;
  }

  const now = new Date().toISOString();
  const player: DailyPlayer = {
    ...draft,
    id: `${dailyGameId}:${clerkUserId}`,
    clerkUserId,
    dailyGameId,
    createdAt: now,
    updatedAt: now,
  };

  await writeStore({
    players: [...store.players, player],
  });

  return player;
}

export async function acceptPublicGameplayAgreement({
  clerkUserId,
  dailyGameId,
}: {
  clerkUserId: string;
  dailyGameId: string;
}): Promise<DailyPlayer> {
  const store = await readStore();
  const playerIndex = store.players.findIndex(
    (player) =>
      player.clerkUserId === clerkUserId && player.dailyGameId === dailyGameId,
  );

  if (playerIndex === -1) {
    throw new Error("Player not found.");
  }

  const now = new Date().toISOString();
  const player = {
    ...store.players[playerIndex],
    publicGameplayAgreementAcceptedAt:
      store.players[playerIndex].publicGameplayAgreementAcceptedAt ?? now,
    updatedAt: now,
  };
  const players = [...store.players];
  players[playerIndex] = player;

  await writeStore({ players });

  return player;
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
  const store = await readStore();
  const playerIndex = store.players.findIndex(
    (player) =>
      player.clerkUserId === clerkUserId && player.dailyGameId === dailyGameId,
  );

  if (playerIndex === -1) {
    throw new Error("Player not found.");
  }

  if (!store.players[playerIndex].publicGameplayAgreementAcceptedAt) {
    throw new Error("Public gameplay agreement is required first.");
  }

  if (store.players[playerIndex].openingResponseSubmittedAt) {
    throw new Error("Opening response has already been submitted.");
  }

  const now = new Date().toISOString();
  const player = {
    ...store.players[playerIndex],
    openingResponse,
    openingResponseSubmittedAt: now,
    updatedAt: now,
  };
  const players = [...store.players];
  players[playerIndex] = player;

  await writeStore({ players });

  return player;
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
  const store = await readStore();
  const playerIndex = store.players.findIndex(
    (player) =>
      player.clerkUserId === clerkUserId && player.dailyGameId === dailyGameId,
  );

  if (playerIndex === -1) {
    throw new Error("Player not found.");
  }

  const currentPlayer = store.players[playerIndex];

  if (!currentPlayer.openingResponseSubmittedAt || !currentPlayer.openingResponse) {
    throw new Error("Opening response is required first.");
  }

  if (currentPlayer.firstMoveReveal) {
    return currentPlayer;
  }

  const player = {
    ...currentPlayer,
    firstMoveReveal: reveal,
    updatedAt: reveal.generatedAt,
  };
  const players = [...store.players];
  players[playerIndex] = player;

  await writeStore({ players });

  return player;
}

async function readStore(): Promise<PlayerStoreFile> {
  try {
    const file = await readFile(storePath, "utf8");
    const parsed = JSON.parse(file) as Partial<PlayerStoreFile>;

    return {
      players: Array.isArray(parsed.players) ? parsed.players : [],
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { players: [] };
    }

    throw error;
  }
}

async function writeStore(store: PlayerStoreFile): Promise<void> {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`);
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
