import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { CharacterImage } from "./character-image";

export type PublicActivityEventKind =
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

export type PublicCharacterSnapshot = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  characterImage?: CharacterImage;
};

export type PublicActivityPlaytestMetadata = {
  synthetic: true;
  build?: string;
  persona?: string;
  scenario?: string;
  run?: string;
};

export type PublicActivityEvent = {
  id: string;
  dailyGameId: string;
  createdAt: string;
  character: PublicCharacterSnapshot;
  eventKind: PublicActivityEventKind;
  gameText?: string;
  playerInput?: string;
  choice?: "YES" | "NO";
  narratorResponse?: string;
  sceneTitle?: string;
  playtest?: PublicActivityPlaytestMetadata;
};

const getPublicActivityEventsRef = makeFunctionReference<
  "query",
  {
    dailyGameId?: string;
    limit?: number;
  },
  PublicActivityEvent[]
>("playerStore:getPublicActivityEvents");

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
