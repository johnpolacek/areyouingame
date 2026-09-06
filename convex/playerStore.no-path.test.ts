import { afterEach, expect, it, vi } from "vitest";
import { submitFirstPostChoiceActionForUserGame } from "./playerStore";

function harness(legacy = false) {
  vi.stubEnv("AREYOUIN_BACKEND_SECRET", "test-secret");
  const row: any = {
    _id: "player", id: "player", clerkUserId: "user", dailyGameId: "game",
    name: "Test", age: "30", location: "Chicago", occupation: "Writer", bio: "",
    timeZone: "America/Chicago", createdAt: "start", updatedAt: "start",
    firstDecision: { choice: "NO" },
    ...(legacy ? { firstPostChoiceAction: {
      id: "legacy", actionText: "Look around", responseText: "A street.",
      submittedAt: "start",
    } } : {}),
  };
  const db = {
    query: (table: string) => ({
      withIndex: () => ({ first: async () => null, unique: async () => table === "players" ? row : null }),
    }),
    patch: vi.fn(async (_id: string, patch: object) => { Object.assign(row, patch); }),
    insert: vi.fn(async () => "id"),
  };
  const args = {
    backendSecret: "test-secret", clerkUserId: "user", dailyGameId: "game",
    requestId: "request-1", expectedStateVersion: legacy ? 1 : 0, expectedUpdatedAt: "start",
    actionText: "Open the door", responseText: "The door opens.", sceneTitle: "Door",
    responseModel: "test", responseSource: "ai", actionKind: "open_world_action",
    playerVisibleFacts: [], storylineContextSourceVersion: "v1",
  };
  const handler = (submitFirstPostChoiceActionForUserGame as any)._handler;
  return { row, db, args, call: (overrides = {}) => handler({ db }, { ...args, ...overrides }) };
}
afterEach(() => vi.unstubAllEnvs());

it("rejects a second generation from the same snapshot without side effects", async () => {
  const { call, row, db } = harness();
  await call();
  const writes = db.insert.mock.calls.length;
  await expect(call({ requestId: "request-2" })).rejects.toThrow("ACTION_CONFLICT");
  expect(row.firstPostChoiceTurns).toHaveLength(1);
  expect(db.patch).toHaveBeenCalledTimes(1);
  expect(db.insert).toHaveBeenCalledTimes(writes);
});

it("returns committed state for retries, even after subsequent turns", async () => {
  const { call, row, db } = harness();
  await call();
  await call({ requestId: "request-2", expectedStateVersion: 1, expectedUpdatedAt: row.updatedAt });
  const writes = db.insert.mock.calls.length;
  const result = await call({ responseText: "Different regenerated text." });
  expect(result.firstPostChoiceTurns).toHaveLength(2);
  expect(result.firstPostChoiceTurns[0].responseText).toBe("The door opens.");
  expect(db.patch).toHaveBeenCalledTimes(2);
  expect(db.insert).toHaveBeenCalledTimes(writes);
});

it("rejects request ID reuse with a changed action or version", async () => {
  const { call } = harness();
  await call();
  await expect(call({ actionText: "Run" })).rejects.toThrow("ACTION_CONFLICT");
  await expect(call({ expectedStateVersion: 1 })).rejects.toThrow("ACTION_CONFLICT");
});

it("checks player updates made while narration was generating", async () => {
  const { call, row, db } = harness();
  row.updatedAt = "changed";
  await expect(call()).rejects.toThrow("ACTION_CONFLICT");
  expect(db.patch).not.toHaveBeenCalled();
  expect(db.insert).not.toHaveBeenCalled();
});

it("counts legacy turns and appends only at the expected version", async () => {
  const { call, row } = harness(true);
  await expect(call({ expectedStateVersion: 0 })).rejects.toThrow("ACTION_CONFLICT");
  await call();
  expect(row.firstPostChoiceTurns.map((turn: any) => turn.turnNumber)).toEqual([1, 2]);
});
