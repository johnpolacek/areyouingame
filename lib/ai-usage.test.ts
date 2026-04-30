import { generateText } from "ai";
import { fetchMutation } from "convex/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  estimateOpenAiCostUsd,
  trackedGenerateText,
} from "./ai-usage";

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn((model: string) => ({ model })),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
}));

vi.mock("convex/server", () => ({
  makeFunctionReference: vi.fn((name: string) => name),
}));

const usage = {
  inputTokens: 1000,
  inputTokenDetails: {
    noCacheTokens: 900,
    cacheReadTokens: 100,
    cacheWriteTokens: undefined,
  },
  outputTokens: 200,
  outputTokenDetails: {
    textTokens: 180,
    reasoningTokens: 20,
  },
  totalTokens: 1200,
  raw: undefined,
};

describe("estimateOpenAiCostUsd", () => {
  it("prices normal input, cached input, and output tokens", () => {
    expect(
      estimateOpenAiCostUsd({
        cachedInputTokens: 100,
        inputTokens: 1000,
        model: "gpt-5.4-mini",
        outputTokens: 200,
      }),
    ).toBe(0.001583);
  });

  it("falls back to zero-cost pricing for unknown models", () => {
    expect(
      estimateOpenAiCostUsd({
        cachedInputTokens: 0,
        inputTokens: 1000,
        model: "unknown-model",
        outputTokens: 1000,
      }),
    ).toBe(0);
  });
});

describe("trackedGenerateText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AREYOUIN_BACKEND_SECRET = "test-secret";
  });

  it("records usage for successful generations", async () => {
    vi.mocked(generateText).mockResolvedValue({
      text: "ok",
      totalUsage: usage,
      usage,
    } as Awaited<ReturnType<typeof generateText>>);
    vi.mocked(fetchMutation).mockResolvedValue(null);

    await expect(
      trackedGenerateText({
        model: "gpt-5.4-mini",
        operation: "yes_no_classifier",
        system: "Classify.",
        prompt: "YES",
        dailyGameId: "game-1",
        playerId: "player-1",
        clerkUserId: "user-1",
      }),
    ).resolves.toMatchObject({ text: "ok" });

    expect(fetchMutation).toHaveBeenCalledWith(
      "playerStore:recordAiUsageEvent",
      expect.objectContaining({
        backendSecret: "test-secret",
        event: expect.objectContaining({
          cachedInputTokens: 100,
          clerkUserId: "user-1",
          dailyGameId: "game-1",
          estimatedCostUsd: 0.001583,
          inputTokens: 1000,
          model: "gpt-5.4-mini",
          operation: "yes_no_classifier",
          outputTokens: 200,
          playerId: "player-1",
          reasoningTokens: 20,
          status: "success",
          totalTokens: 1200,
        }),
      }),
    );
  });

  it("records failed generations and rethrows the original error", async () => {
    const error = new Error("provider down");
    vi.mocked(generateText).mockRejectedValue(error);
    vi.mocked(fetchMutation).mockResolvedValue(null);

    await expect(
      trackedGenerateText({
        model: "gpt-5.4",
        operation: "first_move_reveal",
        system: "Narrate.",
        prompt: "Begin",
      }),
    ).rejects.toThrow(error);

    expect(fetchMutation).toHaveBeenCalledWith(
      "playerStore:recordAiUsageEvent",
      expect.objectContaining({
        event: expect.objectContaining({
          errorType: "Error",
          estimatedCostUsd: 0,
          status: "error",
          totalTokens: 0,
        }),
      }),
    );
  });
});
