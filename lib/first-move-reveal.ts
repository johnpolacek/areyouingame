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
        "You write concise cinematic first-contact game narration.",
        "Return only the scene intro, with one or two short paragraphs.",
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
    .map((paragraph) => paragraph.slice(0, 700));
}

function createFallbackSceneIntro(openingResponse: string): string[] {
  const situation = openingResponse || "where you said you were";

  return [
    `The moment finds you in the middle of this: ${situation}. Your phone gives one sharp buzz, and any nearby screen seems to pause for the same held breath.`,
    "Then the message arrives in plain words, close enough to feel addressed and quiet enough to feel impossible.",
  ];
}

function createRevealId(dailyGameId: string, playerId: string): string {
  return `${dailyGameId}:${playerId}:first-move-reveal`;
}
