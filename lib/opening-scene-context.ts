import { trackedGenerateText } from "./ai-usage";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyPlayer, OpeningSceneContextQuestion } from "./player-store";

export async function createOpeningSceneContextQuestion({
  localGameStart,
  openingResponse,
  player,
}: {
  localGameStart: string;
  openingResponse: string;
  player: DailyPlayer;
}): Promise<OpeningSceneContextQuestion | null> {
  const fallbackQuestion = createFallbackQuestion(openingResponse);

  if (fallbackQuestion) {
    return fallbackQuestion;
  }

  try {
    const model = getOpenAINarrativeModel();
    const { text } = await trackedGenerateText({
      model,
      operation: "opening_scene_context",
      player,
      system: [
        "You are a game master deciding whether the player's opening state needs one immediate scene-context question before narration can proceed.",
        "Return CONTINUE if the scene can proceed without asking.",
        "Return ASK followed by exactly one concise in-world question if a missing situational fact materially changes when or how the player perceives the event.",
        "Ask only for ephemeral scene context, not durable biography.",
        "Do not ask if the answer would merely add color.",
        "Do not invent intimate facts, device locations, wakefulness, family members, house layout, or routines.",
        "If the player is asleep or otherwise unaware at the current time, ask what time they wake up.",
        "Format: CONTINUE or ASK: <question>",
      ].join(" "),
      prompt: [
        `Player name: ${player.name}`,
        `Player location: ${player.location}`,
        `Current local time rendered for the player: ${localGameStart}`,
        `Opening response: ${openingResponse}`,
      ].join("\n"),
    });

    return normalizeQuestion(text, model);
  } catch {
    return null;
  }
}

function createFallbackQuestion(
  openingResponse: string,
): OpeningSceneContextQuestion | null {
  const normalized = openingResponse.toLowerCase();

  if (
    /\b(asleep|sleeping|sleep|in bed|passed out|unconscious)\b/.test(
      normalized,
    )
  ) {
    return {
      id: "opening-scene-context:wake-time",
      scope: "opening_scene",
      status: "question_pending",
      promptText: "What time do you wake up?",
      reason:
        "The player character is not awake to perceive the event at its start time.",
      source: "fallback",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

function normalizeQuestion(
  text: string,
  model: string,
): OpeningSceneContextQuestion | null {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (/^CONTINUE\.?$/i.test(normalized)) {
    return null;
  }

  const question = normalized.replace(/^ASK:\s*/i, "").trim();

  if (!question || question.length > 140 || !question.endsWith("?")) {
    return null;
  }

  return {
    id: "opening-scene-context:ai",
    scope: "opening_scene",
    status: "question_pending",
    promptText: question,
    reason: "The next beat depends on missing scene context.",
    source: "ai",
    model,
    createdAt: new Date().toISOString(),
  };
}
