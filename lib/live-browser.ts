import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { CharacterInfo } from "./character-info";
import type { PlayerDraftInput, YesNoChoice } from "./player-store";

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
};

export type PublicLivePlayer = PlayerDraftInput & {
  id: string;
  publicId: string;
  dailyGameId: string;
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
