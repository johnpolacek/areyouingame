import type { DailyPlayer, PlayerDraftInput } from "./player-store";

export const CHARACTER_INFO_SECTION_KEYS = [
  "currentSituation",
  "relationships",
  "resources",
  "constraints",
  "goals",
  "knowledge",
  "openThreads",
  "recentChanges",
] as const;

export type CharacterInfoSectionKey = (typeof CHARACTER_INFO_SECTION_KEYS)[number];
export type CharacterInfoSource = "draft" | "ai" | "player_correction";
export type CharacterInfoUpdateOperation = "add" | "replace" | "remove";

export type CharacterInfoItem = {
  id: string;
  text: string;
  updatedAt: string;
  source: CharacterInfoSource;
  sourceTurnId?: string;
};

export type CharacterInfoCorrection = {
  id: string;
  section: CharacterInfoSectionKey;
  itemId: string;
  previousText?: string;
  text: string;
  updatedAt: string;
};

export type CharacterInfo = {
  sections: Partial<Record<CharacterInfoSectionKey, CharacterInfoItem[]>>;
  corrections?: CharacterInfoCorrection[];
  updatedAt: string;
};

export type CharacterInfoUpdate = {
  section?: unknown;
  operation?: unknown;
  itemId?: unknown;
  targetText?: unknown;
  text?: unknown;
};

export type CharacterInfoCorrectionInput = {
  section: CharacterInfoSectionKey;
  itemId?: string;
  text: string;
};

const MAX_ITEMS_PER_SECTION = 8;
const MAX_CORRECTIONS = 20;
const MAX_ITEM_TEXT_LENGTH = 180;
const HIDDEN_INTERNAL_LABELS =
  /\b(pre_delivery|package_available|orb_revealed|not_arrived|orb_delivered|orb_accepted|orb_lost|connected_asi_started|connectedDeliveryStatus|connectedPackageStatus|connectedOrbStatus|orbLifecycle)\b/i;
const CONNECTED_REVEAL_TERMS =
  /\b(drone|drones|package|packages|orb|orbs|delivery|delivered|box|boxes|parcel|parcels)\b/i;

export function createInitialCharacterInfo({
  draft,
  now,
}: {
  draft: PlayerDraftInput;
  now: string;
}): CharacterInfo {
  const bioContext = sanitizeCharacterInfoText(draft.bio);

  return normalizeCharacterInfo({
    sections: {
      currentSituation: bioContext
        ? [
            {
              id: "draft-bio",
              text: bioContext,
              updatedAt: now,
              source: "draft",
            },
          ]
        : [],
    },
    updatedAt: now,
  });
}

export function normalizeCharacterInfo(value: unknown): CharacterInfo {
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const sectionsSource =
    source.sections &&
    typeof source.sections === "object" &&
    !Array.isArray(source.sections)
      ? (source.sections as Record<string, unknown>)
      : {};
  const sections: CharacterInfo["sections"] = {};

  for (const section of CHARACTER_INFO_SECTION_KEYS) {
    const items = Array.isArray(sectionsSource[section])
      ? sectionsSource[section]
      : [];
    const normalizedItems = items
      .map((item, index) => normalizeCharacterInfoItem(item, section, index))
      .filter((item): item is CharacterInfoItem => Boolean(item))
      .slice(0, MAX_ITEMS_PER_SECTION);

    if (normalizedItems.length > 0) {
      sections[section] = normalizedItems;
    }
  }

  const corrections = Array.isArray(source.corrections)
    ? source.corrections
        .map(normalizeCorrection)
        .filter((correction): correction is CharacterInfoCorrection =>
          Boolean(correction),
        )
        .slice(-MAX_CORRECTIONS)
    : undefined;

  return {
    sections,
    ...(corrections && corrections.length > 0 ? { corrections } : {}),
    updatedAt: readString(source.updatedAt, new Date().toISOString()),
  };
}

export function applyCharacterInfoUpdates({
  characterInfo,
  now,
  sourceTurnId,
  updates,
}: {
  characterInfo: CharacterInfo | undefined;
  now: string;
  sourceTurnId: string;
  updates: unknown;
}): CharacterInfo | undefined {
  const normalizedUpdates = normalizeCharacterInfoUpdates(updates);

  if (normalizedUpdates.length === 0) {
    return characterInfo ? normalizeCharacterInfo(characterInfo) : undefined;
  }

  const next = normalizeCharacterInfo(
    characterInfo ?? { sections: {}, updatedAt: now },
  );

  for (const update of normalizedUpdates) {
    const items = [...(next.sections[update.section] ?? [])];

    if (update.operation === "add") {
      const updateText = update.text;

      if (!updateText || items.some((item) => sameText(item.text, updateText))) {
        next.sections[update.section] = items;
        continue;
      }
      items.push({
        id: createCharacterInfoItemId(update.section, sourceTurnId, items.length),
        text: updateText,
        updatedAt: now,
        source: "ai",
        sourceTurnId,
      });
      next.sections[update.section] = items.slice(-MAX_ITEMS_PER_SECTION);
      continue;
    }

    const targetIndex = findTargetIndex(items, update);

    if (targetIndex === -1) {
      next.sections[update.section] = items;
      continue;
    }

    if (update.operation === "remove") {
      items.splice(targetIndex, 1);
      next.sections[update.section] = items;
      continue;
    }

    if (update.text) {
      items[targetIndex] = {
        ...items[targetIndex],
        text: update.text,
        updatedAt: now,
        source: "ai",
        sourceTurnId,
      };
    }
    next.sections[update.section] = items;
  }

  next.updatedAt = now;
  return next;
}

export function applyCharacterInfoCorrection({
  characterInfo,
  correction,
  now,
}: {
  characterInfo: CharacterInfo | undefined;
  correction: CharacterInfoCorrectionInput;
  now: string;
}): CharacterInfo {
  const text = sanitizeCharacterInfoText(correction.text);

  if (!text) {
    throw new Error("Correction text is required.");
  }

  const next = normalizeCharacterInfo(
    characterInfo ?? { sections: {}, updatedAt: now },
  );
  const items = [...(next.sections[correction.section] ?? [])];
  const existingIndex = correction.itemId
    ? items.findIndex((item) => item.id === correction.itemId)
    : -1;
  const previousItem = existingIndex >= 0 ? items[existingIndex] : undefined;
  const itemId =
    previousItem?.id ??
    createCharacterInfoItemId(correction.section, `correction-${now}`, items.length);

  if (previousItem) {
    items[existingIndex] = {
      ...previousItem,
      text,
      updatedAt: now,
      source: "player_correction",
    };
  } else {
    items.push({
      id: itemId,
      text,
      updatedAt: now,
      source: "player_correction",
    });
  }

  next.sections[correction.section] = items.slice(-MAX_ITEMS_PER_SECTION);
  next.corrections = [
    ...(next.corrections ?? []),
    {
      id: `correction:${now}:${itemId}`,
      section: correction.section,
      itemId,
      ...(previousItem ? { previousText: previousItem.text } : {}),
      text,
      updatedAt: now,
    },
  ].slice(-MAX_CORRECTIONS);
  next.updatedAt = now;

  return next;
}

export function buildCharacterInfoPromptContext({
  characterInfo,
  hideConnectedRevealTerms = false,
}: {
  characterInfo?: CharacterInfo;
  hideConnectedRevealTerms?: boolean;
}): Record<string, string[]> | null {
  if (!characterInfo) {
    return null;
  }

  const normalized = normalizeCharacterInfo(characterInfo);
  const context: Record<string, string[]> = {};

  for (const section of CHARACTER_INFO_SECTION_KEYS) {
    const items = (normalized.sections[section] ?? [])
      .map((item) => item.text)
      .filter(
        (text) => !hideConnectedRevealTerms || !CONNECTED_REVEAL_TERMS.test(text),
      );

    if (items.length > 0) {
      context[section] = items;
    }
  }

  return Object.keys(context).length > 0 ? context : null;
}

export function buildPlayerCharacterInfoPromptContext({
  player,
  hideConnectedRevealTerms = false,
}: {
  player: DailyPlayer;
  hideConnectedRevealTerms?: boolean;
}): Record<string, string[]> | null {
  return buildCharacterInfoPromptContext({
    characterInfo: player.characterInfo,
    hideConnectedRevealTerms,
  });
}

export function buildCharacterInfoCorrectionPromptContext({
  characterInfo,
}: {
  characterInfo?: CharacterInfo;
}): string[] {
  return (characterInfo?.corrections ?? [])
    .slice(-5)
    .map((correction) => `${correction.section}: ${correction.text}`);
}

export function normalizeCharacterInfoUpdates(updates: unknown): Array<{
  section: CharacterInfoSectionKey;
  operation: CharacterInfoUpdateOperation;
  itemId?: string;
  targetText?: string;
  text?: string;
}> {
  if (!Array.isArray(updates)) {
    return [];
  }

  return updates
    .map((update) => {
      if (!update || typeof update !== "object" || Array.isArray(update)) {
        return null;
      }

      const source = update as CharacterInfoUpdate;
      const section = readSection(source.section);
      const operation = readOperation(source.operation);
      const text = sanitizeCharacterInfoText(source.text);
      const targetText = sanitizeCharacterInfoText(source.targetText);
      const itemId = readOptionalString(source.itemId, 120);

      if (!section || !operation) {
        return null;
      }

      if ((operation === "add" || operation === "replace") && !text) {
        return null;
      }

      return {
        section,
        operation,
        ...(itemId ? { itemId } : {}),
        ...(targetText ? { targetText } : {}),
        ...(text ? { text } : {}),
      };
    })
    .filter((update): update is NonNullable<typeof update> => Boolean(update))
    .slice(0, 12);
}

export function sanitizeCharacterInfoText(value: unknown): string {
  const text = readOptionalString(value, MAX_ITEM_TEXT_LENGTH)
    .replace(/\s+/g, " ")
    .trim();

  if (!text || HIDDEN_INTERNAL_LABELS.test(text)) {
    return "";
  }

  return text;
}

function normalizeCharacterInfoItem(
  value: unknown,
  section: CharacterInfoSectionKey,
  index: number,
): CharacterInfoItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const text = sanitizeCharacterInfoText(source.text);

  if (!text) {
    return null;
  }

  return {
    id: readOptionalString(source.id, 120) || `${section}-${index}`,
    text,
    updatedAt: readString(source.updatedAt, new Date().toISOString()),
    source: readSource(source.source),
    ...(readOptionalString(source.sourceTurnId, 160)
      ? { sourceTurnId: readOptionalString(source.sourceTurnId, 160) }
      : {}),
  };
}

function normalizeCorrection(value: unknown): CharacterInfoCorrection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const section = readSection(source.section);
  const itemId = readOptionalString(source.itemId, 120);
  const text = sanitizeCharacterInfoText(source.text);

  if (!section || !itemId || !text) {
    return null;
  }

  return {
    id: readOptionalString(source.id, 160) || `correction:${itemId}`,
    section,
    itemId,
    ...(sanitizeCharacterInfoText(source.previousText)
      ? { previousText: sanitizeCharacterInfoText(source.previousText) }
      : {}),
    text,
    updatedAt: readString(source.updatedAt, new Date().toISOString()),
  };
}

function findTargetIndex(
  items: CharacterInfoItem[],
  update: { itemId?: string; targetText?: string },
): number {
  if (update.itemId) {
    const byId = items.findIndex((item) => item.id === update.itemId);

    if (byId >= 0) {
      return byId;
    }
  }

  if (update.targetText) {
    return items.findIndex((item) => sameText(item.text, update.targetText!));
  }

  return items.length - 1;
}

function createCharacterInfoItemId(
  section: CharacterInfoSectionKey,
  sourceTurnId: string,
  index: number,
): string {
  return `${section}:${sourceTurnId}:${index}`
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "-")
    .slice(0, 140);
}

function sameText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function readSection(value: unknown): CharacterInfoSectionKey | null {
  return typeof value === "string" &&
    CHARACTER_INFO_SECTION_KEYS.includes(value as CharacterInfoSectionKey)
    ? (value as CharacterInfoSectionKey)
    : null;
}

function readOperation(value: unknown): CharacterInfoUpdateOperation | null {
  return value === "add" || value === "replace" || value === "remove"
    ? value
    : null;
}

function readSource(value: unknown): CharacterInfoSource {
  return value === "draft" || value === "ai" || value === "player_correction"
    ? value
    : "ai";
}

function readString(value: unknown, fallback: string): string {
  return readOptionalString(value, 160) || fallback;
}

function readOptionalString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
