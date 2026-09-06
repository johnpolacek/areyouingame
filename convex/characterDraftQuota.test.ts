import { afterEach, expect, it, vi } from "vitest";
import { reserve } from "./characterDraftQuota";

type Row = { _id: string; key: string; windowStart: number; count: number };
function harness() {
  const rows = new Map<string, Row>();
  const db = {
    query: () => ({
      withIndex: (_name: string, select: (q: { eq: (_: string, key: string) => string }) => string) => {
        const key = select({ eq: (_, key) => key });
        return { unique: async () => rows.get(key) ?? null };
      },
    }),
    insert: async (_table: string, row: Omit<Row, "_id">) => {
      rows.set(row.key, { ...row, _id: row.key });
    },
    patch: async (id: string, row: Omit<Row, "_id">) => {
      rows.set(id, { ...row, _id: id });
    },
  };
  const handler = (reserve as unknown as {
    _handler: (ctx: { db: typeof db }, args: { backendSecret: string; clerkUserId: string }) =>
      Promise<{ allowed: boolean; retryAfter: number }>;
  })._handler;
  vi.stubEnv("AREYOUIN_BACKEND_SECRET", "test-secret");
  vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  return { rows, call: (clerkUserId = "user", backendSecret = "test-secret") =>
    handler({ db }, { clerkUserId, backendSecret }) };
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it("requires the backend secret before touching counters", async () => {
  const { call, rows } = harness();
  await expect(call("user", "wrong")).rejects.toThrow("Unauthorized");
  expect(rows.size).toBe(0);
});
it("limits per-user bursts and resets expired windows", async () => {
  const { call, rows } = harness();
  for (let i = 0; i < 3; i++) expect((await call()).allowed).toBe(true);
  expect(await call()).toEqual({ allowed: false, retryAfter: 60 });
  expect(rows.get("global")?.count).toBe(3);
  vi.mocked(Date.now).mockReturnValue(1_060_000);
  expect((await call()).allowed).toBe(true);
  expect(rows.get("day:user")?.count).toBe(4);
});
it("limits daily user generation even across minute windows", async () => {
  const { call } = harness();
  for (let i = 0; i < 20; i++) {
    vi.mocked(Date.now).mockReturnValue(1_000_000 + i * 60_000);
    expect((await call()).allowed).toBe(true);
  }
  expect((await call()).allowed).toBe(false);
  vi.mocked(Date.now).mockReturnValue(1_000_000 + 86_400_000);
  expect((await call()).allowed).toBe(true);
});
it("enforces the shared daily budget across distinct users", async () => {
  const { call, rows } = harness();
  for (let i = 0; i < 500; i++) expect((await call(`user-${i}`)).allowed).toBe(true);
  expect((await call("new-user")).allowed).toBe(false);
  expect(rows.has("minute:new-user")).toBe(false);
  expect(rows.get("global")?.count).toBe(500);
});
