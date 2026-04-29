import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { DailyGame } from "./daily-game";
import { createEarlyPostChoiceTurnResponse } from "./early-post-choice-turn-response";
import type { DailyPlayer } from "./player-store";

export type FirstPostChoiceActionResponse = {
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

export async function createFirstNoPostChoiceActionResponse({
  actionText,
  dailyGame,
  day1GameplayContext,
  storylineContext,
  player,
}: {
  actionText: string;
  dailyGame: DailyGame;
  day1GameplayContext: Day1GameplayContextPayload;
  storylineContext: Day1StorylineContext;
  player: DailyPlayer;
}): Promise<FirstPostChoiceActionResponse> {
  return await createEarlyPostChoiceTurnResponse({
    actionText,
    branch: "NO",
    branchInstructions: [
      "The player remains unconnected. Nothing supernatural or physical happens to them immediately because of the NO.",
      "Do not claim drone/package/orb reports are personally verified by the player unless the provided context supports it.",
    ],
    dailyGame,
    day1GameplayContext,
    defaultActionKind: "open_world_action",
    player,
    storylineContext,
  });
}
