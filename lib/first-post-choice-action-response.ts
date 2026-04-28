import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import { createPlayerFacingNarrativePrompt } from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyGame } from "./daily-game";
import type { DailyPlayer } from "./player-store";

export type FirstPostChoiceActionResponse = {
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

type GeneratedPostChoiceResponse = {
  responseText?: unknown;
  actionKind?: unknown;
  playerVisibleFacts?: unknown;
};

const day1MediaContext = {
  xFeed: [
    "People are posting screenshots of the same invitation across phones, laptops, televisions, cars, watches, and workplace displays.",
    "Some posts treat the prompt like a coordinated hack; others frame it as a religious event, marketing stunt, government warning, or AI emergence.",
    "Early claims about pressing YES and seeing drones are mixed with jokes, obvious fakes, and frightened secondhand reports.",
    "The strongest pattern is not certainty. It is scale: strangers in unrelated places are describing the same words within minutes of each other.",
  ],
  bskyFeed: [
    "Technical accounts are comparing screenshots, timestamps, device types, and language variants.",
    "Some users are trying to keep threads calm by separating confirmed sightings from speculation.",
    "A few credible posters say ordinary app controls are not explaining the prompt, but no one has a complete theory.",
    "The feed reads like a rapidly assembled incident room with jokes, fear, and amateur forensics crowded together.",
  ],
  newsFeed: [
    "Live news pages are using cautious language: anomaly, incident, possible compromise, unfolding disruption.",
    "Editors are collecting reports from transportation systems, schools, hospitals, homes, and offices without yet claiming a cause.",
    "Cybersecurity experts are quoted saying the scale appears beyond ordinary malware, while officials urge people not to press anything.",
    "Headlines keep updating faster than the articles can explain what changed.",
  ],
  facebookFeed: [
    "Family posts ask whether anyone else saw the message and whether children or older relatives pressed anything.",
    "Local community groups are filling with screenshots, warnings, jokes, prayers, and requests for practical advice.",
    "People are tagging neighbors, coworkers, and relatives, trying to establish whether this is local or everywhere.",
    "The tone is personal and uneven: panic in one comment, denial in the next, someone asking if the power company knows.",
  ],
  newsBroadcast: [
    "Anchors are careful not to repeat the invitation as instruction, but the words are visible in blurred screenshots behind them.",
    "Official statements lag behind public reports and advise people to avoid interacting with unexplained prompts.",
    "Guests disagree on whether this is a cyberattack, mass hoax, platform compromise, or something unprecedented.",
    "The broadcast cadence keeps slipping from routine breaking news into visible uncertainty.",
  ],
  genericPublicWeb: [
    "Search results and public pages are filling with duplicate questions faster than authoritative answers can form.",
    "Forums, news sites, local pages, and platform posts all point back to the same phrase appearing on connected devices.",
    "The earliest useful signal is convergence: many unrelated people are describing the same event from different contexts.",
    "No source available to the player can yet prove what the message is or who sent it.",
  ],
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
  const model = getOpenAINarrativeModel();
  const { text } = await generateText({
    model: openai(model),
    system: createPlayerFacingNarrativePrompt([
      "You are resolving the first open-world action after the player answered NO.",
      "The player remains unconnected. Nothing supernatural or physical happens to them immediately because of the NO.",
      "The ordinary world resumes, but public information is starting to show that the event is larger than one person.",
      "Respond as a grounded global MUD game master, not as an assistant.",
      "Interpret the player's attempted action generously and adjudicate what they can plausibly perceive or learn.",
      "Use the supplied media context only when it matches the player's action. If it does not match, answer the action directly from player and world context.",
      "When media context is relevant, use it as source material. Do not dump it verbatim.",
      "Do not call, scrape, quote, or imply access to real Twitter, X, Bluesky, Facebook, news sites, broadcasts, or external services.",
      "Do not introduce deleted, disappearing, or vanishing posts unless future canonical state explicitly establishes that behavior.",
      "Do not claim drone/package/orb reports are personally verified by the player unless the provided context supports it.",
      "Return valid compact JSON only, with keys responseText, actionKind, and playerVisibleFacts.",
      "responseText should be 2 to 4 short paragraphs of second-person present-tense narration.",
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
        actionText,
        day1GameplayContext,
        day1MediaContext,
      },
      null,
      2,
    ),
  });
  const generated = parseGeneratedResponse(text);

  return {
    responseText: normalizeResponseText(generated.responseText),
    responseModel: model,
    responseSource: "ai",
    actionKind: normalizeActionKind(generated.actionKind),
    playerVisibleFacts: normalizePlayerVisibleFacts(generated.playerVisibleFacts),
    storylineContextSourceVersion: storylineContext.sourceVersion,
  };
}

function parseGeneratedResponse(text: string): GeneratedPostChoiceResponse {
  try {
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Generated response was not an object.");
    }

    return parsed as GeneratedPostChoiceResponse;
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
    return "open_world_action";
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  return normalized || "open_world_action";
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
