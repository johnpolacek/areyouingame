import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { DailyGame } from "./daily-game";
import { createPlayerFacingNarrativePrompt } from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type {
  ConnectedDeliveryStatus,
  ConnectedOrbStatus,
  ConnectedPackageStatus,
  DailyPlayer,
  FirstConnectedPath,
  FirstConnectedPathStatus,
} from "./player-store";

const DELIVERY_ELIGIBLE_TURN = 3;

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
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

type GeneratedConnectedPathResponse = {
  responseText?: unknown;
  actionKind?: unknown;
  playerVisibleFacts?: unknown;
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
  const model = getOpenAINarrativeModel();
  const { text } = await generateText({
    model: openai(model),
    system: createPlayerFacingNarrativePrompt([
      "You are resolving an open-world action after the player answered YES.",
      "For the first two connected-path turns after YES, nothing physical happens directly to the player because of the answer.",
      "During those first turns, everyone is reacting to the global takeover of screens, audio, internet services, and phone lines. Speculation is rampant.",
      "People who answered YES are likely in the minority and may wonder whether anything has happened to them or whether they made a mistake.",
      "Only after that first waiting period can drone/package reports become personally relevant to this YES player.",
      "The structured transition supplied in the prompt is canonical. Do not contradict it or invent a different delivery, package, or orb state.",
      "If the transition is waiting, do not deliver the player's package or show the orb. Keep the consequences uncertain and social/informational.",
      "When the player's waiting-period action checks X, Twitter, Bluesky, social feeds, public web, news, or broadcasts, include 1 to 3 short fictional post or broadcast fragments as separate blockquote paragraphs prefixed with >.",
      "Fictional quoted fragments should sound like ordinary people reacting in the moment. Do not include handles, real names, real outlets, or real quotes.",
      "Do not call, scrape, quote, or imply access to real Twitter, X, Bluesky, Facebook, news sites, broadcasts, or external services.",
      "If the transition is delivered, describe a small, minimal, sleek package delivered by a plausible drone to a nearby place. Keep it physical and logistical, not magical.",
      "If the transition is opened, describe the player opening the small sleek package and finding a smooth featureless orb with the instruction to place it at the center of their forehead. Do not simulate full connected cognition yet.",
      "If the player tries something drastic that plausibly prevents delivery, respect the supplied waiting transition and make the delay feel causal.",
      "Respond as a grounded global MUD game master, not as an assistant.",
      "Return valid compact JSON only, with keys responseText, actionKind, and playerVisibleFacts.",
      "responseText should be 2 to 5 short paragraphs of second-person present-tense narration. Blockquote paragraphs count toward this limit.",
      "actionKind should be a short snake_case phrase describing the attempted action in broad terms.",
      "playerVisibleFacts should contain 2 to 5 short durable facts the player learned or established, not literary prose.",
    ]),
    prompt: JSON.stringify(
      {
        player: {
          name: player.name,
          location: player.location,
          occupation: player.occupation,
          openingResponse: player.openingResponse ?? null,
          openingSceneClarification:
            player.openingSceneContext?.answerText ?? null,
        },
        dailyGame: {
          id: dailyGame.id,
          eventStartsAtIso: dailyGame.eventStartsAtIso,
          eventStartsAtLabel: dailyGame.eventStartsAtLabel,
        },
        firstDecision: player.firstDecision,
        firstMoveReveal: player.firstMoveReveal,
        previousConnectedPath: player.firstConnectedPath ?? null,
        actionText,
        transition,
        day1GameplayContext,
      },
      null,
      2,
    ),
  });
  const generated = parseGeneratedResponse(text);

  return {
    ...transition,
    responseText: normalizeResponseText(generated.responseText),
    responseModel: model,
    responseSource: "ai",
    actionKind: normalizeActionKind(generated.actionKind),
    playerVisibleFacts: normalizePlayerVisibleFacts(generated.playerVisibleFacts),
    storylineContextSourceVersion: storylineContext.sourceVersion,
  };
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
  return /\b(open|unbox|unwrap|unpack|cut|tear|inspect inside|look inside)\b/i.test(
    actionText,
  );
}

function isDeliveryDisruptingAction(actionText: string): boolean {
  return /\b(flee|drive away|leave town|run away|airport|train station|bus station|underground|bunker|basement shelter|hide out|ditch my phone|throw my phone|destroy my phone)\b/i.test(
    actionText,
  );
}

function parseGeneratedResponse(text: string): GeneratedConnectedPathResponse {
  try {
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Generated response was not an object.");
    }

    return parsed as GeneratedConnectedPathResponse;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Unable to read generated response: ${error.message}`
        : "Unable to read generated response.",
    );
  }
}

function stripJsonFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeResponseText(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Generated response text is missing.");
  }

  const normalized = value.replace(/\n{3,}/g, "\n\n").trim();

  if (normalized.length < 40) {
    throw new Error("Generated response text is too short.");
  }

  return normalized.slice(0, 1800);
}

function normalizeActionKind(value: unknown): string {
  if (typeof value !== "string") {
    return "connected_path_action";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return normalized || "connected_path_action";
}

function normalizePlayerVisibleFacts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((fact): fact is string => typeof fact === "string")
    .map((fact) => fact.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((fact) => fact.slice(0, 220));
}
