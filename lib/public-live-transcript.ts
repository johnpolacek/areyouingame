export type PublicLiveTranscriptEntry = {
  id: string;
  at: string;
  label: string;
  title: string;
  playerText?: string;
  gameText?: string;
  narratorText?: string;
  turnImage?: PublicPlayerTurnImage;
};

export type PublicPlayerTurnImage = {
  id: string;
  dailyGameId: string;
  playerId: string;
  sourceTurnId: string;
  sourceTurnKind:
    | "post_choice_turn"
    | "connected_path_turn"
    | "orb_decision_turn"
    | "connected_asi_turn";
  status: "pending" | "generating" | "ready" | "error";
  imageModel?: string;
  quality?: "low";
  size?: "1024x1024";
  contentType?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
};

export type PublicLivePlayerProjection = {
  id: string;
  publicId: string;
  dailyGameId: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  timeZone: string;
  characterImage?: PublicCharacterImage;
  characterInfo?: PublicCharacterInfo;
  choice?: "YES" | "NO";
  transcript: PublicLiveTranscriptEntry[];
  turnCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

type PublicCharacterImage = {
  url: string;
  bucket: string;
  objectKey: string;
  contentType: "image/webp";
  sizeBytes: number;
  uploadedAt: string;
};

type PublicCharacterInfo = {
  sections: Record<string, PublicCharacterInfoItem[]>;
  updatedAt: string;
};

type PublicCharacterInfoItem = {
  id: string;
  text: string;
  updatedAt: string;
  source: "draft" | "ai" | "player_correction";
};

export type PublicLivePlayerSummaryProjection = {
  id: string;
  publicId: string;
  dailyGameId: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  characterImage?: PublicCharacterImage;
  choice?: "YES" | "NO";
  turnCount: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function toPublicLivePlayerProjection(
  source: any,
): PublicLivePlayerProjection {
  const transcript = buildPublicLiveTranscript(source);
  const lastActivityAt = getLastActivityAt(transcript);

  return {
    id: source.id,
    publicId: toPublicLivePlayerId(source.id),
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    timeZone: source.timeZone,
    ...(source.characterImage
      ? { characterImage: toPublicCharacterImage(source.characterImage) }
      : {}),
    ...(source.characterInfo
      ? { characterInfo: toPublicCharacterInfo(source.characterInfo) }
      : {}),
    ...(source.firstDecision?.choice
      ? { choice: source.firstDecision.choice }
      : {}),
    transcript,
    turnCount: transcript.length,
    ...(lastActivityAt ? { lastActivityAt } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toPublicCharacterInfo(source: any): PublicCharacterInfo | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  const sectionsSource =
    source.sections && typeof source.sections === "object"
      ? source.sections
      : {};
  const sections: Record<string, PublicCharacterInfoItem[]> = {};

  for (const [section, items] of Object.entries(sectionsSource)) {
    if (!Array.isArray(items)) {
      continue;
    }

    const publicItems = items
      .map((item) => toPublicCharacterInfoItem(item))
      .filter((item): item is PublicCharacterInfoItem => Boolean(item));

    if (publicItems.length > 0) {
      sections[section] = publicItems;
    }
  }

  return {
    sections,
    updatedAt:
      typeof source.updatedAt === "string"
        ? source.updatedAt
        : new Date().toISOString(),
  };
}

function toPublicCharacterInfoItem(
  source: any,
): PublicCharacterInfoItem | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  if (
    typeof source.id !== "string" ||
    typeof source.text !== "string" ||
    typeof source.updatedAt !== "string" ||
    !isPublicCharacterInfoSource(source.source)
  ) {
    return undefined;
  }

  return {
    id: source.id,
    text: source.text,
    updatedAt: source.updatedAt,
    source: source.source,
  };
}

function isPublicCharacterInfoSource(
  value: unknown,
): value is PublicCharacterInfoItem["source"] {
  return value === "draft" || value === "ai" || value === "player_correction";
}

export function toPublicLivePlayerSummaryProjection(
  source: any,
): PublicLivePlayerSummaryProjection {
  const transcript = buildPublicLiveTranscript(source);
  const lastActivityAt = getLastActivityAt(transcript);

  return {
    id: source.id,
    publicId: toPublicLivePlayerId(source.id),
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    ...(source.characterImage
      ? { characterImage: toPublicCharacterImage(source.characterImage) }
      : {}),
    ...(source.firstDecision?.choice
      ? { choice: source.firstDecision.choice }
      : {}),
    turnCount: transcript.length,
    ...(lastActivityAt ? { lastActivityAt } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toPublicCharacterImage(source: any): PublicCharacterImage | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  if (
    typeof source.url !== "string" ||
    typeof source.bucket !== "string" ||
    typeof source.objectKey !== "string" ||
    source.contentType !== "image/webp" ||
    typeof source.sizeBytes !== "number" ||
    typeof source.uploadedAt !== "string"
  ) {
    return undefined;
  }

  return {
    url: source.url,
    bucket: source.bucket,
    objectKey: source.objectKey,
    contentType: source.contentType,
    sizeBytes: source.sizeBytes,
    uploadedAt: source.uploadedAt,
  };
}

export function toPublicLivePlayerId(playerId: string): string {
  return encodeUrlSafeBase64(playerId);
}

export function fromPublicLivePlayerId(publicId: string): string | null {
  return decodeUrlSafeBase64(publicId);
}

function encodeUrlSafeBase64(value: string): string {
  return value.replaceAll("~", "~~").replaceAll(":", "~c");
}

function decodeUrlSafeBase64(value: string): string | null {
  if (value.includes("%") || value.includes(":")) {
    return null;
  }

  return value.replaceAll("~c", ":").replaceAll("~~", "~");
}

export function buildPublicLiveTranscript(
  source: any,
): PublicLiveTranscriptEntry[] {
  const entries: PublicLiveTranscriptEntry[] = [];
  const publicTurnImages: PublicPlayerTurnImage[] = (source.turnImages ?? [])
    .map((image: any) => toPublicPlayerTurnImage(image))
    .filter(
      (image: PublicPlayerTurnImage | undefined): image is PublicPlayerTurnImage =>
        Boolean(image),
    );
  const imagesByTurnId = new Map<string, PublicPlayerTurnImage>(
    publicTurnImages.map((image) => [image.sourceTurnId, image]),
  );

  if (source.openingResponse && source.openingResponseSubmittedAt) {
    entries.push({
      id: `${source.id}:opening-response`,
      at: source.openingResponseSubmittedAt,
      label: "Opening",
      title: "Before we begin",
      playerText: source.openingResponse,
    });
  }

  if (
    source.openingSceneContext?.answerText &&
    source.openingSceneContext.answeredAt
  ) {
    entries.push({
      id: `${source.id}:opening-context`,
      at: source.openingSceneContext.answeredAt,
      label: "Opening context",
      title: source.openingSceneContext.promptText,
      playerText: source.openingSceneContext.answerText,
    });
  }

  if (source.firstMoveReveal) {
    entries.push({
      id: source.firstMoveReveal.id,
      at: source.firstMoveReveal.generatedAt,
      label: "Reveal",
      title: source.firstMoveReveal.revealCopy.question,
      gameText: [
        ...source.firstMoveReveal.sceneIntro,
        source.firstMoveReveal.revealCopy.availability,
        source.firstMoveReveal.revealCopy.promise,
      ].join("\n\n"),
    });
  }

  if (source.firstDecision) {
    entries.push({
      id: source.firstDecision.id,
      at: source.firstDecision.submittedAt,
      label: "Decision",
      title:
        source.firstDecision.consequenceTitle ||
        `${source.firstDecision.choice} recorded`,
      playerText: source.firstDecision.choice,
      narratorText: source.firstDecision.consequenceBody,
    });
  }

  for (const response of source.firstRevealTextResponses ?? []) {
    entries.push({
      id: response.id,
      at: response.submittedAt,
      label: "Voice response",
      title: response.classification,
      playerText: response.inputText,
      narratorText: response.interruptionText ?? response.dayEndText,
    });
  }

  for (const turn of source.firstPostChoiceTurns ?? []) {
    entries.push({
      id: `${source.id}:post-choice:${turn.id}`,
      at: turn.resolvedAt,
      label: `Turn ${turn.turnNumber}`,
      title: turn.sceneTitle,
      playerText: turn.actionText,
      narratorText: turn.responseText,
      ...(imagesByTurnId.get(turn.id)
        ? { turnImage: imagesByTurnId.get(turn.id) }
        : {}),
    });
  }

  for (const turn of source.firstConnectedPath?.turns ?? []) {
    entries.push({
      id: `${source.id}:connected:${turn.id}`,
      at: turn.resolvedAt,
      label: `Connected path ${turn.turnNumber}`,
      title: turn.sceneTitle ?? "Connected path",
      playerText: turn.actionText,
      narratorText: turn.responseText,
      ...(imagesByTurnId.get(turn.id)
        ? { turnImage: imagesByTurnId.get(turn.id) }
        : {}),
    });
  }

  for (const turn of source.firstConnectedPath?.orbDecisionTurns ?? []) {
    entries.push({
      id: `${source.id}:orb:${turn.id}`,
      at: turn.resolvedAt,
      label: `Orb ${turn.turnNumber}`,
      title: turn.sceneTitle ?? "Orb decision",
      playerText: turn.actionText,
      narratorText: turn.responseText,
      ...(imagesByTurnId.get(turn.id)
        ? { turnImage: imagesByTurnId.get(turn.id) }
        : {}),
    });
  }

  for (const turn of source.firstConnectedPath?.connectedAsiTurns ?? []) {
    entries.push({
      id: `${source.id}:asi:${turn.id}`,
      at: turn.resolvedAt,
      label: `ASI ${turn.turnNumber}`,
      title: turn.sceneTitle ?? "Connected ASI",
      playerText: turn.actionText,
      narratorText: turn.responseText,
      ...(imagesByTurnId.get(turn.id)
        ? { turnImage: imagesByTurnId.get(turn.id) }
        : {}),
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

function getLastActivityAt(entries: PublicLiveTranscriptEntry[]) {
  return entries.map((entry) => entry.at).sort().at(-1);
}

function toPublicPlayerTurnImage(source: any): PublicPlayerTurnImage | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  if (
    typeof source.id !== "string" ||
    typeof source.dailyGameId !== "string" ||
    typeof source.playerId !== "string" ||
    typeof source.sourceTurnId !== "string" ||
    !isPlayerTurnImageKind(source.sourceTurnKind) ||
    !isPlayerTurnImageStatus(source.status) ||
    typeof source.createdAt !== "string" ||
    typeof source.updatedAt !== "string"
  ) {
    return undefined;
  }

  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    playerId: source.playerId,
    sourceTurnId: source.sourceTurnId,
    sourceTurnKind: source.sourceTurnKind,
    status: source.status,
    ...(typeof source.imageModel === "string"
      ? { imageModel: source.imageModel }
      : {}),
    ...(source.quality === "low" ? { quality: source.quality } : {}),
    ...(source.size === "1024x1024" ? { size: source.size } : {}),
    ...(typeof source.contentType === "string"
      ? { contentType: source.contentType }
      : {}),
    ...(typeof source.errorMessage === "string"
      ? { errorMessage: source.errorMessage }
      : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    ...(typeof source.generatedAt === "string"
      ? { generatedAt: source.generatedAt }
      : {}),
  };
}

function isPlayerTurnImageKind(
  value: unknown,
): value is PublicPlayerTurnImage["sourceTurnKind"] {
  return (
    value === "post_choice_turn" ||
    value === "connected_path_turn" ||
    value === "orb_decision_turn" ||
    value === "connected_asi_turn"
  );
}

function isPlayerTurnImageStatus(
  value: unknown,
): value is PublicPlayerTurnImage["status"] {
  return (
    value === "pending" ||
    value === "generating" ||
    value === "ready" ||
    value === "error"
  );
}
