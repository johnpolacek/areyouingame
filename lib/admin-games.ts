import { fetchMutation } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import {
  getPublicLiveGameSummaries,
  type PublicLiveGameSummary,
} from "./live-browser";

export type DeleteDailyGameResult = {
  deletedGames: number;
  deletedPlayers: number;
  deletedGameplayEvents: number;
  deletedPublicActivityEvents: number;
  deletedAiUsageEvents: number;
  deletedPlayerTurnImages: number;
  deletedStorylineContexts: number;
  deletedArtifactObjects: number;
};

const deleteDailyGameForAdminRef = makeFunctionReference<
  "mutation",
  {
    backendSecret: string;
    dailyGameId: string;
  },
  DeleteDailyGameResult
>("playerStore:deleteDailyGameForAdmin");

const deleteAllDailyGamesForAdminRef = makeFunctionReference<
  "mutation",
  {
    backendSecret: string;
  },
  DeleteDailyGameResult
>("playerStore:deleteAllDailyGamesForAdmin");

export async function getAdminGameSummaries({
  limit,
}: {
  limit?: number;
} = {}): Promise<PublicLiveGameSummary[]> {
  return await getPublicLiveGameSummaries({ limit });
}

export async function deleteDailyGameForAdmin(
  dailyGameId: string,
): Promise<DeleteDailyGameResult> {
  return await fetchMutation(deleteDailyGameForAdminRef, {
    backendSecret: getBackendSecret(),
    dailyGameId,
  });
}

export async function deleteAllDailyGamesForAdmin(): Promise<DeleteDailyGameResult> {
  return await fetchMutation(deleteAllDailyGamesForAdminRef, {
    backendSecret: getBackendSecret(),
  });
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}
