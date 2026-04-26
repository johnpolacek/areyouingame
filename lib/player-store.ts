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
  createdAt: string;
  updatedAt: string;
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
