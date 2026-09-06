import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { CharacterImage } from "./character-image";
import type { PublicCharacterImage } from "./public-live-transcript";
import type { CharacterInfo } from "./character-info";
import type {
  PlayerDraftInput,
  PlayerTurnImage,
  YesNoChoice,
} from "./player-store";

export type PublicLiveGameSummary = {
  dailyGameId: string;
  eventStartsAtIso: string;
  eventStartsAtLabel: string;
  playerCount: number;
  activityCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicActivityEvent = {
  id: string;
  dailyGameId: string;
  playerId?: string;
  createdAt: string;
  character: {
    name: string;
    age: string;
    location: string;
    occupation: string;
    bio: string;
  };
  eventKind:
    | "opening_response_submitted"
    | "opening_context_answered"
    | "first_reveal_presented"
    | "first_choice_submitted"
    | "first_reveal_text_response_submitted"
    | "post_choice_turn_resolved"
    | "connected_path_turn_resolved"
    | "package_received"
    | "orb_revealed"
    | "orb_action_resolved"
    | "orb_accepted"
    | "orb_lost"
    | "connected_asi_interaction_resolved";
  gameText?: string;
  playerInput?: string;
  choice?: YesNoChoice;
  narratorResponse?: string;
  sceneTitle?: string;
  playtest?: {
    synthetic: true;
    build?: string;
    persona?: string;
    scenario?: string;
    run?: string;
  };
};

export type PublicLivePlayerSummary = {
  id: string;
  publicId: string;
  dailyGameId: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  characterImage?: PublicCharacterImage;
  choice?: YesNoChoice;
  turnCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicLiveTranscriptEntry = {
  id: string;
  at: string;
  label: string;
  title: string;
  playerText?: string;
  gameText?: string;
  narratorText?: string;
  turnImage?: PlayerTurnImage;
};

export type PublicLivePlayer = PlayerDraftInput & {
  id: string;
  publicId: string;
  dailyGameId: string;
  characterImage?: PublicCharacterImage;
  characterInfo?: CharacterInfo;
  choice?: YesNoChoice;
  transcript: PublicLiveTranscriptEntry[];
  turnCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

const getPublicLiveGameSummariesRef = makeFunctionReference<
  "query",
  {
    limit?: number;
  },
  PublicLiveGameSummary[]
>("playerStore:getPublicLiveGameSummaries");

const getPublicActivityEventsRef = makeFunctionReference<
  "query",
  {
    dailyGameId?: string;
    limit?: number;
  },
  PublicActivityEvent[]
>("playerStore:getPublicActivityEvents");

const getPublicLivePlayersForGameRef = makeFunctionReference<
  "query",
  {
    dailyGameId: string;
  },
  PublicLivePlayerSummary[]
>("playerStore:getPublicLivePlayersForGame");

const getPublicLivePlayerRef = makeFunctionReference<
  "query",
  {
    dailyGameId: string;
    playerId: string;
  },
  PublicLivePlayer | null
>("playerStore:getPublicLivePlayer");

const getPublicPlayerTurnImageRef = makeFunctionReference<
  "query",
  {
    sourceTurnId: string;
    backendSecret: string;
    clerkUserId?: string;
  },
  PlayerTurnImage | null
>("playerStore:getPublicPlayerTurnImage");

export async function getPublicLiveGameSummaries({
  limit,
}: {
  limit?: number;
} = {}): Promise<PublicLiveGameSummary[]> {
  return await fetchQuery(getPublicLiveGameSummariesRef, {
    ...(limit ? { limit } : {}),
  });
}

export async function getPublicActivityEvents({
  dailyGameId,
  limit,
}: {
  dailyGameId?: string;
  limit?: number;
} = {}): Promise<PublicActivityEvent[]> {
  return await fetchQuery(getPublicActivityEventsRef, {
    ...(dailyGameId ? { dailyGameId } : {}),
    ...(limit ? { limit } : {}),
  });
}

export async function getPublicLivePlayersForGame(
  dailyGameId: string,
): Promise<PublicLivePlayerSummary[]> {
  return await fetchQuery(getPublicLivePlayersForGameRef, { dailyGameId });
}

export async function getPublicLivePlayer({
  dailyGameId,
  playerId,
}: {
  dailyGameId: string;
  playerId: string;
}): Promise<PublicLivePlayer | null> {
  return await fetchQuery(getPublicLivePlayerRef, { dailyGameId, playerId });
}

export async function getPublicPlayerTurnImage(
  sourceTurnId: string,
  clerkUserId?: string,
): Promise<PlayerTurnImage | null> {
  return await fetchQuery(getPublicPlayerTurnImageRef, {
    sourceTurnId,
    backendSecret: getBackendSecret(),
    ...(clerkUserId ? { clerkUserId } : {}),
  });
}

const getPublicCharacterImageStorageRef = makeFunctionReference<
  "query",
  { publicId: string; backendSecret: string },
  CharacterImage | null
>("playerStore:getPublicCharacterImageStorage");

export async function getPublicCharacterImageStorage(publicId: string) {
  return await fetchQuery(getPublicCharacterImageStorageRef, {
    publicId,
    backendSecret: getBackendSecret(),
  });
}

function getBackendSecret(): string {
  const secret = process.env.AREYOUIN_BACKEND_SECRET;
  if (!secret) throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  return secret;
}
