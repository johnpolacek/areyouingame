import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicActivityEvents,
  getPublicLivePlayer,
  getPublicPlayerTurnImage,
  getPublicCharacterImageStorage,
} from "../convex/playerStore";
import {
  toPublicLivePlayerProjection,
  toPublicLivePlayerSummaryProjection,
} from "./public-live-transcript";

const account = "user_ACCOUNT_SECRET_123";
const at = "2026-05-02T09:00:00.000Z";
const privateId = `game-1:${account}`;
const image = {
  _id: "opaque-image-a",
  id: `${privateId}:image`,
  playerId: privateId,
  dailyGameId: "game-1",
  sourceTurnId: `${privateId}:turn`,
  sourceTurnKind: "post_choice_turn",
  status: "ready",
  bucket: "private-bucket",
  objectKey: `images/${account}/turn.png`,
  prompt: `Private prompt ${account}`,
  errorMessage: `Storage error for ${account}`,
  contentType: "image/png",
  createdAt: at,
  updatedAt: at,
};
const turn = {
  id: image.sourceTurnId,
  turnNumber: 1,
  resolvedAt: at,
  sceneTitle: "The street",
  actionText: "Look outside",
  responseText: "It is quiet",
};
const player = {
  _id: "opaque-player-a",
  id: privateId,
  clerkUserId: account,
  dailyGameId: "game-1",
  name: "Mara",
  age: "36",
  location: "Rotterdam",
  occupation: "Scheduler",
  bio: "Works at the port",
  timeZone: "Europe/Amsterdam",
  createdAt: at,
  updatedAt: at,
  openingResponse: "At work",
  openingResponseSubmittedAt: at,
  openingSceneContext: {
    answerText: "A crane",
    answeredAt: at,
    promptText: "What is outside?",
  },
  firstMoveReveal: {
    id: `${privateId}:reveal`,
    generatedAt: at,
    sceneIntro: [],
    revealCopy: {
      question: "Are you in?",
      availability: "Now",
      promise: "Connection",
    },
  },
  firstDecision: {
    id: `${privateId}:decision`,
    submittedAt: at,
    choice: "YES",
  },
  firstRevealTextResponses: [
    {
      id: `${privateId}:voice`,
      submittedAt: at,
      inputText: "Hello",
      classification: "response",
    },
  ],
  firstPostChoiceTurns: [turn],
  firstConnectedPath: {
    turns: [turn],
    orbDecisionTurns: [turn],
    connectedAsiTurns: [turn],
  },
  turnImages: [image],
  characterImage: {
    url: `/api/character-images/${account}/a.png`,
    bucket: "private",
    objectKey: `${account}/a.png`,
    contentType: "image/png",
    sizeBytes: 10,
    uploadedAt: at,
  },
  characterInfo: {
    sections: {
      facts: [
        {
          id: `${privateId}:fact`,
          text: "Works nights",
          source: "draft",
          updatedAt: at,
        },
      ],
    },
    updatedAt: at,
  },
};
const event = {
  _id: "opaque-event-a",
  id: `${privateId}:event`,
  playerId: privateId.replaceAll(":", "~c"),
  dailyGameId: "game-1",
  createdAt: at,
  character: player,
  eventKind: "opening_response_submitted",
};

function context(events = [event]) {
  const rows: Record<string, any[]> = {
    players: [player],
    publicActivityEvents: events,
    playerTurnImages: [image],
  };
  return {
    db: {
      normalizeId: (table: string, id: string) =>
        rows[table]?.some((row) => row._id === id) ? id : null,
      get: async (id: string) =>
        Object.values(rows)
          .flat()
          .find((row) => row._id === id) ?? null,
      query: (table: string) => {
        const query = {
          withIndex: () => query,
          order: () => query,
          collect: async () => rows[table] ?? [],
          first: async () => rows[table]?.[0] ?? null,
          take: async () => rows[table] ?? [],
        };
        return query;
      },
    },
  };
}
const handler = (query: unknown) =>
  (query as { _handler: (ctx: any, args: any) => Promise<any> })._handler;

function expectNoAccount(value: unknown) {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain(account);
  expect(serialized).not.toContain(encodeURIComponent(account));
  expect(serialized).not.toContain(privateId);
}

describe("public identifier visibility boundary", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("removes account values from every transcript family, images, character facts and summaries", () => {
    const projection = toPublicLivePlayerProjection(player);
    expectNoAccount(projection);
    expectNoAccount(toPublicLivePlayerSummaryProjection(player));
    expect(projection.transcript).toHaveLength(9);
    expect(new Set(projection.transcript.map((entry) => entry.id)).size).toBe(
      9,
    );
    expect(projection).toEqual(toPublicLivePlayerProjection(player));
    expect(
      projection.transcript.find((entry) => entry.label === "Turn 1")
        ?.turnImage,
    ).toMatchObject({
      id: image._id,
      sourceTurnId: image._id,
      playerId: player._id,
    });
    expect(projection.characterImage?.url).toBe(
      `/api/public-character-images/${player._id}`,
    );
  });

  it("uses public record IDs for historical and new activity, including image URLs", async () => {
    for (const playerId of [event.playerId, privateId]) {
      const result = await handler(getPublicActivityEvents)(
        context([{ ...event, playerId }]),
        {},
      );
      expectNoAccount(result);
      expect(result[0]).toMatchObject({ id: event._id, playerId: player._id });
    }
    const orphan = await handler(getPublicActivityEvents)(
      context([{ ...event, playerId: `missing:${account}` }]),
      {},
    );
    expectNoAccount(orphan);
    expect(orphan[0]).not.toHaveProperty("playerId");
  });

  it("resolves opaque player links and rejects raw, escaped, and wrong-game account links", async () => {
    const query = handler(getPublicLivePlayer);
    expectNoAccount(
      await query(context(), { dailyGameId: "game-1", playerId: player._id }),
    );
    expect(
      await query(context(), { dailyGameId: "game-1", playerId: player._id }),
    ).not.toBeNull();
    for (const playerId of [
      privateId,
      event.playerId,
      encodeURIComponent(privateId),
    ]) {
      expect(
        await query(context(), { dailyGameId: "game-1", playerId }),
      ).toBeNull();
    }
    expect(
      await query(context(), { dailyGameId: "game-2", playerId: player._id }),
    ).toBeNull();
  });

  it("serves opaque image metadata without storage paths or prompts", async () => {
    const result = await handler(getPublicPlayerTurnImage)(context(), {
      sourceTurnId: image._id,
    });
    expectNoAccount(result);
    expect(result.sourceTurnId).toBe(image._id);
    expect(result).not.toHaveProperty("objectKey");
    expect(result).not.toHaveProperty("prompt");
    expect(
      await handler(getPublicPlayerTurnImage)(context(), {
        sourceTurnId: image.sourceTurnId,
      }),
    ).toBeNull();
  });

  it("keeps legacy image loading owner-only and storage lookup server-only", async () => {
    vi.stubEnv("AREYOUIN_BACKEND_SECRET", "test-backend-secret");
    const query = handler(getPublicPlayerTurnImage);
    const args = {
      sourceTurnId: image.sourceTurnId,
      backendSecret: "test-backend-secret",
    };
    expect(await query(context(), args)).toBeNull();
    expect(
      await query(context(), { ...args, clerkUserId: "another-account" }),
    ).toBeNull();
    expect(
      await query(context(), { ...args, clerkUserId: account }),
    ).toMatchObject({ objectKey: image.objectKey });
    expect(
      await query(context(), { ...args, sourceTurnId: image._id }),
    ).toMatchObject({ objectKey: image.objectKey });
    for (const publicId of [player._id, event._id]) {
      expect(
        await handler(getPublicCharacterImageStorage)(context(), {
          publicId,
          backendSecret: args.backendSecret,
        }),
      ).toEqual(player.characterImage);
    }
  });

  it("requires the backend secret before exposing image storage metadata", async () => {
    await expect(
      handler(getPublicPlayerTurnImage)(context(), {
        sourceTurnId: image._id,
        backendSecret: "incorrect",
      }),
    ).rejects.toThrow();
    await expect(
      handler(getPublicCharacterImageStorage)(context(), {
        publicId: player._id,
        backendSecret: "incorrect",
      }),
    ).rejects.toThrow();
  });
});
