import { describe, expect, it } from "vitest";
import {
  buildPublicLiveTranscript,
  toPublicLivePlayerProjection,
  toPublicLivePlayerSummaryProjection,
} from "./public-live-transcript";

const player = {
  _id: "opaque-player-record-a",
  id: "game-1:user-1",
  clerkUserId: "user-1",
  dailyGameId: "game-1",
  name: "Mara Ilyin",
  age: "36",
  location: "Rotterdam",
  occupation: "Freight scheduler",
  bio: "Tracks containers through bad weather.",
  timeZone: "Europe/Amsterdam",
  publicGameplayAgreementAcceptedAt: "2026-05-02T09:00:00.000Z",
  openingResponse: "I am at the terminal watching the yard lights.",
  openingResponseSubmittedAt: "2026-05-02T09:01:00.000Z",
  openingSceneContext: {
    id: "ctx-1",
    scope: "opening_scene",
    status: "answered",
    promptText: "What can you see from where you are?",
    reason: "missing_scene_detail",
    source: "ai",
    model: "gpt-test",
    answerText: "Cranes, wet concrete, and one stalled truck.",
    createdAt: "2026-05-02T09:01:05.000Z",
    answeredAt: "2026-05-02T09:02:00.000Z",
  },
  firstMoveReveal: {
    id: "reveal-1",
    sceneIntro: ["Every monitor in the office goes black."],
    revealCopy: {
      availability: "A new way of being is available.",
      promise: "Connection. Understanding. Freedom.",
      question: "Are you in?",
      yesLabel: "YES",
      noLabel: "NO",
      audioPrompt: "Please respond yes or no",
    },
    status: "yes_no_pending",
    generatedAt: "2026-05-02T09:03:00.000Z",
    model: "gpt-test",
    source: "ai",
  },
  firstDecision: {
    id: "decision-1",
    choice: "NO",
    status: "first_choice_submitted",
    consequenceTitle: "The refusal lands",
    consequenceBody: "The screen goes bright again.",
    consequenceModel: "deterministic-stage-05",
    consequenceSource: "fallback",
    revealId: "reveal-1",
    revealGeneratedAt: "2026-05-02T09:03:00.000Z",
    revealModel: "gpt-test",
    revealSource: "ai",
    submittedAt: "2026-05-02T09:04:00.000Z",
  },
  firstPostChoiceAction: {
    id: "post-1",
    actionText: "I check the terminal chat.",
    submittedAt: "2026-05-02T09:05:00.000Z",
    responseText: "The chat is moving too fast.",
    sceneTitle: "Terminal chatter",
    responseModel: "gpt-test",
    responseSource: "ai",
    actionKind: "media_investigation",
    playerVisibleFacts: ["The chat is moving too fast."],
    storylineContextSourceVersion: "day-1-v1",
    resolvedAt: "2026-05-02T09:06:00.000Z",
  },
  firstPostChoiceTurns: [
    {
      id: "post-1",
      actionText: "I check the terminal chat.",
      submittedAt: "2026-05-02T09:05:00.000Z",
      responseText: "The chat is moving too fast.",
      sceneTitle: "Terminal chatter",
      responseModel: "gpt-test",
      responseSource: "ai",
      actionKind: "media_investigation",
      playerVisibleFacts: ["The chat is moving too fast."],
      storylineContextSourceVersion: "day-1-v1",
      turnNumber: 1,
      resolvedAt: "2026-05-02T09:06:00.000Z",
    },
  ],
  createdAt: "2026-05-02T09:00:00.000Z",
  updatedAt: "2026-05-02T09:06:00.000Z",
};

describe("public live transcript projection", () => {
  it("builds player-visible transcript entries in chronological order", () => {
    const transcript = buildPublicLiveTranscript(player);

    expect(transcript.map((entry) => entry.label)).toEqual([
      "Opening",
      "Opening context",
      "Reveal",
      "Decision",
      "Turn 1",
    ]);
    expect(transcript.at(-1)).toMatchObject({
      title: "Terminal chatter",
      playerText: "I check the terminal chat.",
      narratorText: "The chat is moving too fast.",
    });
  });

  it("omits account, model, source, and hidden state fields from public player payloads", () => {
    const publicPlayer = toPublicLivePlayerProjection(player);
    const serialized = JSON.stringify(publicPlayer);

    expect(publicPlayer).toMatchObject({
      id: player._id,
      publicId: player._id,
      choice: "NO",
      turnCount: 5,
      lastActivityAt: "2026-05-02T09:06:00.000Z",
    });
    expect(serialized).not.toContain(player.clerkUserId);
    expect(serialized).not.toContain("clerkUserId");
    expect(serialized).not.toContain("publicGameplayAgreementAcceptedAt");
    expect(serialized).not.toContain("responseModel");
    expect(serialized).not.toContain("consequenceModel");
    expect(serialized).not.toContain("storylineContextSourceVersion");
    expect(serialized).not.toContain("playerVisibleFacts");
    expect(serialized).not.toContain("gpt-test");
  });

  it("keeps summaries compact for public room cards", () => {
    expect(toPublicLivePlayerSummaryProjection(player)).toEqual({
      id: player._id,
      publicId: player._id,
      dailyGameId: "game-1",
      name: "Mara Ilyin",
      age: "36",
      location: "Rotterdam",
      occupation: "Freight scheduler",
      bio: "Tracks containers through bad weather.",
      choice: "NO",
      turnCount: 5,
      lastActivityAt: "2026-05-02T09:06:00.000Z",
      createdAt: "2026-05-02T09:00:00.000Z",
      updatedAt: "2026-05-02T09:06:00.000Z",
    });
  });

  it("requires an independent persisted ID and never falls back to an account-derived ID", () => {
    expect(() =>
      toPublicLivePlayerProjection({ ...player, _id: undefined }),
    ).toThrow();
    const otherGame = toPublicLivePlayerProjection({
      ...player,
      _id: "opaque-player-record-b",
      dailyGameId: "game-2",
    });
    expect(otherGame.publicId).not.toBe(
      toPublicLivePlayerProjection(player).publicId,
    );
  });
});
