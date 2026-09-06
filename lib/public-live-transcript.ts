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

export type PublicCharacterImage = {
  url: string;
  contentType: "image/webp" | "image/png" | "image/jpeg";
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
    id: publicRecordId(source),
    publicId: publicRecordId(source),
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    timeZone: source.timeZone,
    ...(source.characterImage
      ? {
          characterImage: toPublicCharacterImage(
            source.characterImage,
            publicRecordId(source),
          ),
        }
      : {}),
    ...(source.characterInfo
      ? {
          characterInfo: toPublicCharacterInfo(
            source.characterInfo,
            publicRecordId(source),
          ),
        }
      : {}),
    ...(source.firstDecision?.choice
      ? { choice: source.firstDecision.choice }
      : {}),
    transcript,
    turnCount: fullTranscriptCount(source, transcript.length),
    ...(lastActivityAt ? { lastActivityAt } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toPublicCharacterInfo(
  source: any,
  playerId: string,
): PublicCharacterInfo | undefined {
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
      .map((item, index) =>
        toPublicCharacterInfoItem(
          item,
          `${playerId}:info:${Object.keys(sectionsSource).indexOf(section)}:${index}`,
        ),
      )
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
  publicId: string,
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
    id: publicId,
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
    id: publicRecordId(source),
    publicId: publicRecordId(source),
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    ...(source.characterImage
      ? {
          characterImage: toPublicCharacterImage(
            source.characterImage,
            publicRecordId(source),
          ),
        }
      : {}),
    ...(source.firstDecision?.choice
      ? { choice: source.firstDecision.choice }
      : {}),
    turnCount: fullTranscriptCount(source, transcript.length),
    ...(lastActivityAt ? { lastActivityAt } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

export function toPublicCharacterImage(
  source: any,
  publicId: string,
): PublicCharacterImage | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  if (
    typeof source.url !== "string" ||
    typeof source.bucket !== "string" ||
    typeof source.objectKey !== "string" ||
    !isPublicCharacterImageContentType(source.contentType) ||
    typeof source.sizeBytes !== "number" ||
    typeof source.uploadedAt !== "string"
  ) {
    return undefined;
  }

  return {
    url: `/api/public-character-images/${encodeURIComponent(publicId)}`,
    contentType: source.contentType,
    sizeBytes: source.sizeBytes,
    uploadedAt: source.uploadedAt,
  };
}

function isPublicCharacterImageContentType(
  contentType: unknown,
): contentType is PublicCharacterImage["contentType"] {
  return (
    contentType === "image/webp" ||
    contentType === "image/png" ||
    contentType === "image/jpeg"
  );
}

// Convex allocates these IDs independently of account and application IDs.
// Never fall back to source.id: legacy application IDs contain Clerk IDs.
export function publicRecordId(source: { _id?: string }): string {
  if (!source._id)
    throw new Error("Public projections require a persisted record ID.");
  return source._id;
}

export function buildPublicLiveTranscript(
  source: any,
): PublicLiveTranscriptEntry[] {
  const entries: PublicLiveTranscriptEntry[] = [];
  const playerId = publicRecordId(source);
  const imagesByTurnId = new Map<string, PublicPlayerTurnImage>();
  for (const image of source.turnImages ?? []) {
    const projected = toPublicPlayerTurnImage(image, playerId);
    if (projected) imagesByTurnId.set(image.sourceTurnId, projected);
  }

  if (source.openingResponse && source.openingResponseSubmittedAt) {
    entries.push({
      id: `${playerId}:opening-response`,
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
      id: `${playerId}:opening-context`,
      at: source.openingSceneContext.answeredAt,
      label: "Opening context",
      title: source.openingSceneContext.promptText,
      playerText: source.openingSceneContext.answerText,
    });
  }

  if (source.firstMoveReveal) {
    entries.push({
      id: `${playerId}:reveal`,
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
      id: `${playerId}:decision`,
      at: source.firstDecision.submittedAt,
      label: "Decision",
      title:
        source.firstDecision.consequenceTitle ||
        `${source.firstDecision.choice} recorded`,
      playerText: source.firstDecision.choice,
      narratorText: source.firstDecision.consequenceBody,
    });
  }

  for (const [index, response] of (
    source.firstRevealTextResponses ?? []
  ).entries()) {
    entries.push({
      id: `${playerId}:voice:${(Number(response.id?.split(":").at(-1)) || index + 1) - 1}`,
      at: response.submittedAt,
      label: "Voice response",
      title: response.classification,
      playerText: response.inputText,
      narratorText: response.interruptionText ?? response.dayEndText,
    });
  }

  for (const [index, turn] of (source.firstPostChoiceTurns ?? []).entries()) {
    entries.push({
      id: `${playerId}:post-choice:${(turn.turnNumber ?? index + 1) - 1}`,
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

  for (const [index, turn] of (
    source.firstConnectedPath?.turns ?? []
  ).entries()) {
    entries.push({
      id: `${playerId}:connected:${(turn.turnNumber ?? index + 1) - 1}`,
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

  for (const [index, turn] of (
    source.firstConnectedPath?.orbDecisionTurns ?? []
  ).entries()) {
    entries.push({
      id: `${playerId}:orb:${(turn.turnNumber ?? index + 1) - 1}`,
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

  for (const [index, turn] of (
    source.firstConnectedPath?.connectedAsiTurns ?? []
  ).entries()) {
    entries.push({
      id: `${playerId}:asi:${(turn.turnNumber ?? index + 1) - 1}`,
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
  return entries
    .map((entry) => entry.at)
    .sort()
    .at(-1);
}

export function toPublicPlayerTurnImage(
  source: any,
  playerId: string,
): PublicPlayerTurnImage | undefined {
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
    id: publicRecordId(source),
    dailyGameId: source.dailyGameId,
    playerId,
    sourceTurnId: publicRecordId(source),
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
    ...(source.status === "error"
      ? { errorMessage: "Image generation failed." }
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

function fullTranscriptCount(source: any, recentCount: number): number {
  const histories = [source.firstPostChoiceTurns, source.firstConnectedPath?.turns,
    source.firstConnectedPath?.orbDecisionTurns, source.firstConnectedPath?.connectedAsiTurns];
  let count = recentCount;
  for (const turns of histories) {
    if (turns?.length) count += Math.max(0, (turns.at(-1).turnNumber ?? turns.length) - turns.length);
  }
  const responses = source.firstRevealTextResponses;
  if (responses?.length) count += Math.max(0, (Number(responses.at(-1).id.split(":").at(-1)) || responses.length) - responses.length);
  return count;
}
