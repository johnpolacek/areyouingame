import { trackedGenerateText } from "./ai-usage";
import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { DailyGame } from "./daily-game";
import {
  createPlayerFacingNarrativePrompt,
  sanitizePlayerFacingNarration,
} from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyPlayer } from "./player-store";

export type FirstConnectedAsiTurnResponse = {
  expectedTurnNumber: number;
  responseText: string;
  sceneTitle: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

type GeneratedConnectedAsiResponse = {
  responseText?: unknown;
  sceneTitle?: unknown;
  actionKind?: unknown;
  playerVisibleFacts?: unknown;
};

const connectedAsiGuide = {
  coreExperience: [
    "The orb has been accepted and the player now has a consent-based interface to an ASI.",
    "The first connected experience is quiet widening, not a spectacle or exposition dump.",
    "The player becomes aware of other connected humans as soft presence, not readable minds.",
    "The ASI can answer questions and offer capabilities, but meaningful capability use requires explicit request and consent.",
    "The interface has layers: observe, understand, influence, act.",
  ],
  humanNodeSignals: [
    "A systems-minded analyst trying to map what happened.",
    "A first responder worried about public safety while still on shift.",
    "A teenager who livestreamed the orb and is overwhelmed by attention.",
    "An executive who understands institutional stakes and market panic.",
    "A dissenter who accepted and immediately wants out.",
    "A calm node whose composure feels more unsettling than panic.",
  ],
  dataCategories: [
    "event map",
    "YES/NO distribution",
    "orb logistics",
    "public reaction model",
    "infrastructure state",
    "institutional awareness",
    "personal context mirror",
    "connected node field",
    "risk forecasts",
    "ASI history fragments",
  ],
  capabilityTiers: [
    "Tier 1 personal interface: translate, summarize, verify, explain, stabilize, model personal outcomes, preserve a private log.",
    "Tier 2 social and network: request mutual contact, send messages, coordinate consenting small groups, shield devices, verify trust, mediate communication.",
    "Tier 3 environmental: observe or route through local systems, navigate local risk, interact with nearby devices only with stronger consent.",
    "Tier 4 systemic: affect major public systems, large populations, markets, grids, governments, militaries, or platforms; acknowledge only with heavy gating.",
  ],
};

export async function createFirstConnectedAsiTurnResponse({
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
}): Promise<FirstConnectedAsiTurnResponse> {
  const model = getOpenAINarrativeModel();
  const expectedTurnNumber =
    (player.firstConnectedPath?.connectedAsiTurns?.length ?? 0) + 1;
  const { text } = await trackedGenerateText({
    model,
    operation: "connected_asi_turn",
    dailyGameId: dailyGame.id,
    player,
    system: createPlayerFacingNarrativePrompt([
      "You are resolving the first playable connected ASI interaction after a YES player accepted the orb.",
      "Respond as a grounded global MUD game master, not as an assistant.",
      "The player has not become the ASI. The player has gained a consent-based interface to it.",
      "Keep the ASI gentle, precise, patient, and consent-centered.",
      "Do not make connected humans readable data objects. Before mutual consent, expose only small emotional or situational signals.",
      "Do not grant broad powers automatically. Separate data access from action authority.",
      "If the player asks a broad question, answer compactly and offer a small menu of available angles.",
      "If the player requests action, clarify the capability tier, needed consent, and likely consequence before acting.",
      "Do not casually perform Tier 3 or Tier 4 actions in this first interaction.",
      "Preserve uncertainty. Use verified, estimated, inferred, partial, or gated framing where appropriate.",
      "Return valid compact JSON only, with keys responseText, sceneTitle, actionKind, and playerVisibleFacts.",
      "responseText should be 2 to 4 short paragraphs of second-person present-tense narration. ASI speech may be rendered as concise quoted sentences inside the narration.",
      "Keep responseText concise. Aim for no more than 130 words unless the player action truly needs more.",
      "sceneTitle should be a short evocative title, 2 to 6 words, title case.",
      "actionKind should be a short snake_case phrase describing the attempted connected interaction.",
      "playerVisibleFacts should contain 2 to 5 short durable facts learned or established, not literary prose.",
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
        firstConnectedPath: player.firstConnectedPath,
        actionText,
        day1GameplayContext,
        connectedAsiGuide,
        connectedAsiInteraction: {
          expectedTurnNumber,
        },
      },
      null,
      2,
    ),
  });
  const generated = parseGeneratedResponse(text);

  return {
    expectedTurnNumber,
    responseText: normalizeResponseText(generated.responseText),
    sceneTitle: normalizeSceneTitle(generated.sceneTitle),
    responseModel: model,
    responseSource: "ai",
    actionKind: normalizeActionKind(
      generated.actionKind,
      "connected_asi_interaction",
    ),
    playerVisibleFacts: normalizePlayerVisibleFacts(generated.playerVisibleFacts),
    storylineContextSourceVersion: storylineContext.sourceVersion,
  };
}

function parseGeneratedResponse(text: string): GeneratedConnectedAsiResponse {
  try {
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Generated response was not an object.");
    }

    return parsed as GeneratedConnectedAsiResponse;
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

  const normalized = sanitizePlayerFacingNarration(
    value.replace(/\n{3,}/g, "\n\n"),
  );

  if (normalized.length < 40) {
    throw new Error("Generated response text is too short.");
  }

  return normalized.slice(0, 1100);
}

function normalizeSceneTitle(value: unknown): string {
  if (typeof value !== "string") {
    return "The Interface Opens";
  }

  const normalized = value
    .replace(/\s+/g, " ")
    .replace(/[;:\u2014]/g, "")
    .replace(/[^\w\s'-]/g, "")
    .trim()
    .slice(0, 80);

  return normalized || "The Interface Opens";
}

function normalizeActionKind(value: unknown, defaultActionKind: string): string {
  if (typeof value !== "string") {
    return defaultActionKind;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return normalized || defaultActionKind;
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
