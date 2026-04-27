import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type {
  DailyPlayer,
  FirstRevealTextClassification,
} from "./player-store";

export type FirstRevealTextClassificationResult = {
  classification: FirstRevealTextClassification;
  model: string;
  source: "ai";
  interruptionText?: string;
};

export async function classifyFirstRevealTextResponse({
  player,
  responseText,
}: {
  player: DailyPlayer;
  responseText: string;
}): Promise<FirstRevealTextClassificationResult> {
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const { text } = await generateText({
    model: openai(model),
    system: [
      "Classify a player's response to the exact question 'Are you in?'.",
      "Return exactly one token: YES, NO, or DEFERRED.",
      "YES means the player clearly accepts, agrees, joins, consents, or says yes.",
      "NO means the player clearly refuses, rejects, declines, opts out, or says no.",
      "DEFERRED means ambiguous, avoidant, a question, hesitation, trying something else, or ignoring the demand.",
      "Do not explain your answer.",
    ].join(" "),
    prompt: [
      `Player name: ${player.name}`,
      `Player location: ${player.location}`,
      `Player occupation: ${player.occupation}`,
      `Question: Are you in?`,
      `Player response: ${responseText}`,
    ].join("\n"),
  });
  const classification = normalizeClassification(text);

  return {
    classification,
    model,
    source: "ai",
    ...(classification === "DEFERRED"
      ? { interruptionText: createInterruptionText(responseText) }
      : {}),
  };
}

function normalizeClassification(text: string): FirstRevealTextClassification {
  const normalized = text.trim().replace(/[.!\s]+$/g, "").toUpperCase();

  if (
    normalized === "YES" ||
    normalized === "NO" ||
    normalized === "DEFERRED"
  ) {
    return normalized;
  }

  throw new Error("Classifier returned malformed output.");
}

function createInterruptionText(responseText: string): string {
  const normalizedAction = responseText
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (
    /\b(wife|husband|partner|spouse|mom|mother|dad|father|friend|someone|neighbor|call|text|show|tell|wake)\b/.test(
      normalizedAction,
    )
  ) {
    return "You turn toward someone else, already imagining their face when they see it. Behind you, the question stays lit, patient and unchanged.";
  }

  if (
    /\b(run|leave|escape|outside|door|upstairs|downstairs|hide|walk away|go away)\b/.test(
      normalizedAction,
    )
  ) {
    return "You move as if distance might make the moment ordinary again. The message waits behind you, bright enough to follow.";
  }

  if (
    /\b(ask|question|what|why|who|how|talk|say|speak)\b/.test(
      normalizedAction,
    )
  ) {
    return "You send a question into the room, but nothing answers in a voice. The screen holds its silence around the choice.";
  }

  return "You try to step around the question, but the moment tightens instead of passing. The message remains, patient and bright.";
}
