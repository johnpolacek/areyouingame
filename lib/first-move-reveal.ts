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
        "You write spare, dramatic first-contact game narration.",
        "Return only the scene intro as exactly two short paragraphs.",
        "Each paragraph must be one sentence and no more than 18 words.",
        "Favor direct impact over description; cut setup, explanation, and atmospheric padding.",
        "Use the player's stated situation as true context and do not contradict it.",
        "Choose a plausible delivery mode: phone buzz, screen takeover, ambient audio, or connected-device interruption.",
        "Do not include or paraphrase the fixed YES/NO reveal copy.",
      ].join(" "),
      prompt: [
        `Daily game id: ${dailyGame.id}`,
        `Shared event time for this player: ${localGameStart}`,
        `Player name: ${player.name}`,
        `Player home/base location: ${player.location}`,
        `Player occupation: ${player.occupation}`,
        `Player bio: ${player.bio}`,
        `Player opening location/activity response: ${player.openingResponse}`,
      ].join("\n"),
    });
    const sceneIntro = normalizeSceneIntro(text);

    return {
      id: createRevealId(dailyGame.id, player.id),
      sceneIntro:
        sceneIntro.length > 0
          ? sceneIntro
          : createFallbackSceneIntro(player.openingResponse || ""),
      revealCopy,
      status: "yes_no_pending",
      generatedAt,
      model,
      source: sceneIntro.length > 0 ? "ai" : "fallback",
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

function createFallbackSceneIntro(openingResponse: string): string[] {
  const situation = limitWords(openingResponse || "where you said you were", 12);

  return [
    `Here, in the middle of ${situation}, every nearby screen goes dark.`,
    "Then one message appears, too calm to be human and too direct to ignore.",
  ];
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
