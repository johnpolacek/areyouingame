import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { CharacterInfoUpdate } from "./character-info";
import type { DailyGame } from "./daily-game";
import { createEarlyPostChoiceTurnResponse } from "./early-post-choice-turn-response";
import type {
  ConnectedDeliveryStatus,
  ConnectedOrbStatus,
  ConnectedPackageStatus,
  DailyPlayer,
  FirstConnectedPath,
  FirstConnectedPathStatus,
} from "./player-store";

const DELIVERY_ELIGIBLE_TURN = 2;
const PRE_DELIVERY_REVEAL_TERMS =
  /\b(drone|drones|package|packages|orb|orbs|delivery|delivered|deliveries|box|boxes|parcel|parcels)\b/i;
const DELIVERY_DRONE_TERMS = /\b(drone|drones)\b/i;
const DELIVERY_PACKAGE_TERMS =
  /\b(package|packages|box|boxes|parcel|parcels)\b/i;

export type ConnectedPathTransition = {
  expectedTurnNumber: number;
  status: FirstConnectedPathStatus;
  deliveryStatus: ConnectedDeliveryStatus;
  packageStatus: ConnectedPackageStatus;
  orbStatus: ConnectedOrbStatus;
  transitionKind: "waiting" | "delivered" | "opened" | "unchanged";
};

export type FirstConnectedPathTurnResponse = ConnectedPathTransition & {
  responseText: string;
  sceneTitle: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  characterInfoUpdates?: CharacterInfoUpdate[];
  storylineContextSourceVersion: string;
};

export async function createFirstConnectedPathTurnResponse({
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
}): Promise<FirstConnectedPathTurnResponse> {
  const transition = getNextConnectedPathTransition({
    actionText,
    firstConnectedPath: player.firstConnectedPath,
  });
  const beat = buildConnectedPathPromptBeat(transition, player.firstConnectedPath);
  const generatedResponse = await createEarlyPostChoiceTurnResponse({
    actionText,
    branch: "YES",
    branchInstructions: beat.instructions,
    dailyGame,
    day1GameplayContext,
    defaultActionKind: "connected_path_action",
    player,
    promptExtras: beat.context,
    responseValidation:
      transition.transitionKind === "waiting"
        ? validatePreDeliveryConnectedPathResponse
        : transition.transitionKind === "delivered"
          ? validateDeliveredConnectedPathResponse
        : undefined,
    storylineContext,
    usageOperation: "connected_path_turn",
  });

  return {
    ...transition,
    ...generatedResponse,
  };
}


export function buildConnectedPathPromptBeat(
  transition: ConnectedPathTransition,
  path?: FirstConnectedPath,
) {
  const instructions = [
      "When the player asks about terms, reversibility, control, consequences, or what changed, answer through concrete scene facts, limits, and choices. Do not use recap headings.",
      "Do not strand the player in dead-end phrasing such as 'No terms' or 'No receipt' unless the same response also gives an actionable next step grounded in the current scene.",
      "Do not repeat the previous connected-path scene. The current turn must give the player a sharper fork, new information, or a changed risk even when the visible situation is unchanged.",
      "If the player repeats a prior check, inspection, or public-feed action, treat repetition as caution: preserve continuity, then reveal a different observable detail or a changed public/local reaction.",
  ];
  if (transition.transitionKind === "waiting") {
    return {
      instructions: [...instructions, "Narrate ordinary life after YES. Nothing direct changes; advance social or informational uncertainty using only current visible evidence."],
      context: { currentBeat: "no_direct_visible_change" },
    };
  }
  if (transition.packageStatus === "opened") {
    return {
      instructions: [...instructions, "Describe the opened small package containing a smooth featureless orb with the instruction to place it at the center of the forehead. Keep the experience physical and local."],
      context: { currentBeat: "package_opened" },
    };
  }
  return {
    instructions: [
      ...instructions,
      ...(transition.transitionKind === "delivered"
        ? ["Describe a plausible drone delivering a small, minimal, sleek package to the nearest reachable surface or threshold appropriate to the current scene."]
        : ["The small package is present and sealed. Keep its contents concealed."]),
      "If the package is already available and remains sealed, each response must add a concrete new observable delta tied to the player's action: a marking, weight, sound, temperature, sensor reading, public reaction, nearby person's response, safety constraint, or changed access to the package.",
      "For sealed-package caution, let non-opening actions matter. Photographing, weighing, shielding, moving, labeling, scanning, or asking another person should each produce a distinct clue or constraint while keeping the package closed.",
      "After two sealed-package verification turns, stop rewarding more measurement with more measurement. If the player keeps the package closed, escalate the decision space with an outside interruption, a handling constraint, a social consequence, or a clear preservation/reporting path. It is acceptable to say further measuring adds no new facts.",
      "For livestream or chat actions around the sealed package, make the public reaction messy and useful for later NO/unconnected discovery: viewers ask for proof, warn them not to open it, dare them to open it, compare other YES/package reports, and argue over whether it is fake or dangerous.",
    ],
    context: {
      currentBeat: transition.transitionKind === "delivered" ? "package_arrives" : "sealed_package",
      sealedPackageVerificationCount: countSealedPackageVerificationTurns(path),
    },
  };
}

function validatePreDeliveryConnectedPathResponse({
  responseText,
  playerVisibleFacts,
}: {
  responseText: string;
  playerVisibleFacts: string[];
}): string | null {
  const combinedText = [responseText, ...playerVisibleFacts].join("\n");

  if (!PRE_DELIVERY_REVEAL_TERMS.test(combinedText)) {
    return null;
  }

  return "Use only the current visible beat. Remove unsupported physical outcomes and speculation about future events.";
}

function validateDeliveredConnectedPathResponse({
  responseText,
}: {
  responseText: string;
  playerVisibleFacts: string[];
}): string | null {
  if (
    DELIVERY_DRONE_TERMS.test(responseText) &&
    DELIVERY_PACKAGE_TERMS.test(responseText)
  ) {
    return null;
  }

  return "Delivered connected-path turns must visibly narrate a plausible drone delivering a small package nearby. The player-facing response cannot skip or hide the deterministic delivery transition.";
}

function countSealedPackageVerificationTurns(
  firstConnectedPath?: FirstConnectedPath,
): number {
  return (firstConnectedPath?.turns ?? []).filter(
    (turn) =>
      turn.actionKind.includes("inspect") ||
      turn.actionKind.includes("measure") ||
      turn.actionKind.includes("weigh") ||
      turn.actionKind.includes("verify") ||
      turn.actionKind.includes("photo") ||
      turn.actionKind.includes("document") ||
      turn.actionKind.includes("compare"),
  ).length;
}

export function getNextConnectedPathTransition({
  actionText,
  firstConnectedPath,
}: {
  actionText: string;
  firstConnectedPath?: FirstConnectedPath;
}): ConnectedPathTransition {
  const expectedTurnNumber = (firstConnectedPath?.turnCount ?? 0) + 1;
  const previousDeliveryStatus = firstConnectedPath?.deliveryStatus ?? "pending";
  const previousPackageStatus =
    firstConnectedPath?.packageStatus ?? "not_arrived";
  const previousOrbStatus = firstConnectedPath?.orbStatus ?? "unknown";

  if (previousOrbStatus === "revealed") {
    return {
      expectedTurnNumber,
      status: "orb_revealed",
      deliveryStatus: "delivered",
      packageStatus: "opened",
      orbStatus: "revealed",
      transitionKind: "unchanged",
    };
  }

  if (previousPackageStatus === "available" && wantsToOpenPackage(actionText)) {
    return {
      expectedTurnNumber,
      status: "orb_revealed",
      deliveryStatus: "delivered",
      packageStatus: "opened",
      orbStatus: "revealed",
      transitionKind: "opened",
    };
  }

  if (previousDeliveryStatus === "delivered") {
    return {
      expectedTurnNumber,
      status: "package_available",
      deliveryStatus: "delivered",
      packageStatus: previousPackageStatus,
      orbStatus: previousOrbStatus,
      transitionKind: "unchanged",
    };
  }

  if (
    expectedTurnNumber >= DELIVERY_ELIGIBLE_TURN &&
    !isDeliveryDisruptingAction(actionText)
  ) {
    return {
      expectedTurnNumber,
      status: "package_available",
      deliveryStatus: "delivered",
      packageStatus: "available",
      orbStatus: "unknown",
      transitionKind: "delivered",
    };
  }

  return {
    expectedTurnNumber,
    status: "pre_delivery",
    deliveryStatus: "pending",
    packageStatus: "not_arrived",
    orbStatus: "unknown",
    transitionKind: "waiting",
  };
}

function wantsToOpenPackage(actionText: string): boolean {
  const normalizedAction = actionText.toLowerCase();

  if (
    /\b(?:not|don't|do not|won't|will not|without|before|delay|wait|hold off|leave (?:it|the package|the box) closed|keep (?:it|the package|the box) sealed)\b.{0,80}\b(?:open|opening|unbox|unwrap|unpack|break (?:the )?seal|cut (?:the )?seal|tear)\b/.test(
      normalizedAction,
    ) ||
    /\b(?:open|opening|unbox|unwrap|unpack|break (?:the )?seal|cut (?:the )?seal|tear)\b.{0,80}\b(?:not|don't|do not|won't|will not|without|before|delay|wait|hold off|closed|sealed)\b/.test(
      normalizedAction,
    )
  ) {
    return false;
  }

  if (
    /\b(livestream|live stream|stream|premiere|countdown|likes?|chat|viewers?|picture|photo|photograph|camera|record|film|post|upload)\b/.test(
      normalizedAction,
    )
  ) {
    return false;
  }

  return /\b(open|unbox|unwrap|unpack)\s+(?:it|(?:the\s+)?package|(?:the\s+)?box|(?:the\s+)?parcel)\b|\b(?:break|cut)\s+(?:the\s+)?seal\b|\btear\s+(?:it|(?:the\s+)?package|(?:the\s+)?box|(?:the\s+)?parcel)\s+open\b|\binspect inside\b|\blook inside\b/i.test(
    actionText,
  );
}

function isDeliveryDisruptingAction(actionText: string): boolean {
  return /\b(flee|drive away|leave town|run away|airport|train station|bus station|underground|bunker|basement shelter|hide out|ditch my phone|throw my phone|destroy my phone)\b/i.test(
    actionText,
  );
}
