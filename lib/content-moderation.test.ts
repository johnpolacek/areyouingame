import { fetchMutation } from "convex/nextjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  decideModerationAction,
  moderateImageUploadOrThrow,
  moderateTextOrThrow,
  ModerationBlockedError,
} from "./content-moderation";

vi.mock("convex/nextjs", () => ({
  fetchMutation: vi.fn(),
}));

vi.mock("convex/server", () => ({
  makeFunctionReference: vi.fn((name: string) => name),
}));

describe("content moderation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AREYOUIN_BACKEND_SECRET = "test-secret";
    process.env.OPENAI_API_KEY = "test-openai-key";
  });

  it("allows clean text and records the moderation event", async () => {
    mockModerationResponse({
      categories: { harassment: false },
      category_scores: { harassment: 0.001 },
      flagged: false,
    });
    vi.mocked(fetchMutation).mockResolvedValue(null);

    const event = await moderateTextOrThrow({
      clerkUserId: "user_123",
      dailyGameId: "2026-05-02",
      playerId: "player-1",
      source: "opening_response",
      text: "I am sitting in my kitchen watching the rain.",
    });

    expect(event.decision).toBe("allow");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/moderations",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-openai-key",
        }),
      }),
    );
    expect(fetchMutation).toHaveBeenCalledWith(
      "playerStore:recordModerationEvent",
      expect.objectContaining({
        backendSecret: "test-secret",
        event: expect.objectContaining({
          decision: "allow",
          source: "opening_response",
          textHash: expect.any(String),
        }),
      }),
    );
  });

  it("blocks hard category text", async () => {
    mockModerationResponse({
      categories: { "self-harm/instructions": true },
      category_scores: { "self-harm/instructions": 0.99 },
      flagged: true,
    });
    vi.mocked(fetchMutation).mockResolvedValue(null);

    await expect(
      moderateTextOrThrow({
        source: "post_choice_action",
        text: "unsafe",
      }),
    ).rejects.toBeInstanceOf(ModerationBlockedError);
  });

  it("records soft text flags as review without blocking gameplay", async () => {
    mockModerationResponse({
      categories: { violence: true },
      category_scores: { violence: 0.86 },
      flagged: true,
    });
    vi.mocked(fetchMutation).mockResolvedValue(null);

    const event = await moderateTextOrThrow({
      source: "connected_path_action",
      text: "I run from the crowd after hearing glass break.",
    });

    expect(event.decision).toBe("review");
  });

  it("blocks flagged direct image uploads", async () => {
    mockModerationResponse({
      categories: { violence: true },
      category_scores: { violence: 0.86 },
      flagged: true,
    });
    vi.mocked(fetchMutation).mockResolvedValue(null);

    await expect(
      moderateImageUploadOrThrow({
        bytes: new Uint8Array([1, 2, 3]),
        contentType: "image/webp",
        source: "character_image_upload",
      }),
    ).rejects.toBeInstanceOf(ModerationBlockedError);
  });

  it("keeps policy decisions deterministic", () => {
    expect(
      decideModerationAction({
        categories: [{ category: "violence", flagged: true, score: 0.9 }],
        flagged: true,
        inputType: "text",
      }),
    ).toBe("review");
    expect(
      decideModerationAction({
        categories: [
          { category: "violence/graphic", flagged: true, score: 0.9 },
        ],
        flagged: true,
        inputType: "text",
      }),
    ).toBe("block");
    expect(
      decideModerationAction({
        categories: [{ category: "violence", flagged: true, score: 0.9 }],
        flagged: true,
        inputType: "image",
      }),
    ).toBe("block");
  });
});

function mockModerationResponse(result: {
  flagged: boolean;
  categories: Record<string, boolean>;
  category_scores: Record<string, number>;
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "modr-test",
        model: "omni-moderation-latest",
        results: [result],
      }),
    }),
  );
}
