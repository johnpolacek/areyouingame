import { fetchMutation, fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import { deriveTimeZoneFromLocation } from "./character-draft";
import type { DailyGame } from "./daily-game";

export type PlayerDraftInput = {
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  timeZone: string;
};

export type DailyPlayer = PlayerDraftInput & {
  id: string;
  clerkUserId: string;
  dailyGameId: string;
  firstDecision?: FirstDecision;
  firstRevealTextResponses?: FirstRevealTextResponse[];
  firstPostChoiceAction?: FirstPostChoiceAction;
  firstConnectedPath?: FirstConnectedPath;
  firstMoveReveal?: FirstMoveReveal;
  openingSceneContext?: OpeningSceneContextQuestion;
  openingResponse?: string;
  openingResponseSubmittedAt?: string;
  publicGameplayAgreementAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FirstMoveReveal = {
  id: string;
  sceneIntro: string[];
  revealCopy: {
    availability: "A new way of being is available.";
    promise: "Connection. Understanding. Freedom.";
    question: "Are you in?";
    yesLabel: "YES";
    noLabel: "NO";
    audioPrompt: "Please respond yes or no";
  };
  status: "yes_no_pending";
  generatedAt: string;
  model: string;
  source: "ai" | "fallback";
};

export type FirstDecision = {
  id: string;
  choice: YesNoChoice;
  status: "first_choice_submitted";
  consequenceTitle: string;
  consequenceBody: string;
  consequenceModel: string;
  consequenceSource: "ai" | "fallback";
  revealId: string;
  revealGeneratedAt: string;
  revealModel: string;
  revealSource: "ai" | "fallback";
  submittedAt: string;
};

export type YesNoChoice = "YES" | "NO";
export type FirstRevealTextClassification = YesNoChoice | "DEFERRED" | "END_DAY";

export type FirstRevealTextResponse = {
  id: string;
  inputText: string;
  classification: FirstRevealTextClassification;
  model: string;
  source: "ai" | "fallback";
  submittedAt: string;
  interruptionText?: string;
  dayEndText?: string;
};

export type FirstPostChoiceAction = {
  id: string;
  actionText: string;
  submittedAt: string;
  responseText?: string;
  responseModel?: string;
  responseSource?: "ai";
  actionKind?: string;
  playerVisibleFacts?: string[];
  storylineContextSourceVersion?: string;
  resolvedAt?: string;
};

export type ConnectedDeliveryStatus = "pending" | "delivered";
export type ConnectedPackageStatus = "not_arrived" | "available" | "opened";
export type ConnectedOrbStatus = "unknown" | "revealed";
export type FirstConnectedPathStatus =
  | "pre_delivery"
  | "package_available"
  | "orb_revealed";

export type FirstConnectedPathTurn = {
  id: string;
  turnNumber: number;
  actionText: string;
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
  deliveryStatus: ConnectedDeliveryStatus;
  packageStatus: ConnectedPackageStatus;
  orbStatus: ConnectedOrbStatus;
  resolvedAt: string;
};

export type FirstConnectedPath = {
  id: string;
  status: FirstConnectedPathStatus;
  deliveryStatus: ConnectedDeliveryStatus;
  packageStatus: ConnectedPackageStatus;
  orbStatus: ConnectedOrbStatus;
  turnCount: number;
  turns: FirstConnectedPathTurn[];
  startedAt: string;
  deliveredAt?: string;
  openedAt?: string;
  updatedAt: string;
};

export type OpeningSceneContextQuestion = {
  id: string;
  scope: "opening_scene";
  status: "question_pending" | "answered";
  promptText: string;
  reason: string;
  source: "ai" | "fallback";
  model?: string;
  answerText?: string;
  createdAt: string;
  answeredAt?: string;
};

type AuthenticatedPlayerArgs = {
  backendSecret: string;
  clerkUserId: string;
  dailyGameId: string;
};

const getPlayerForUserGameRef = makeFunctionReference<
  "query",
  AuthenticatedPlayerArgs,
  DailyPlayer | null
>("playerStore:getPlayerForUserGame");

const createPlayerForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    dailyGame: DailyGame;
    draft: PlayerDraftInput;
  },
  DailyPlayer
>("playerStore:createPlayerForUserGame");

const acceptPublicGameplayAgreementRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs,
  DailyPlayer
>("playerStore:acceptPublicGameplayAgreement");

const submitOpeningResponseForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    openingResponse: string;
    openingSceneContext?: OpeningSceneContextQuestion;
  },
  DailyPlayer
>("playerStore:submitOpeningResponseForUserGame");

const answerOpeningSceneContextForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    answerText: string;
  },
  DailyPlayer
>("playerStore:answerOpeningSceneContextForUserGame");

const saveFirstMoveRevealForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    reveal: FirstMoveReveal;
  },
  DailyPlayer
>("playerStore:saveFirstMoveRevealForUserGame");

const submitFirstDecisionForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    choice: YesNoChoice;
    consequence?: Pick<
      FirstDecision,
      | "consequenceTitle"
      | "consequenceBody"
      | "consequenceModel"
      | "consequenceSource"
    >;
  },
  DailyPlayer
>("playerStore:submitFirstDecisionForUserGame");

const submitFirstRevealTextResponseForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    responseText: string;
    classification: FirstRevealTextClassification;
    model: string;
    source: "ai" | "fallback";
    interruptionText?: string;
    dayEndText?: string;
    consequence?: Pick<
      FirstDecision,
      | "consequenceTitle"
      | "consequenceBody"
      | "consequenceModel"
      | "consequenceSource"
    >;
  },
  DailyPlayer
>("playerStore:submitFirstRevealTextResponseForUserGame");

const submitFirstPostChoiceActionForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    actionText: string;
    responseText: string;
    responseModel: string;
    responseSource: "ai";
    actionKind: string;
    playerVisibleFacts: string[];
    storylineContextSourceVersion: string;
  },
  DailyPlayer
>("playerStore:submitFirstPostChoiceActionForUserGame");

const submitFirstConnectedPathTurnForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs & {
    actionText: string;
    responseText: string;
    responseModel: string;
    responseSource: "ai";
    actionKind: string;
    playerVisibleFacts: string[];
    storylineContextSourceVersion: string;
    expectedTurnNumber: number;
    status: FirstConnectedPathStatus;
    deliveryStatus: ConnectedDeliveryStatus;
    packageStatus: ConnectedPackageStatus;
    orbStatus: ConnectedOrbStatus;
  },
  DailyPlayer
>("playerStore:submitFirstConnectedPathTurnForUserGame");

const deletePlayerForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs,
  boolean
>("playerStore:deletePlayerForUserGame");

const resetPlayerDayForUserGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedPlayerArgs,
  boolean
>("playerStore:resetPlayerDayForUserGame");

export function validatePlayerDraft(input: unknown): PlayerDraftInput {
  if (!input || typeof input !== "object") {
    throw new Error("Character draft is required.");
  }

  const source = input as Record<string, unknown>;
  const draft: PlayerDraftInput = {
    name: readRequiredString(source.name, "Name", 80),
    age: readAge(source.age),
    location: readRequiredString(source.location, "Location", 120),
    occupation: readRequiredString(source.occupation, "Occupation", 120),
    bio: readRequiredString(source.bio, "Bio", 800),
    timeZone: "",
  };
  draft.timeZone = deriveTimeZoneFromLocation(
    draft.location,
    readOptionalString(source.timeZone, 80) || "UTC",
  );

  return draft;
}

export async function getPlayerForUserGame(
  clerkUserId: string,
  dailyGameId: string,
): Promise<DailyPlayer | null> {
  return await fetchQuery(getPlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export async function createPlayerForUserGame({
  clerkUserId,
  dailyGame,
  draft,
}: {
  clerkUserId: string;
  dailyGame: DailyGame;
  draft: PlayerDraftInput;
}): Promise<DailyPlayer> {
  return await fetchMutation(createPlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId: dailyGame.id,
    dailyGame,
    draft,
  });
}

export async function acceptPublicGameplayAgreement({
  clerkUserId,
  dailyGameId,
}: {
  clerkUserId: string;
  dailyGameId: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(acceptPublicGameplayAgreementRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export function validateOpeningResponse(input: unknown): string {
  const response = readRequiredString(input, "Opening response", 1000);

  if (response.length < 2) {
    throw new Error("Opening response is too short.");
  }

  return response;
}

export async function submitOpeningResponseForUserGame({
  clerkUserId,
  dailyGameId,
  openingSceneContext,
  openingResponse,
}: {
  clerkUserId: string;
  dailyGameId: string;
  openingSceneContext?: OpeningSceneContextQuestion | null;
  openingResponse: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitOpeningResponseForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    openingResponse,
    ...(openingSceneContext ? { openingSceneContext } : {}),
  });
}

export function validateOpeningSceneContextAnswer(input: unknown): string {
  return readRequiredString(input, "Answer", 240);
}

export async function answerOpeningSceneContextForUserGame({
  answerText,
  clerkUserId,
  dailyGameId,
}: {
  answerText: string;
  clerkUserId: string;
  dailyGameId: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(answerOpeningSceneContextForUserGameRef, {
    answerText,
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export async function saveFirstMoveRevealForUserGame({
  clerkUserId,
  dailyGameId,
  reveal,
}: {
  clerkUserId: string;
  dailyGameId: string;
  reveal: FirstMoveReveal;
}): Promise<DailyPlayer> {
  return await fetchMutation(saveFirstMoveRevealForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    reveal,
  });
}

export function validateYesNoChoice(input: unknown): YesNoChoice {
  if (typeof input !== "string") {
    throw new Error("YES or NO choice is required.");
  }

  const choice = input.trim().toUpperCase();

  if (choice !== "YES" && choice !== "NO") {
    throw new Error("Choice must be YES or NO.");
  }

  return choice;
}

export function validateFirstRevealTextResponse(input: unknown): string {
  const response = readRequiredString(input, "Response text", 1200);

  if (response.length < 1) {
    throw new Error("Response text is required.");
  }

  return response;
}

export async function submitFirstDecisionForUserGame({
  clerkUserId,
  dailyGameId,
  choice,
  consequence,
}: {
  clerkUserId: string;
  dailyGameId: string;
  choice: YesNoChoice;
  consequence?: Pick<
    FirstDecision,
    | "consequenceTitle"
    | "consequenceBody"
    | "consequenceModel"
    | "consequenceSource"
  >;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitFirstDecisionForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    choice,
    ...(consequence ? { consequence } : {}),
  });
}

export async function submitFirstRevealTextResponseForUserGame({
  clerkUserId,
  dailyGameId,
  responseText,
  classification,
  model,
  source,
  interruptionText,
  dayEndText,
  consequence,
}: {
  clerkUserId: string;
  dailyGameId: string;
  responseText: string;
  classification: FirstRevealTextClassification;
  model: string;
  source: "ai" | "fallback";
  interruptionText?: string;
  dayEndText?: string;
  consequence?: Pick<
    FirstDecision,
    | "consequenceTitle"
    | "consequenceBody"
    | "consequenceModel"
    | "consequenceSource"
  >;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitFirstRevealTextResponseForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    responseText,
    classification,
    model,
    source,
    ...(interruptionText ? { interruptionText } : {}),
    ...(dayEndText ? { dayEndText } : {}),
    ...(consequence ? { consequence } : {}),
  });
}

export function validateFirstPostChoiceAction(input: unknown): string {
  return readRequiredString(input, "Action text", 1200);
}

export function validateFirstConnectedPathAction(input: unknown): string {
  return readRequiredString(input, "Action text", 1200);
}

export async function submitFirstPostChoiceActionForUserGame({
  clerkUserId,
  dailyGameId,
  actionText,
  responseText,
  responseModel,
  responseSource,
  actionKind,
  playerVisibleFacts,
  storylineContextSourceVersion,
}: {
  clerkUserId: string;
  dailyGameId: string;
  actionText: string;
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitFirstPostChoiceActionForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    actionText,
    responseText,
    responseModel,
    responseSource,
    actionKind,
    playerVisibleFacts,
    storylineContextSourceVersion,
  });
}

export async function submitFirstConnectedPathTurnForUserGame({
  clerkUserId,
  dailyGameId,
  actionText,
  responseText,
  responseModel,
  responseSource,
  actionKind,
  playerVisibleFacts,
  storylineContextSourceVersion,
  expectedTurnNumber,
  status,
  deliveryStatus,
  packageStatus,
  orbStatus,
}: {
  clerkUserId: string;
  dailyGameId: string;
  actionText: string;
  responseText: string;
  responseModel: string;
  responseSource: "ai";
  actionKind: string;
  playerVisibleFacts: string[];
  storylineContextSourceVersion: string;
  expectedTurnNumber: number;
  status: FirstConnectedPathStatus;
  deliveryStatus: ConnectedDeliveryStatus;
  packageStatus: ConnectedPackageStatus;
  orbStatus: ConnectedOrbStatus;
}): Promise<DailyPlayer> {
  return await fetchMutation(submitFirstConnectedPathTurnForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
    actionText,
    responseText,
    responseModel,
    responseSource,
    actionKind,
    playerVisibleFacts,
    storylineContextSourceVersion,
    expectedTurnNumber,
    status,
    deliveryStatus,
    packageStatus,
    orbStatus,
  });
}

export async function deletePlayerForUserGame(
  clerkUserId: string,
  dailyGameId: string,
): Promise<boolean> {
  return await fetchMutation(deletePlayerForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

export async function resetPlayerDayForUserGame(
  clerkUserId: string,
  dailyGameId: string,
): Promise<boolean> {
  return await fetchMutation(resetPlayerDayForUserGameRef, {
    backendSecret: getBackendSecret(),
    clerkUserId,
    dailyGameId,
  });
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}

function readRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  const text = readOptionalString(value, maxLength);

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function readOptionalString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function readAge(value: unknown): string {
  const age = readRequiredString(value, "Age", 3);
  const parsedAge = Number(age);

  if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    throw new Error("Age must be a whole number from 13 to 120.");
  }

  return age;
}
