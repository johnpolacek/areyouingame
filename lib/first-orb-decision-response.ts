import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { DailyGame } from "./daily-game";
import { createEarlyPostChoiceTurnResponse } from "./early-post-choice-turn-response";
import type {
  ConnectedOrbLifecycle,
  DailyPlayer,
  FirstConnectedPath,
} from "./player-store";

export type FirstOrbDecisionTurnResponse = {
  expectedTurnNumber: number;
  orbLifecycle: ConnectedOrbLifecycle;
  responseText: string;
  sceneTitle: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

export async function createFirstOrbDecisionTurnResponse({
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
}): Promise<FirstOrbDecisionTurnResponse> {
  const orbLifecycle = classifyOrbDecisionAction(actionText);
  const expectedTurnNumber =
    (player.firstConnectedPath?.orbDecisionTurns?.length ?? 0) + 1;
  const generatedResponse = await createEarlyPostChoiceTurnResponse({
    actionText,
    branch: "YES",
    branchInstructions: [
      "The player has already opened the small sleek package and revealed a smooth featureless orb with the instruction to place it at the center of their forehead.",
      "The structured orb lifecycle supplied in the prompt is canonical. Do not contradict it or choose a different outcome.",
      "There is no separate decision_deferred state. Non-final actions keep the lifecycle orb_delivered.",
      "If orbLifecycle is orb_delivered, the orb remains physically available. Let the player inspect, stall, stream, ask chat, hide it temporarily, or continue interacting without forcing acceptance or loss.",
      "If orbLifecycle is orb_accepted, narrate only the first connected threshold beat after the player places the orb at the center of their forehead. Do not implement full connected cognition, telepathy, powers, exposition downloads, or long-term transformation yet.",
      "If orbLifecycle is orb_lost, the orb becomes unavailable because the player destroyed it, gave it away, threw it away, fled from it, or otherwise rejected/lost access to it. The player is NO-equivalent and unconnected for current gameplay, while preserving that they originally answered YES.",
      "For livestream or chat actions around the revealed orb, include short fictional blockquote reactions when useful: viewers ask for proof, warn them away, dare them, compare other YES/orb reports, and argue over whether the instruction is a trap.",
      "Keep the orb minimal and physical: smooth, featureless, and strange because of its restraint. Do not add lights, voices, markings, status chips, or active behavior unless the lifecycle is accepted and then only at the threshold beat.",
    ],
    dailyGame,
    day1GameplayContext,
    defaultActionKind:
      orbLifecycle === "orb_accepted"
        ? "orb_acceptance"
        : orbLifecycle === "orb_lost"
          ? "orb_rejection"
          : "orb_decision_action",
    player,
    promptExtras: {
      previousConnectedPath: player.firstConnectedPath ?? null,
      orbDecision: {
        expectedTurnNumber,
        orbLifecycle,
      },
    },
    storylineContext,
    usageOperation: "orb_decision_turn",
  });

  return {
    expectedTurnNumber,
    orbLifecycle,
    ...generatedResponse,
  };
}

export function classifyOrbDecisionAction(
  actionText: string,
): ConnectedOrbLifecycle {
  const normalized = normalizeActionText(actionText);

  if (isOrbLostAction(normalized)) {
    return "orb_lost";
  }

  if (isOrbAcceptedAction(normalized)) {
    return "orb_accepted";
  }

  return "orb_delivered";
}

export function getCurrentOrbLifecycle(
  firstConnectedPath?: FirstConnectedPath,
): ConnectedOrbLifecycle | undefined {
  if (!firstConnectedPath) {
    return undefined;
  }

  if (firstConnectedPath.orbLifecycle) {
    return firstConnectedPath.orbLifecycle;
  }

  if (
    firstConnectedPath.packageStatus === "opened" &&
    firstConnectedPath.orbStatus === "revealed"
  ) {
    return "orb_delivered";
  }

  return undefined;
}

function isOrbAcceptedAction(normalized: string): boolean {
  return (
    /\b(?:put|place|press|set|hold|touch|stick|attach|apply)\s+(?:the\s+)?(?:orb|it)\s+(?:on|to|against|at)\s+(?:the\s+)?(?:center\s+of\s+)?(?:my\s+|the\s+)?forehead\b/.test(
      normalized,
    ) ||
    /\b(?:put|place|press|set|hold|touch|stick|attach|apply)\s+(?:the\s+)?(?:orb|it)\s+(?:at|on|to|against)\s+(?:the\s+)?center\s+of\s+(?:my\s+|the\s+)?forehead\b/.test(
      normalized,
    ) ||
    /\b(?:do|follow)\s+(?:what\s+)?(?:it|the note|the instruction|the instructions|the card|the message)\s+(?:says|said|tells me|told me|instructs)\b/.test(
      normalized,
    ) ||
    /\bi\s+(?:do|follow)\s+(?:what\s+)?(?:it|the note|the instruction|the instructions|the card|the message)\s+(?:says|said|tells me|told me|instructs)\b/.test(
      normalized,
    )
  );
}

function isOrbLostAction(normalized: string): boolean {
  return (
    /\b(?:destroy|smash|break|crush|shatter|burn|melt|hammer|stomp|shoot)\s+(?:the\s+)?(?:orb|it)\b/.test(
      normalized,
    ) ||
    /\b(?:throw|toss|pitch|chuck)\s+(?:the\s+)?(?:orb|it)\s+(?:away|out|into|in)\b/.test(
      normalized,
    ) ||
    /\b(?:trash|discard|dump|flush|bury)\s+(?:the\s+)?(?:orb|it)\b/.test(
      normalized,
    ) ||
    /\b(?:give|hand|pass|mail|ship)\s+(?:the\s+)?(?:orb|it)\s+(?:to|over to|away to)\b/.test(
      normalized,
    ) ||
    /\b(?:run away|flee|drive away|leave town|abandon|leave behind|escape)\b.*\b(?:orb|it)\b/.test(
      normalized,
    ) ||
    /\b(?:get rid of|want nothing to do with)\s+(?:the\s+)?(?:orb|it)\b/.test(
      normalized,
    )
  );
}

function normalizeActionText(actionText: string): string {
  return actionText
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
