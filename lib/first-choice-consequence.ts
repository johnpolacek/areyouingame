import { trackedGenerateText } from "./ai-usage";
import {
  createPlayerFacingNarrativePrompt,
  narrativeOutputShapePresets,
} from "./narrative-voice";
import { getOpenAINarrativeModel } from "./openai-models";
import type { DailyPlayer, FirstDecision, YesNoChoice } from "./player-store";

export type FirstChoiceConsequence = Pick<
  FirstDecision,
  | "consequenceTitle"
  | "consequenceBody"
  | "consequenceModel"
  | "consequenceSource"
>;

export async function createFirstChoiceConsequence({
  choice,
  finalResponseText,
  player,
}: {
  choice: YesNoChoice;
  finalResponseText?: string;
  player: DailyPlayer;
}): Promise<FirstChoiceConsequence> {
  if (choice === "YES") {
    return await createYesConsequence({ finalResponseText, player });
  }

  return await createNoConsequence({ finalResponseText, player });
}

async function createYesConsequence({
  finalResponseText,
  player,
}: {
  finalResponseText?: string;
  player: DailyPlayer;
}): Promise<FirstChoiceConsequence> {
  const model = getOpenAINarrativeModel();
  const fallbackBody = createFallbackYesConsequenceBody({
    finalResponseText,
    player,
  });

  try {
    const { text } = await trackedGenerateText({
      model,
      operation: "first_choice_consequence_yes",
      player,
      system: createPlayerFacingNarrativePrompt([
        ...narrativeOutputShapePresets.twoCinematicSentences,
        "Return only the immediate consequence of the player choosing YES.",
        "The player's ordinary day should resume for now. Nothing physical arrives yet.",
        "Base the resumed ordinary moment on the player's opening response, previous unresolved actions, and final response.",
        "If previous unresolved actions or the final response moved the player to another device or room, acknowledge that immediate context before returning to normal.",
        "Include the most recent physical interaction when it matters, such as a phone going quiet, a receiver being set down, or a screen returning.",
        "Convert first-person player input into second-person narration.",
        "Do not quote the player's opening response.",
        "Do not mention the game, answer, choice, records, a door, an invitation, drones, packages, or orbs.",
        "Do not imply delivery, connection, transformation, judgment, or shared awareness has happened yet.",
      ]),
      prompt: [
        `Player saved location: ${player.location}`,
        `Player opening location/activity response: ${player.openingResponse || "unknown"}`,
        `Opening reveal scene: ${(player.firstMoveReveal?.sceneIntro ?? []).join(" ")}`,
        `Previous unresolved actions and responses: ${formatPreviousUnresolvedActions(player)}`,
        `Final response text: ${finalResponseText || "YES button selected"}`,
      ].join("\n"),
    });
    const body = normalizeYesConsequenceBody(text);
    const isSafeBody = isSafeYesConsequenceBody(body);

    return {
      consequenceTitle: "",
      consequenceBody: isSafeBody ? body : fallbackBody,
      consequenceModel: model,
      consequenceSource: isSafeBody ? "ai" : "fallback",
    };
  } catch {
    return {
      consequenceTitle: "",
      consequenceBody: fallbackBody,
      consequenceModel: model,
      consequenceSource: "fallback",
    };
  }
}

async function createNoConsequence({
  finalResponseText,
  player,
}: {
  finalResponseText?: string;
  player: DailyPlayer;
}): Promise<FirstChoiceConsequence> {
  const model = getOpenAINarrativeModel();
  const fallbackBody = createFallbackNoConsequenceBody({
    finalResponseText,
    player,
  });

  try {
    const { text } = await trackedGenerateText({
      model,
      operation: "first_choice_consequence_no",
      player,
      system: createPlayerFacingNarrativePrompt([
        ...narrativeOutputShapePresets.twoCinematicSentences,
        "Return only the immediate consequence of the player choosing NO.",
        "The message should disappear and the player's ordinary day should resume.",
        "Base the resumed ordinary moment on the player's opening response, previous unresolved actions, and final response.",
        "If previous unresolved actions or the final response moved the player to another device or room, acknowledge that immediate context before returning to normal.",
        "Include the most recent physical interaction when it matters, such as a phone going quiet, a receiver being set down, or a screen returning.",
        "Convert first-person player input into second-person narration.",
        "Do not quote the player's opening response.",
        "Do not mention the game, the answer, the choice, refusal, records, a door, or an invitation.",
        "Do not imply anything has been preserved, logged, judged, or held in place.",
      ]),
      prompt: [
        `Player saved location: ${player.location}`,
        `Player opening location/activity response: ${player.openingResponse || "unknown"}`,
        `Opening reveal scene: ${(player.firstMoveReveal?.sceneIntro ?? []).join(" ")}`,
        `Previous unresolved actions and responses: ${formatPreviousUnresolvedActions(player)}`,
        `Final response text: ${finalResponseText || "NO button selected"}`,
      ].join("\n"),
    });
    const body = normalizeNoConsequenceBody(text);
    const isSafeBody = isSafeNoConsequenceBody(body);

    return {
      consequenceTitle: "",
      consequenceBody: isSafeBody ? body : fallbackBody,
      consequenceModel: model,
      consequenceSource: isSafeBody ? "ai" : "fallback",
    };
  } catch {
    return {
      consequenceTitle: "",
      consequenceBody: fallbackBody,
      consequenceModel: model,
      consequenceSource: "fallback",
    };
  }
}

function normalizeNoConsequenceBody(text: string): string {
  return text
    .replaceAll(/\bA new way of being is available\.?/gi, "")
    .replaceAll(/\bConnection\. Understanding\. Freedom\.?/gi, "")
    .replaceAll(/\bAre you in\??/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function isSafeNoConsequenceBody(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    Boolean(text) &&
    /\b(you|your)\b/.test(normalized) &&
    !/\b(i|me|my|mine|we|our|us)\b/.test(normalized) &&
    !/\b(game|answer|choice|refusal|record|records|recorded|door|invitation|held in place)\b/.test(
      normalized,
    )
  );
}

function normalizeYesConsequenceBody(text: string): string {
  return text
    .replaceAll(/\bA new way of being is available\.?/gi, "")
    .replaceAll(/\bConnection\. Understanding\. Freedom\.?/gi, "")
    .replaceAll(/\bAre you in\??/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function isSafeYesConsequenceBody(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    Boolean(text) &&
    /\b(you|your)\b/.test(normalized) &&
    !/\b(i|me|my|mine|we|our|us)\b/.test(normalized) &&
    !/\b(game|yes|answer|choice|accept|accepted|record|records|recorded|door|invitation|drone|drones|package|packages|orb|orbs|delivery|delivered|connection|connected|transformation|judgment|shared awareness)\b/.test(
      normalized,
    )
  );
}

function createFallbackYesConsequenceBody({
  finalResponseText,
  player,
}: {
  finalResponseText?: string;
  player: DailyPlayer;
}): string {
  const opening = normalizeForFallback(player.openingResponse);
  const recentActionText = normalizeForFallback(
    [
      ...(player.firstRevealTextResponses ?? []).map(
        (response) => response.inputText,
      ),
      finalResponseText,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (
    /\b(vibe.?cod|vibing.*cod|coding|code|programming|terminal|editor|ide|laptop)\b/.test(
      opening,
    )
  ) {
    return "The message clears. You are still vibecoding, with the editor, terminal, and half-shaped thing waiting exactly where you left them.";
  }

  if (
    recentActionText &&
    /\b(landline|land line|receiver|corded phone|home phone)\b/.test(
      recentActionText,
    )
  ) {
    return "The message clears. The landline goes quiet in your hand, and the room settles back around the ordinary day you left behind.";
  }

  if (
    recentActionText &&
    /\b(phone|cell)\b/.test(recentActionText) &&
    !/\b(landline|land line|receiver|corded phone|home phone)\b/.test(
      recentActionText,
    )
  ) {
    return "The message clears. Your phone returns to ordinary glass in your hand, and the room waits with the same air it had a moment ago.";
  }

  if (
    opening &&
    /\b(couch|sofa)\b/.test(opening) &&
    /\blaptop\b/.test(opening)
  ) {
    return "The message clears. You are back on the couch with your laptop, and the day resumes around the work in front of you.";
  }

  if (opening && /\blaptop|computer|desk|work\b/.test(opening)) {
    return "The message clears. You are back with your work, and the ordinary screen in front of you waits for the next keystroke.";
  }

  if (opening && /\btv|television|movie|show\b/.test(opening)) {
    return "The message clears. You are back where you were, watching the room settle around the screen as the day resumes.";
  }

  if (opening && /\bbed|sleep|asleep|sleeping\b/.test(opening)) {
    return "The message clears. You are back in the quiet of the room, and the day resumes from the rest you were trying to keep.";
  }

  return "The message clears. Nothing obvious arrives to replace it, and the day resumes around whatever you were doing before it appeared.";
}

function createFallbackNoConsequenceBody({
  finalResponseText,
  player,
}: {
  finalResponseText?: string;
  player: DailyPlayer;
}): string {
  const opening = normalizeForFallback(player.openingResponse);
  const recentActionText = normalizeForFallback(
    [
      ...(player.firstRevealTextResponses ?? []).map(
        (response) => response.inputText,
      ),
      finalResponseText,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (
    recentActionText &&
    /\b(landline|land line|receiver|corded phone|home phone)\b/.test(
      recentActionText,
    )
  ) {
    if (/\b(couch|sofa)\b/.test(opening) && /\blaptop\b/.test(opening)) {
      return "The message disappears. The landline goes quiet in your hand, and the couch, laptop, and half-finished work wait exactly where you left them.";
    }

    return "The message disappears. The landline goes quiet in your hand, and the room settles back around the ordinary day you left behind.";
  }

  if (
    recentActionText &&
    /\b(phone|cell)\b/.test(recentActionText) &&
    !/\b(landline|land line|receiver|corded phone|home phone)\b/.test(
      recentActionText,
    )
  ) {
    if (/\b(couch|sofa)\b/.test(opening) && /\blaptop\b/.test(opening)) {
      return "The message disappears. Your phone returns to ordinary glass in your hand, with the couch and laptop waiting where the day left them.";
    }

    return "The message disappears. Your phone returns to ordinary glass in your hand, and the day resumes around the room you were already in.";
  }

  if (
    opening &&
    /\b(couch|sofa)\b/.test(opening) &&
    /\blaptop\b/.test(opening)
  ) {
    return "The message disappears. You are back on the couch, working on your laptop, and the day resumes around the ordinary work in front of you.";
  }

  if (opening && /\blaptop|computer|desk|work\b/.test(opening)) {
    return "The message disappears. You are back with your work, and the day resumes around the ordinary screen in front of you.";
  }

  if (opening && /\btv|television|movie|show\b/.test(opening)) {
    return "The message disappears. You are back where you were, watching the room settle around the screen as the day resumes.";
  }

  if (opening && /\bbed|sleep|asleep|sleeping\b/.test(opening)) {
    return "The message disappears. You are back in the quiet of the room, and the day resumes from the rest you were trying to keep.";
  }

  return "The message disappears. Everything returns to normal, and the day resumes around whatever you were doing before it arrived.";
}

function formatPreviousUnresolvedActions(player: DailyPlayer): string {
  const actions = (player.firstRevealTextResponses ?? [])
    .filter((response) => response.classification === "DEFERRED")
    .map((response) =>
      [
        `Player action: ${response.inputText.trim()}`,
        response.interruptionText
          ? `Narrative result: ${response.interruptionText.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean)
    .slice(-5);

  return actions.length > 0 ? actions.join(" | ") : "none";
}

function normalizeForFallback(text?: string): string {
  return text?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
}
