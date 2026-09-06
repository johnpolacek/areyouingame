import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { CharacterInfoUpdate } from "./character-info";
import type { DailyGame } from "./daily-game";
import { createEarlyPostChoiceTurnResponse } from "./early-post-choice-turn-response";
import type { DailyPlayer } from "./player-store";

export type FirstPostChoiceActionResponse = {
  responseText: string;
  sceneTitle: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  characterInfoUpdates?: CharacterInfoUpdate[];
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
      "Treat the NO path as an active investigation branch, not an ending.",
      "Each response should give the player at least one concrete new thing they can do next: compare public reports, contact a specific person, inspect a device, leave the room, wait, document evidence, or protect someone nearby.",
      "If the player repeats a verification action from a prior NO-path turn, do not repeat the same scene. Acknowledge the repeat behavior briefly, then advance with a new source, contradiction, reply, timestamp, device clue, or local consequence.",
      "End each NO-path response with 2 to 4 concrete next forks that preserve the player's refusal instead of implying they must answer YES.",
      "If the player asks what NO means, state the player-visible truth plainly: their NO is recorded, they have no visible physical change, and source, permanence, reversibility, and consequences remain unknown in-world.",
      "Let cautious verification produce progress. Do not just restate confusion; add a specific clue, contradiction, reply, or environmental consequence that follows from the action.",
    ],
    dailyGame,
    day1GameplayContext,
    defaultActionKind: "open_world_action",
    player,
    promptExtras: {
      noPathInvestigation: {
        priorTurns: player.firstPostChoiceTurns ?? [],
        suggestedNextActions: [
          "check public incident reports",
          "text or call a trusted contact",
          "inspect device permissions and network state",
          "document screenshots and timestamps",
          "wait and observe the local scene",
        ],
      },
    },
    storylineContext,
    usageOperation: "post_choice_turn",
  });
}
