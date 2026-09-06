import { afterEach, expect, it, vi } from "vitest";
import { getDailyGameStats, submitFirstConnectedPathTurnForUserGame, getPublicLiveGameSummaries, getPlayerTurnsPage, migratePlayerHistoryPage, submitFirstPostChoiceActionForUserGame } from "./playerStore";

function harness() {
  vi.stubEnv("AREYOUIN_BACKEND_SECRET", "secret");
  const player: any = { _id: "p", id: "p", clerkUserId: "u", dailyGameId: "g", firstDecision: { choice: "NO" }, updatedAt: "start" };
  const tables: Record<string, any[]> = { players: [player], dailyGames: [{ _id: "g", dailyGameId: "g" }], playerTurns: [], publicGameParticipants: [], publicActivityEvents: [], playerTurnImages: [], gameplayEvents: [] };
  const reads: string[] = [];
  const db = {
    query(table: string) {
      reads.push(table);
      let rows = [...tables[table]];
      const query: any = {
        withIndex(_name: string, cb?: any) {
          const q: any = { eq(key: string, value: any) { rows = rows.filter(row => row[key] === value); return q; }, gt(key: string, value: any) { rows = rows.filter(row => row[key] > value); return q; } };
          cb?.(q); return query;
        },
        order(direction: string) { if (direction === "desc") rows.reverse(); return query; },
        first: async () => rows[0] ?? null, unique: async () => rows[0] ?? null,
        take: async (count: number) => rows.slice(0, count),
        paginate: async ({ cursor, numItems }: any) => {
          const offset = Number(cursor ?? 0);
          return { page: rows.slice(offset, offset + numItems), isDone: offset + numItems >= rows.length, continueCursor: String(offset + numItems) };
        },
      };
      return query;
    },
    async patch(id: string, patch: any) { Object.assign(Object.values(tables).flat().find(row => row._id === id), patch); },
    async insert(table: string, record: any) { const _id = `${table}-${tables[table].length}`; tables[table].push({ ...record, _id }); return _id; },
  };
  const auth = { backendSecret: "secret", clerkUserId: "u", dailyGameId: "g" };
  const call = (operation: any, args: any) => operation._handler({ db }, args);
  async function turn(n: number) {
    return call(submitFirstPostChoiceActionForUserGame, { ...auth, requestId: `r${n}`, expectedStateVersion: n - 1, expectedUpdatedAt: player.updatedAt, actionText: `action ${n}`, responseText: `response ${n}`, sceneTitle: "Scene", responseModel: "test", responseSource: "ai", actionKind: "look", playerVisibleFacts: [], storylineContextSourceVersion: "v1" });
  }
  return { tables, reads, player, call, turn, auth };
}
afterEach(() => vi.unstubAllEnvs());

it("archives long games, keeps numbering and old retries, and pages complete owner history", async () => {
  const h = harness();
  for (let n = 1; n <= 30; n++) await h.turn(n);
  expect(h.player.firstPostChoiceTurns).toHaveLength(12);
  expect(h.player.firstPostChoiceTurns.at(-1).turnNumber).toBe(30);
  expect(h.tables.playerTurns).toHaveLength(30);
  await h.turn(1);
  expect(h.tables.playerTurns).toHaveLength(30);
  expect(h.tables.dailyGames[0]).toMatchObject({ playerCount: 1, activityCount: 30 });
  const numbers: number[] = [];
  let cursor = null;
  do {
    const result = await h.call(getPlayerTurnsPage, { ...h.auth, paginationOpts: { cursor, numItems: 7 } });
    numbers.push(...result.page.map((entry: any) => entry.record.turnNumber));
    if (result.isDone) break;
    cursor = result.continueCursor;
  } while (true);
  expect(numbers).toEqual(Array.from({ length: 30 }, (_, i) => 30 - i));
  expect(await h.call(getDailyGameStats, h.auth)).toEqual({ playerCount: 1, totalMessages: 30 });
  h.reads.length = 0;
  await h.call(getPublicLiveGameSummaries, { limit: 1 });
  expect(h.reads).toEqual(["dailyGames"]);
});

it("backfills legacy records and counters idempotently alongside new writes", async () => {
  const h = harness();
  for (let n = 1; n <= 20; n++) await h.turn(n);
  h.player.firstPostChoiceTurns = h.tables.playerTurns.map(row => row.record);
  h.tables.playerTurns = [];
  h.tables.publicGameParticipants = [];
  Object.assign(h.tables.dailyGames[0], { activityCount: 0, playerCount: 0 });
  h.tables.publicActivityEvents.forEach(row => { delete row.summaryCounted; });
  for (let pass = 0; pass < 2; pass++) {
    for (const phase of ["players", "activity"]) await h.call(migratePlayerHistoryPage, { backendSecret: "secret", phase, cursor: null });
  }
  expect(h.tables.playerTurns).toHaveLength(20);
  expect(h.player.firstPostChoiceTurns).toHaveLength(12);
  await h.turn(21);
  expect(h.tables.dailyGames[0]).toMatchObject({ playerCount: 1, activityCount: 21 });
});

it("keeps YES numbering and cumulative verification state after cache eviction", async () => {
  const h = harness();
  h.player.firstDecision.choice = "YES";
  for (let n = 1; n <= 30; n++) {
    await h.call(submitFirstConnectedPathTurnForUserGame, {
      ...h.auth, expectedTurnNumber: n, actionText: "Inspect", responseText: "Sealed.",
      sceneTitle: "Package", responseModel: "test", responseSource: "ai",
      actionKind: n <= 15 ? "inspect" : "wait", playerVisibleFacts: [],
      storylineContextSourceVersion: "v1", status: "package_available", deliveryStatus: "delivered",
      packageStatus: "available", orbStatus: "unknown",
    });
  }
  expect(h.player.firstConnectedPath.turns).toHaveLength(12);
  expect(h.player.firstConnectedPath.turnCount).toBe(30);
  expect(h.player.firstConnectedPath.sealedPackageVerificationCount).toBe(15);
  expect(h.tables.playerTurns).toHaveLength(30);
});
