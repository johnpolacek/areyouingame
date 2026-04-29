import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
  Day1GameplayContextPayload,
  Day1StorylineContext,
} from "./day-1-storyline-context";
import type { DailyGame } from "./daily-game";
import { createPlayerFacingNarrativePrompt } from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyPlayer } from "./player-store";

export type EarlyPostChoiceBranch = "YES" | "NO";

export type EarlyPostChoiceTurnResponse = {
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
};

type GeneratedEarlyTurnResponse = {
  responseText?: unknown;
  actionKind?: unknown;
  playerVisibleFacts?: unknown;
};

const day1MediaContext = {
  xFeed: [
    "At first there may be little or nothing useful. It can take a minute or two for people to recover, screenshot, type, and post.",
    "The earliest posts should feel isolated: one confused screenshot, one joke, one person asking if anyone else saw it.",
    "After those first scattered posts, the volume accelerates quickly into a firehose.",
    "People are posting screenshots of the same invitation across phones, laptops, televisions, cars, watches, and workplace displays.",
    "Some posts treat the prompt like a coordinated hack; others frame it as a religious event, marketing stunt, government warning, or AI emergence.",
    "Early claims about pressing YES and seeing drones are mixed with jokes, obvious fakes, and frightened secondhand reports.",
    "The strongest pattern is not certainty. It is scale: strangers in unrelated places are describing the same words within minutes of each other.",
  ],
  bskyFeed: [
    "At first there may be little or nothing useful. It can take a minute or two for people to recover, screenshot, type, and post.",
    "The earliest posts should feel isolated and technical before the feed turns into a fast-moving incident room.",
    "Technical accounts are comparing screenshots, timestamps, device types, and language variants.",
    "Some users are trying to keep threads calm by separating confirmed sightings from speculation.",
    "A few credible posters say ordinary app controls are not explaining the prompt, but no one has a complete theory.",
    "The feed reads like a rapidly assembled incident room with jokes, fear, and amateur forensics crowded together.",
  ],
  newsFeed: [
    "At first there may be little or nothing useful. Newsrooms need a minute or two to confirm that reports are not isolated.",
    "The first updates should feel cautious and sparse before live pages begin changing rapidly.",
    "Live news pages are using cautious language: anomaly, incident, possible compromise, unfolding disruption.",
    "Editors are collecting reports from transportation systems, schools, hospitals, homes, and offices without yet claiming a cause.",
    "Cybersecurity experts are quoted saying the scale appears beyond ordinary malware, while officials urge people not to press anything.",
    "Headlines keep updating faster than the articles can explain what changed.",
  ],
  facebookFeed: [
    "At first there may be little or nothing useful. It takes a minute or two for relatives, neighbors, and local groups to start asking around.",
    "The first posts should feel personal and scattered before community groups begin filling quickly.",
    "Family posts ask whether anyone else saw the message and whether children or older relatives pressed anything.",
    "Local community groups are filling with screenshots, warnings, jokes, prayers, and requests for practical advice.",
    "People are tagging neighbors, coworkers, and relatives, trying to establish whether this is local or everywhere.",
    "The tone is personal and uneven: panic in one comment, denial in the next, someone asking if the power company knows.",
  ],
  newsBroadcast: [
    "At first there may be little or nothing useful. Broadcasts need a minute or two before producers can pivot from ordinary programming.",
    "The first visible change should feel like uncertainty entering the broadcast before the story becomes a full breaking-news firehose.",
    "Anchors are careful not to repeat the invitation as instruction, but the words are visible in blurred screenshots behind them.",
    "Official statements lag behind public reports and advise people to avoid interacting with unexplained prompts.",
    "Guests disagree on whether this is a cyberattack, mass hoax, platform compromise, or something unprecedented.",
    "The broadcast cadence keeps slipping from routine breaking news into visible uncertainty.",
  ],
  genericPublicWeb: [
    "At first there may be little or nothing useful. It takes a minute or two for public pages, searches, and forums to catch up.",
    "The earliest useful signals should feel scattered before duplicate questions and screenshots begin accelerating.",
    "Search results and public pages are filling with duplicate questions faster than authoritative answers can form.",
    "Forums, news sites, local pages, and platform posts all point back to the same phrase appearing on connected devices.",
    "The earliest useful signal is convergence: many unrelated people are describing the same event from different contexts.",
    "No source available to the player can yet prove what the message is or who sent it.",
  ],
};

export async function createEarlyPostChoiceTurnResponse({
  actionText,
  branch,
  branchInstructions,
  dailyGame,
  day1GameplayContext,
  defaultActionKind,
  player,
  promptExtras,
  storylineContext,
}: {
  actionText: string;
  branch: EarlyPostChoiceBranch;
  branchInstructions: string[];
  dailyGame: DailyGame;
  day1GameplayContext: Day1GameplayContextPayload;
  defaultActionKind: string;
  player: DailyPlayer;
  promptExtras?: Record<string, unknown>;
  storylineContext: Day1StorylineContext;
}): Promise<EarlyPostChoiceTurnResponse> {
  const model = getOpenAINarrativeModel();
  const { text } = await generateText({
    model: openai(model),
    system: createPlayerFacingNarrativePrompt([
      `You are resolving an open-world action after the player answered ${branch}.`,
      "The ordinary world resumes, but public information is starting to show that the event is larger than one person.",
      "Everyone is reacting to the global takeover of screens, audio, internet services, and phone lines. Speculation is rampant.",
      ...branchInstructions,
      "Respond as a grounded global MUD game master, not as an assistant.",
      "Interpret the player's attempted action generously and adjudicate what they can plausibly perceive or learn.",
      "Use the supplied media context only when it matches the player's action. If it does not match, answer the action directly from player and world context.",
      "When media context is relevant, use it as source material. Do not dump it verbatim.",
      "For feed, public-web, or broadcast actions, preserve the timing: at first there may be nothing or only a few scattered posts, then within a minute or two the trickle becomes a firehose.",
      "When it fits the player's action, sprinkle in 1 to 3 short fictional post or broadcast fragments as separate blockquote paragraphs prefixed with >.",
      "Fictional quoted fragments should sound like ordinary people reacting in the moment. Do not include handles, real names, real outlets, or real quotes.",
      "Do not call, scrape, quote, or imply access to real Twitter, X, Bluesky, Facebook, news sites, broadcasts, or external services.",
      "Do not introduce deleted, disappearing, or vanishing posts unless future canonical state explicitly establishes that behavior.",
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
        actionText,
        day1GameplayContext,
        day1MediaContext,
        ...(promptExtras ?? {}),
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
    actionKind: normalizeActionKind(generated.actionKind, defaultActionKind),
    playerVisibleFacts: normalizePlayerVisibleFacts(generated.playerVisibleFacts),
    storylineContextSourceVersion: storylineContext.sourceVersion,
  };
}

function parseGeneratedResponse(text: string): GeneratedEarlyTurnResponse {
  try {
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Generated response was not an object.");
    }

    return parsed as GeneratedEarlyTurnResponse;
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
