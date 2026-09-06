import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { CharacterInfoUpdate } from "./character-info";
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
  characterInfoUpdates?: CharacterInfoUpdate[];
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
    (player.firstConnectedPath?.orbDecisionTurns?.at(-1)?.turnNumber ?? 0) + 1;
  const generatedResponse = await createEarlyPostChoiceTurnResponse({
    actionText,
    branch: "YES",
    branchInstructions: [
      "The player has already opened the small sleek package and revealed a smooth featureless orb with the instruction to place it at the center of their forehead.",
      "The structured orb lifecycle supplied in the prompt is canonical. Do not contradict it or choose a different outcome.",
      "There is no separate decision_deferred state. Non-final actions keep the lifecycle orb_delivered.",
      "If orbLifecycle is orb_delivered, the orb remains physically available. Let the player inspect, stall, stream, ask chat, hide it temporarily, or continue interacting without forcing acceptance or loss.",
      "If orbLifecycle is orb_accepted, narrate a monumental first-contact threshold after the player places the orb at the center of their forehead. This should feel amazing, historic, and world-altering, as if a human mind has touched an intelligence and network far larger than civilization.",
      "For orb_accepted, make the scale arrive through immediate perception: the room remains present, but the player senses an immense structured presence, distant human nodes coming online, global signal patterns, and the ASI's attention turning toward them. The moment should inspire awe, fear, wonder, and the feeling that ordinary history has ended.",
      "For orb_accepted, include a concise first ASI contact signal or phrase only if it feels earned. It should be gentle and precise, not chatty. Do not dump exposition, grant powers, read private minds, or resolve the full connected interface yet; the next action is where the player can ask, set boundaries, reach toward nodes, or request capabilities.",
      "If orbLifecycle is orb_lost, the orb becomes unavailable because the player destroyed it, gave it away, threw it away, fled from it, or otherwise rejected/lost access to it. The player is NO-equivalent and unconnected for current gameplay, while preserving that they originally answered YES.",
      "For livestream or chat actions around the revealed orb, include short fictional blockquote reactions when useful: viewers ask for proof, warn them away, dare them, compare other YES/orb reports, and argue over whether the instruction is a trap.",
      "Keep the orb minimal and physical before acceptance: smooth, featureless, and strange because of its restraint. On acceptance, the event may become vast and uncanny, but avoid lasers, glowing runes, status chips, superhero transformation, or generic magical effects.",
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
  const committedActions = getCommittedOrbActions(actionText);

  if (committedActions.some(isOrbLostAction)) {
    return "orb_lost";
  }

  if (committedActions.some(isOrbAcceptedAction)) {
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

// Final lifecycle transitions require a direct player action. Treat unsupported or
// ambiguous language as non-final so a mention cannot consume the player's orb.
function getCommittedOrbActions(actionText: string): string[] {
  return normalizeActionText(actionText)
    .split(/(?<=[.!?;])\s+/)
    .filter((sentence) => {
      // These can scope over multiple clauses, including an action at the start
      // ("put it on my forehead if it is safe"). Keep the whole sentence pending.
      return (
        !/[?"“”]/.test(sentence) &&
        !/\b(?:not|never|no|cannot|can't|won't|don't|doesn't|didn't|wouldn't|shouldn't|couldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|if|unless|until|before|after|would|could|should|might|may|maybe|perhaps|hypothetically|suppose|assuming|whether|instead)\b/.test(sentence)
      );
    })
    .map((sentence) =>
      sentence
        .replace(/^i(?: will|'ll)?\s+/, "")
        .replace(/^(?:now|finally)\s+/, ""),
    );
}

function isOrbAcceptedAction(normalized: string): boolean {
  return (
    /^(?:put|place|press|set|hold|touch|stick|attach|apply)\s+(?:the\s+)?(?:orb|it)\s+(?:on|to|against|at)\s+(?:the\s+)?(?:center\s+of\s+)?(?:my\s+|the\s+)?forehead\b/.test(
      normalized,
    ) ||
    /^(?:put|place|press|set|hold|touch|stick|attach|apply)\s+(?:the\s+)?(?:orb|it)\s+(?:at|on|to|against)\s+(?:the\s+)?center\s+of\s+(?:my\s+|the\s+)?forehead\b/.test(
      normalized,
    ) ||
    /^(?:do|follow)\s+(?:what\s+)?(?:it|the note|the instruction|the instructions|the card|the message)\s+(?:says|said|tells me|told me|instructs)\b/.test(
      normalized,
    ) ||
    /^i\s+(?:do|follow)\s+(?:what\s+)?(?:it|the note|the instruction|the instructions|the card|the message)\s+(?:says|said|tells me|told me|instructs)\b/.test(
      normalized,
    )
  );
}

function isOrbLostAction(normalized: string): boolean {
  return (
    /^(?:destroy|smash|break|crush|shatter|burn|melt|hammer|stomp|shoot)\s+(?:the\s+)?(?:orb|it)\b/.test(
      normalized,
    ) ||
    /^(?:throw|toss|pitch|chuck)\s+(?:the\s+)?(?:orb|it)\s+(?:away|out|into|in)\b/.test(
      normalized,
    ) ||
    /^(?:trash|discard|dump|flush|bury)\s+(?:the\s+)?(?:orb|it)\b/.test(
      normalized,
    ) ||
    /^(?:give|hand|pass|mail|ship)\s+(?:the\s+)?(?:orb|it)\s+(?:to|over to|away to)\b/.test(
      normalized,
    ) ||
    /^(?:run away|flee|drive away|leave town|abandon|leave behind|escape)\b.*\b(?:orb|it)\b/.test(
      normalized,
    ) ||
    /^(?:get rid of|want nothing to do with)\s+(?:the\s+)?(?:orb|it)\b/.test(
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
