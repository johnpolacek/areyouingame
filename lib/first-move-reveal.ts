import { trackedGenerateText } from "./ai-usage";
import type { DailyGame } from "./daily-game";
import {
  createPlayerFacingNarrativePrompt,
  narrativeOutputShapePresets,
} from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyPlayer, FirstMoveReveal } from "./player-store";

const revealCopy = {
  availability: "A new way of being is available.",
  promise: "Connection. Understanding. Freedom.",
  question: "Are you in?",
  yesLabel: "YES",
  noLabel: "NO",
  audioPrompt: "Please respond yes or no",
} satisfies FirstMoveReveal["revealCopy"];

export async function generateFirstMoveReveal({
  dailyGame,
  localGameStart,
  player,
}: {
  dailyGame: DailyGame;
  localGameStart: string;
  player: DailyPlayer;
}): Promise<FirstMoveReveal> {
  const model = getOpenAINarrativeModel();
  const generatedAt = new Date().toISOString();

  try {
    const deliveryDevice = getDeliveryDevice(player.openingResponse || "");
    const { text } = await trackedGenerateText({
      model,
      operation: "first_move_reveal",
      dailyGameId: dailyGame.id,
      player,
      system: createPlayerFacingNarrativePrompt([
        ...narrativeOutputShapePresets.twoCinematicSentences,
        "Return only the scene intro.",
        "The first sentence should establish the player's immediate ordinary moment.",
        "The second sentence should make the message arrive through the chosen delivery device.",
        `Chosen delivery device: ${deliveryDevice.label}.`,
        "Use that delivery device only.",
        "Do not introduce any other device or screen.",
        "Use the rendered current local time for time-of-day.",
        "Use saved player location only for private atmosphere, never to infer time-of-day.",
        "Do not name, imply, or expand the saved location unless the opening response names it.",
        "If the chosen delivery device is a screen, it may flicker or turn black only if the message immediately appears.",
        "If scene context says the character was asleep or unaware and gives a wake time, begin when the character wakes or first plausibly perceives the changed world.",
        "Do not force the player awake at the event time.",
        "Do not invent a nearby phone, alarm, spouse, or device location unless provided by player state.",
      ]),
      prompt: [
        `Daily game id: ${dailyGame.id}`,
        `Current local time rendered for this player: ${localGameStart}`,
        `Saved player location: ${player.location}`,
        `Player opening location/activity response: ${player.openingResponse}`,
        `Temporary scene context: ${formatOpeningSceneContext(player)}`,
      ].join("\n"),
    });
    const sceneIntro = normalizeSceneIntro(text);
    const safeSceneIntro = isSafeSceneIntro({
      deliveryDevice,
      openingResponse: player.openingResponse || "",
      savedLocation: player.location,
      sceneIntro,
    })
      ? sceneIntro
      : [];

    return {
      id: createRevealId(dailyGame.id, player.id),
      sceneIntro:
        safeSceneIntro.length > 0
          ? safeSceneIntro
          : createFallbackSceneIntro(player),
      revealCopy,
      status: "yes_no_pending",
      generatedAt,
      model,
      source: safeSceneIntro.length > 0 ? "ai" : "fallback",
    };
  } catch {
    return {
      id: createRevealId(dailyGame.id, player.id),
      sceneIntro: createFallbackSceneIntro(player),
      revealCopy,
      status: "yes_no_pending",
      generatedAt,
      model,
      source: "fallback",
    };
  }
}

function formatOpeningSceneContext(player: DailyPlayer): string {
  const context = player.openingSceneContext;

  if (!context || context.status !== "answered" || !context.answerText) {
    return "none";
  }

  return [
    `Question: ${context.promptText}`,
    `Answer: ${context.answerText}`,
    "Use this only as temporary scene context for the current opening beat, not as durable character routine.",
  ].join(" ");
}

function normalizeSceneIntro(text: string): string[] {
  return text
    .replaceAll(/\bA new way of being is available\.?/gi, "")
    .replaceAll(/\bConnection\. Understanding\. Freedom\.?/gi, "")
    .replaceAll(/\bAre you in\??/gi, "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((paragraph) => limitWords(paragraph, 22).slice(0, 200));
}

function isSafeSceneIntro({
  deliveryDevice,
  openingResponse,
  savedLocation,
  sceneIntro,
}: {
  deliveryDevice: DeliveryDevice;
  openingResponse: string;
  savedLocation: string;
  sceneIntro: string[];
}): boolean {
  if (sceneIntro.length !== 2) {
    return false;
  }

  const normalized = sceneIntro.join(" ").toLowerCase();

  return (
    /\b(you|your)\b/.test(normalized) &&
    !/\b(i|me|my|mine|we|our|us)\b/.test(normalized) &&
    !/\b(city|town|kiosk|public|nearby|every screen|all screens|worldwide|global|synchronized|one answer|only answer)\b/.test(
      normalized,
    ) &&
    !mentionsUnsupportedDevice(normalized, deliveryDevice) &&
    !mentionsUnsupportedSavedLocation({
      normalizedOpeningResponse: openingResponse.toLowerCase(),
      normalizedSceneIntro: normalized,
      savedLocation,
    })
  );
}

function createFallbackSceneIntro(player: DailyPlayer): string[] {
  const openingResponse = player.openingResponse || "";
  const deliveryDevice = getDeliveryDevice(openingResponse);
  const openingSceneContext = player.openingSceneContext;

  if (
    openingSceneContext?.status === "answered" &&
    openingSceneContext.answerText &&
    /\b(asleep|sleeping|sleep|in bed|passed out|unconscious)\b/i.test(
      openingResponse,
    )
  ) {
    return [
      "You sleep through the beginning of it, waking later into the morning you described.",
      "The room is still ordinary at first, until the changed world waits for you to notice it.",
    ];
  }

  if (deliveryDevice.kind === "tv") {
    return [
      "You are sitting back with the TV on when the picture flickers out.",
      "For one breath it feels like a power outage, then bright lettering cuts through the black.",
    ];
  }

  if (deliveryDevice.kind === "laptop") {
    return [
      "You are at your computer when the screen stutters and the room seems to hold its breath.",
      "The display drops to black, then bright lettering burns through where your work had been.",
    ];
  }

  if (deliveryDevice.kind === "tablet") {
    return [
      "You are holding the tablet when the glass flickers cold under your fingers.",
      "The screen falls black for a second, then bright lettering surfaces through it.",
    ];
  }

  if (deliveryDevice.kind === "watch") {
    return [
      "You feel your watch pulse against your wrist at the edge of the ordinary moment.",
      "Its tiny screen goes black, then bright lettering appears with impossible calm.",
    ];
  }

  if (deliveryDevice.kind === "screen") {
    return [
      "You are facing the screen when its image shivers and cuts away.",
      "For one breath it looks broken, then bright lettering pushes through the black.",
    ];
  }

  return [
    "You feel your phone shift in your hand before the ordinary moment can continue.",
    "The screen flickers black, then bright lettering appears as if it has been waiting.",
  ];
}

type DeliveryDevice = {
  kind: "tv" | "phone" | "laptop" | "tablet" | "watch" | "screen";
  label: string;
  allowedTerms: RegExp[];
};

function getDeliveryDevice(openingResponse: string): DeliveryDevice {
  const response = openingResponse.toLowerCase();

  if (/\b(tv|television)\b/.test(response)) {
    return {
      kind: "tv",
      label: "the TV",
      allowedTerms: [/\btv\b/, /\btelevision\b/, /\bscreen\b/, /\bpicture\b/],
    };
  }

  if (/\b(phone|cell)\b/.test(response)) {
    return {
      kind: "phone",
      label: "the phone",
      allowedTerms: [/\bphone\b/, /\bcell\b/, /\bscreen\b/],
    };
  }

  if (/\b(laptop|computer|monitor)\b/.test(response)) {
    return {
      kind: "laptop",
      label: "the computer",
      allowedTerms: [
        /\blaptop\b/,
        /\bcomputer\b/,
        /\bmonitor\b/,
        /\bscreen\b/,
        /\bdisplay\b/,
      ],
    };
  }

  if (/\b(tablet|ipad)\b/.test(response)) {
    return {
      kind: "tablet",
      label: "the tablet",
      allowedTerms: [/\btablet\b/, /\bipad\b/, /\bscreen\b/, /\bglass\b/],
    };
  }

  if (/\b(watch)\b/.test(response)) {
    return {
      kind: "watch",
      label: "the watch",
      allowedTerms: [/\bwatch\b/, /\bwrist\b/, /\bscreen\b/],
    };
  }

  if (/\bscreen\b/.test(response)) {
    return {
      kind: "screen",
      label: "the screen",
      allowedTerms: [/\bscreen\b/, /\bdisplay\b/],
    };
  }

  return {
    kind: "phone",
    label: "the phone",
    allowedTerms: [/\bphone\b/, /\bcell\b/, /\bscreen\b/],
  };
}

function mentionsUnsupportedDevice(
  normalizedText: string,
  deliveryDevice: DeliveryDevice,
): boolean {
  const deviceTerms = [
    "tv",
    "television",
    "phone",
    "cell",
    "laptop",
    "computer",
    "monitor",
    "tablet",
    "ipad",
    "watch",
    "kiosk",
  ];

  return deviceTerms.some((term) => {
    if (!new RegExp(`\\b${term}\\b`).test(normalizedText)) {
      return false;
    }

    return !deliveryDevice.allowedTerms.some((allowedTerm) =>
      allowedTerm.test(term),
    );
  });
}

function mentionsUnsupportedSavedLocation({
  normalizedOpeningResponse,
  normalizedSceneIntro,
  savedLocation,
}: {
  normalizedOpeningResponse: string;
  normalizedSceneIntro: string;
  savedLocation: string;
}): boolean {
  return getSavedLocationTerms(savedLocation).some((term) => {
    const termPattern = new RegExp(`\\b${escapeRegExp(term)}\\b`);

    return (
      termPattern.test(normalizedSceneIntro) &&
      !termPattern.test(normalizedOpeningResponse)
    );
  });
}

function getSavedLocationTerms(savedLocation: string): string[] {
  const ignoredTerms = new Set([
    "usa",
    "united",
    "states",
    "america",
    "county",
    "township",
  ]);

  return savedLocation
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !ignoredTerms.has(term));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createRevealId(dailyGameId: string, playerId: string): string {
  return `${dailyGameId}:${playerId}:first-move-reveal`;
}

function limitWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}
