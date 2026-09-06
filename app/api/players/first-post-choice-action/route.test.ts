import { beforeEach, expect, it, vi } from "vitest";

vi.mock("@/lib/playtest-auth", () => ({ getOptionalAuthenticatedUserId: async () => "user" }));
vi.mock("@/lib/daily-game", () => ({ getTodayGameForRequest: async () => ({ id: "game" }) }));
vi.mock("@/lib/day-1-storyline-context", () => ({
  buildDay1GameplayContextPayload: vi.fn(),
  getOrCreateDay1StorylineContextForDailyGame: vi.fn(),
}));
vi.mock("@/lib/content-moderation", () => ({ moderateTextOrThrow: vi.fn() }));
vi.mock("@/lib/first-post-choice-action-response", () => ({
  createFirstNoPostChoiceActionResponse: vi.fn(async () => ({})),
}));
vi.mock("@/lib/player-store", () => ({
  getPlayerForUserGame: vi.fn(),
  submitFirstPostChoiceActionForUserGame: vi.fn(),
  validateFirstPostChoiceAction: (text: string) => text.trim(),
}));
import { POST } from "./route";
import { getPlayerForUserGame, submitFirstPostChoiceActionForUserGame } from "@/lib/player-store";
import { createFirstNoPostChoiceActionResponse } from "@/lib/first-post-choice-action-response";

const player = { id: "player", firstDecision: { choice: "NO" }, updatedAt: "snapshot", firstPostChoiceTurns: [] };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPlayerForUserGame).mockResolvedValue(player as any);
  vi.mocked(submitFirstPostChoiceActionForUserGame).mockResolvedValue(player as any);
});
const call = (body: object) => POST(new Request("http://localhost/api", {
  method: "POST", body: JSON.stringify({ actionText: "Open door", requestId: "r1", expectedStateVersion: 0, ...body }),
}));
it("requires a valid request identity and version", async () => {
  expect((await call({ requestId: "" })).status).toBe(400);
  expect((await call({ expectedStateVersion: -1 })).status).toBe(400);
  expect(createFirstNoPostChoiceActionResponse).not.toHaveBeenCalled();
});
it("rejects stale client state before generation", async () => {
  expect((await call({ expectedStateVersion: 1 })).status).toBe(409);
  expect(createFirstNoPostChoiceActionResponse).not.toHaveBeenCalled();
});
it("replays completed requests without generating or saving again", async () => {
  vi.mocked(getPlayerForUserGame).mockResolvedValue({
    ...player, firstPostChoiceTurns: [{ requestId: "r1", turnNumber: 1, actionText: "Open door" }],
  } as any);
  expect((await call({})).status).toBe(200);
  expect(createFirstNoPostChoiceActionResponse).not.toHaveBeenCalled();
  expect(submitFirstPostChoiceActionForUserGame).not.toHaveBeenCalled();
  expect((await call({ actionText: "Run" })).status).toBe(409);
});
it("passes the generation snapshot to the mutation and reports save conflicts", async () => {
  vi.mocked(submitFirstPostChoiceActionForUserGame).mockRejectedValueOnce(new Error("ACTION_CONFLICT: State changed."));
  expect((await call({})).status).toBe(409);
  expect(submitFirstPostChoiceActionForUserGame).toHaveBeenCalledWith(expect.objectContaining({
    requestId: "r1", expectedStateVersion: 0, expectedUpdatedAt: "snapshot",
  }));
});
