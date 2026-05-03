import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { LanguageModelUsage } from "ai";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { DailyPlayer } from "./player-store";

export type AiUsageOperation =
  | "opening_scene_context"
  | "first_move_reveal"
  | "yes_no_classifier"
  | "deferred_interruption"
  | "first_choice_consequence_yes"
  | "first_choice_consequence_no"
  | "post_choice_turn"
  | "connected_path_turn"
  | "orb_decision_turn"
  | "connected_asi_turn"
  | "character_draft_fill"
  | "player_turn_image_prompt";

export type AiUsageStatus = "success" | "error";

export type AiUsageEvent = {
  id: string;
  provider: "openai";
  model: string;
  operation: AiUsageOperation | string;
  dailyGameId?: string;
  playerId?: string;
  clerkUserId?: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  pricingSourceUrl: string;
  pricingEffectiveDate: string;
  status: AiUsageStatus;
  errorType?: string;
  createdAt: string;
};

export type AiUsageSummary = {
  events: AiUsageEvent[];
  totals: AiUsageTotals;
  byModel: AiUsageBreakdownRow[];
  byOperation: AiUsageBreakdownRow[];
  byDay: AiUsageBreakdownRow[];
};

export type AiUsageTotals = {
  calls: number;
  errors: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
};

export type AiUsageBreakdownRow = AiUsageTotals & {
  key: string;
};

type TrackableGenerateTextOptions = {
  model: string;
  operation: AiUsageOperation;
  system: string;
  prompt: string;
  dailyGameId?: string;
  player?: Pick<DailyPlayer, "id" | "clerkUserId" | "dailyGameId">;
  playerId?: string;
  clerkUserId?: string;
};

type PriceRecord = {
  inputUsdPerMillionTokens: number;
  cachedInputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
  sourceUrl: string;
  effectiveDate: string;
};

const fallbackPricing: PriceRecord = {
  inputUsdPerMillionTokens: 0,
  cachedInputUsdPerMillionTokens: 0,
  outputUsdPerMillionTokens: 0,
  sourceUrl: "https://openai.com/api/pricing/",
  effectiveDate: "2026-04-30",
};

export const openAiPricingByModel: Record<string, PriceRecord> = {
  "gpt-5.4": {
    inputUsdPerMillionTokens: 2.5,
    cachedInputUsdPerMillionTokens: 0.25,
    outputUsdPerMillionTokens: 15,
    sourceUrl: "https://openai.com/api/pricing/",
    effectiveDate: "2026-04-30",
  },
  "gpt-5.4-mini": {
    inputUsdPerMillionTokens: 0.75,
    cachedInputUsdPerMillionTokens: 0.075,
    outputUsdPerMillionTokens: 4.5,
    sourceUrl: "https://openai.com/api/pricing/",
    effectiveDate: "2026-04-30",
  },
};

const recordAiUsageEventRef = makeFunctionReference<
  "mutation",
  {
    backendSecret: string;
    event: AiUsageEvent;
  },
  null
>("playerStore:recordAiUsageEvent");

const getAiUsageEventsForAdminRef = makeFunctionReference<
  "query",
  {
    backendSecret: string;
    limit?: number;
  },
  AiUsageEvent[]
>("playerStore:getAiUsageEventsForAdmin");

export async function trackedGenerateText(options: TrackableGenerateTextOptions) {
  try {
    const result = await generateText({
      model: openai(options.model),
      system: options.system,
      prompt: options.prompt,
    });

    await recordAiUsage({
      ...createEventBase(options, "success"),
      ...usageToBillableCounts(result.totalUsage ?? result.usage),
    });

    return result;
  } catch (error) {
    await recordAiUsage({
      ...createEventBase(options, "error"),
      ...usageToBillableCounts(undefined),
      errorType: getErrorType(error),
    });

    throw error;
  }
}

export async function getAiUsageSummaryForAdmin(
  limit = 200,
): Promise<AiUsageSummary> {
  const events = await fetchQuery(getAiUsageEventsForAdminRef, {
    backendSecret: getBackendSecret(),
    limit,
  });

  return summarizeAiUsage(events);
}

export function summarizeAiUsage(events: AiUsageEvent[]): AiUsageSummary {
  return {
    events,
    totals: summarizeTotals(events),
    byModel: summarizeBy(events, (event) => event.model),
    byOperation: summarizeBy(events, (event) => event.operation),
    byDay: summarizeBy(events, (event) => event.createdAt.slice(0, 10)),
  };
}

export function estimateOpenAiCostUsd({
  cachedInputTokens,
  inputTokens,
  model,
  outputTokens,
}: {
  cachedInputTokens: number;
  inputTokens: number;
  model: string;
  outputTokens: number;
}): number {
  const pricing = openAiPricingByModel[model] ?? fallbackPricing;
  const nonCachedInputTokens = Math.max(inputTokens - cachedInputTokens, 0);

  return roundUsd(
    (nonCachedInputTokens / 1_000_000) * pricing.inputUsdPerMillionTokens +
      (cachedInputTokens / 1_000_000) *
        pricing.cachedInputUsdPerMillionTokens +
      (outputTokens / 1_000_000) * pricing.outputUsdPerMillionTokens,
  );
}

function createEventBase(
  options: TrackableGenerateTextOptions,
  status: AiUsageStatus,
): Omit<
  AiUsageEvent,
  | "cachedInputTokens"
  | "estimatedCostUsd"
  | "inputTokens"
  | "outputTokens"
  | "reasoningTokens"
  | "totalTokens"
> {
  const pricing = openAiPricingByModel[options.model] ?? fallbackPricing;

  return {
    id: crypto.randomUUID(),
    provider: "openai",
    model: options.model,
    operation: options.operation,
    dailyGameId: options.dailyGameId ?? options.player?.dailyGameId,
    playerId: options.playerId ?? options.player?.id,
    clerkUserId: options.clerkUserId ?? options.player?.clerkUserId,
    pricingSourceUrl: pricing.sourceUrl,
    pricingEffectiveDate: pricing.effectiveDate,
    status,
    createdAt: new Date().toISOString(),
  };
}

function usageToBillableCounts(
  usage: LanguageModelUsage | undefined,
): Pick<
  AiUsageEvent,
  | "cachedInputTokens"
  | "inputTokens"
  | "outputTokens"
  | "reasoningTokens"
  | "totalTokens"
> {
  const inputTokens = readTokenCount(usage?.inputTokens);
  const cachedInputTokens = readTokenCount(
    usage?.inputTokenDetails.cacheReadTokens ?? usage?.cachedInputTokens,
  );
  const outputTokens = readTokenCount(usage?.outputTokens);
  const reasoningTokens = readTokenCount(
    usage?.outputTokenDetails.reasoningTokens ?? usage?.reasoningTokens,
  );
  const totalTokens =
    readTokenCount(usage?.totalTokens) || inputTokens + outputTokens;

  return {
    inputTokens,
    cachedInputTokens,
    outputTokens,
    reasoningTokens,
    totalTokens,
  };
}

async function recordAiUsage(
  eventWithoutCost: Omit<AiUsageEvent, "estimatedCostUsd">,
) {
  const event = {
    ...eventWithoutCost,
    estimatedCostUsd: estimateOpenAiCostUsd({
      cachedInputTokens: eventWithoutCost.cachedInputTokens,
      inputTokens: eventWithoutCost.inputTokens,
      model: eventWithoutCost.model,
      outputTokens: eventWithoutCost.outputTokens,
    }),
  };

  try {
    await fetchMutation(recordAiUsageEventRef, {
      backendSecret: getBackendSecret(),
      event,
    });
  } catch (error) {
    console.error("Unable to record AI usage event.", error);
  }
}

function summarizeBy(
  events: AiUsageEvent[],
  getKey: (event: AiUsageEvent) => string,
): AiUsageBreakdownRow[] {
  const rows = new Map<string, AiUsageEvent[]>();

  for (const event of events) {
    const key = getKey(event);
    rows.set(key, [...(rows.get(key) ?? []), event]);
  }

  return [...rows.entries()]
    .map(([key, rowEvents]) => ({
      key,
      ...summarizeTotals(rowEvents),
    }))
    .sort((left, right) => right.estimatedCostUsd - left.estimatedCostUsd);
}

function summarizeTotals(events: AiUsageEvent[]): AiUsageTotals {
  return events.reduce<AiUsageTotals>(
    (totals, event) => ({
      calls: totals.calls + 1,
      errors: totals.errors + (event.status === "error" ? 1 : 0),
      inputTokens: totals.inputTokens + event.inputTokens,
      cachedInputTokens: totals.cachedInputTokens + event.cachedInputTokens,
      outputTokens: totals.outputTokens + event.outputTokens,
      reasoningTokens: totals.reasoningTokens + event.reasoningTokens,
      totalTokens: totals.totalTokens + event.totalTokens,
      estimatedCostUsd: roundUsd(
        totals.estimatedCostUsd + event.estimatedCostUsd,
      ),
    }),
    {
      calls: 0,
      errors: 0,
      inputTokens: 0,
      cachedInputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
    },
  );
}

function readTokenCount(value: number | undefined): number {
  return Number.isFinite(value) && value ? Math.max(Math.floor(value), 0) : 0;
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function getErrorType(error: unknown): string {
  return error instanceof Error ? error.name || "Error" : "UnknownError";
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}
