import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { DailyPlayer, YesNoChoice } from "./player-store";

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

export type PublicLivePlayerSummary = {
  id: string;
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

export type PublicLivePlayer = Omit<DailyPlayer, "clerkUserId">;

const getPublicLiveGameSummariesRef = makeFunctionReference<
  "query",
  {
    limit?: number;
  },
  PublicLiveGameSummary[]
>("playerStore:getPublicLiveGameSummaries");

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
