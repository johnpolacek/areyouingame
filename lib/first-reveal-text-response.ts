import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  createPlayerFacingNarrativePrompt,
  narrativeOutputShapePresets,
} from "./narrative-voice";
import {
  getOpenAIClassifierModel,
  getOpenAINarrativeModel,
} from "./openai-models";
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
  const model = getOpenAIClassifierModel();
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
  const interruptionText =
    classification === "DEFERRED"
      ? await createInterruptionText({ player, responseText })
      : undefined;

  return {
    classification,
    model,
    source: "ai",
    ...(interruptionText ? { interruptionText } : {}),
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

async function createInterruptionText({
  player,
  responseText,
}: {
  player: DailyPlayer;
  responseText: string;
}): Promise<string> {
  const fallbackText = createFallbackInterruptionText(responseText);

  try {
    const { text } = await generateText({
      model: openai(getOpenAINarrativeModel()),
      system: createPlayerFacingNarrativePrompt([
        ...narrativeOutputShapePresets.twoCinematicSentences,
        "Return only the immediate narrative response to the player's deferred action.",
        "The central YES/NO message has hijacked the player's available devices and remains unresolved.",
        "Treat the deferred action as real and consequential in the scene, not as an invalid input.",
        "If the player checks or gets a device, that device should show the same unresolved message.",
        "If the player checks a different kind of device than before, make that device feel physically distinct instead of repeating the same phrasing.",
        "If the player uses a landline, receiver, intercom, radio, or other audio-only device, it should audibly say the same unresolved message.",
        "If the player wakes, calls, tells, or shows someone, include one small human reaction from that person while the unresolved message remains central.",
        "If the player looks outside, through a window, or onto the block, widen only to what they can plausibly see from there: houses, windows, porch lights, cars, or lit rooms.",
        "If the player invokes technical expertise, hacking, software, networks, or debugging, honor that knowledge with one concrete failed expectation like no app chrome, no cursor, no dial tone, no notification, or no normal desktop.",
        "Let repeated deferrals escalate by radius: same room, another device, another person, the house, then the visible block.",
        "Keep the pressure active until the player clearly agrees or refuses.",
        "Do not quote the player's action back.",
        "Do not tell the player to respond yes or no.",
      ]),
      prompt: [
        `Player saved location: ${player.location}`,
        `Opening reveal scene: ${(player.firstMoveReveal?.sceneIntro ?? []).join(" ")}`,
        `Previous deferred actions: ${formatPreviousDeferredActions(player)}`,
        `Player deferred action: ${responseText}`,
      ].join("\n"),
    });
    const normalizedText = normalizeInterruptionText(text);

    return isSafeInterruptionText(normalizedText)
      ? normalizedText
      : fallbackText;
  } catch {
    return fallbackText;
  }
}

function normalizeInterruptionText(text: string): string {
  return text
    .replaceAll(/\bA new way of being is available\.?/gi, "")
    .replaceAll(/\bConnection\. Understanding\. Freedom\.?/gi, "")
    .replaceAll(/\bAre you in\??/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

function isSafeInterruptionText(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    Boolean(text) &&
    /\b(you|your)\b/.test(normalized) &&
    !/\b(i|me|my|mine|we|our|us)\b/.test(normalized) &&
    !/\b(city|town|kiosk|public|nearby|every screen|all screens|worldwide|global|synchronized|one answer|only answer)\b/.test(
      normalized,
    )
  );
}

function createFallbackInterruptionText(responseText: string): string {
  const normalizedAction = responseText
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (
    /\b(landline|land line|receiver|corded phone|home phone)\b/.test(
      normalizedAction,
    )
  ) {
    return "The landline clicks alive before a dial tone can settle. A calm voice says the same message into the room.";
  }

  if (/\b(radio|intercom|speaker|speakers)\b/.test(normalizedAction)) {
    return "The speaker crackles once, then steadies into a voice too calm for the room. It says the same message aloud.";
  }

  if (/\b(phone|cell)\b/.test(normalizedAction)) {
    return "You pick up your phone, looking for the ordinary internet behind the glass. The same message is already there, waiting on the screen.";
  }

  if (/\b(laptop|computer|desktop|monitor)\b/.test(normalizedAction)) {
    return "The computer wakes without a desktop, cursor, window, or warning. The same message sits where everything ordinary should have been.";
  }

  if (
    /\b(wife|husband|partner|spouse|mom|mother|dad|father|friend|someone|neighbor|call|text|show|tell|wake)\b/.test(
      normalizedAction,
    )
  ) {
    return "You bring someone else into the moment, hoping their face will make it make sense. Their expression changes as the same message waits in front of them too.";
  }

  if (/\b(window|outside|block|street|porch|yard|driveway)\b/.test(normalizedAction)) {
    return "You look out at the block, searching for ordinary dark. Lit windows and quiet rooms hold the same pale message wherever a screen is awake.";
  }

  if (/\b(hack|hacked|software|engineer|debug|network|router|wifi|wi-fi|internet)\b/.test(normalizedAction)) {
    return "You look for the shape of an attack, but there is no browser, cursor, alert, or app to blame. The same message sits underneath every explanation.";
  }

  if (
    /\b(run|leave|escape|door|upstairs|downstairs|hide|walk away|go away)\b/.test(
      normalizedAction,
    )
  ) {
    return "You move as if distance might make the moment ordinary again. Another screen catches the same pale message before you can leave it behind.";
  }

  if (
    /\b(ask|question|what|why|who|how|talk|say|speak)\b/.test(
      normalizedAction,
    )
  ) {
    return "You ask the room for an explanation, and the silence answers by staying exactly where it is. The message waits on the screen.";
  }

  return "You try to step around the question, but the moment tightens instead of passing. The message remains on the screen, patient and bright.";
}

function formatPreviousDeferredActions(player: DailyPlayer): string {
  const deferredActions = (player.firstRevealTextResponses ?? [])
    .filter((response) => response.classification === "DEFERRED")
    .map((response) => response.inputText.trim())
    .filter(Boolean)
    .slice(-3);

  return deferredActions.length > 0 ? deferredActions.join(" | ") : "none";
}
