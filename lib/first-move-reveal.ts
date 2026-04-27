import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { DailyGame } from "./daily-game";
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
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const generatedAt = new Date().toISOString();

  try {
    const { text } = await generateText({
      model: openai(model),
      system: [
        "You write spare, dramatic first-contact game narration in first person.",
        "Return only the scene intro as exactly two short paragraphs.",
        "Each paragraph must be one sentence and no more than 18 words.",
        "Every sentence must be present-tense first-person POV from inside the player character.",
        "Every sentence must include I, me, my, or mine.",
        "Do not address the player by name.",
        "Favor direct impact over description; cut setup, explanation, and atmospheric padding.",
        "Use only details explicitly present in the player's opening response.",
        "Do not invent cities, public places, nearby people, kiosks, phones, or other devices.",
        "If the player names a device or screen, make that exact device display the fixed YES/NO reveal message.",
        "If no device or screen is named, use my phone as the minimal delivery mode.",
        "Do not mention city-wide, worldwide, every-screen, or public synchronized displays.",
        "Do not say there is only one possible answer.",
        "Do not say a screen turns black, goes dark, blanks out, or loses signal.",
        "Do not include or paraphrase the fixed YES/NO reveal copy.",
      ].join(" "),
      prompt: [
        `Daily game id: ${dailyGame.id}`,
        `Shared event time for this player: ${localGameStart}`,
        `Player opening location/activity response: ${player.openingResponse}`,
      ].join("\n"),
    });
    const sceneIntro = normalizeSceneIntro(text);
    const safeSceneIntro = isFirstPersonSceneIntro(sceneIntro)
      ? sceneIntro
      : [];

    return {
      id: createRevealId(dailyGame.id, player.id),
      sceneIntro:
        safeSceneIntro.length > 0
          ? safeSceneIntro
          : createFallbackSceneIntro(player.openingResponse || ""),
      revealCopy,
      status: "yes_no_pending",
      generatedAt,
      model,
      source: safeSceneIntro.length > 0 ? "ai" : "fallback",
    };
  } catch {
    return {
      id: createRevealId(dailyGame.id, player.id),
      sceneIntro: createFallbackSceneIntro(player.openingResponse || ""),
      revealCopy,
      status: "yes_no_pending",
      generatedAt,
      model,
      source: "fallback",
    };
  }
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
    .map((paragraph) => limitWords(paragraph, 18).slice(0, 180));
}

function isFirstPersonSceneIntro(sceneIntro: string[]): boolean {
  if (sceneIntro.length !== 2) {
    return false;
  }

  return sceneIntro.every((paragraph) => {
    const normalized = paragraph.toLowerCase();

    return (
      /\b(i|me|my|mine)\b/.test(normalized) &&
      !/\b(you|your|city|town|kiosk|public|nearby|every screen|all screens|worldwide|global|one answer)\b/.test(
        normalized,
      )
    );
  });
}

function createFallbackSceneIntro(openingResponse: string): string[] {
  const deliveryMode = getFallbackDeliveryMode(openingResponse);

  return [
    `I look up as ${deliveryMode} shows the message.`,
    "I feel the room narrow around me as the words wait for my answer.",
  ];
}

function getFallbackDeliveryMode(openingResponse: string): string {
  const response = openingResponse.toLowerCase();

  if (/\b(tv|television)\b/.test(response)) {
    return "my TV";
  }

  if (/\b(phone|cell)\b/.test(response)) {
    return "my phone";
  }

  if (/\b(laptop|computer|monitor)\b/.test(response)) {
    return "my computer";
  }

  if (/\b(tablet|ipad)\b/.test(response)) {
    return "my tablet";
  }

  if (/\b(watch)\b/.test(response)) {
    return "my watch";
  }

  if (/\bscreen\b/.test(response)) {
    return "my screen";
  }

  return "my phone";
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
