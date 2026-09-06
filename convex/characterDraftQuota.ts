import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Reservations are atomic across instances and retained on generation failure.
// Reuse each counter when its window expires to avoid per-request storage growth.
export const reserve = mutation({
  args: { backendSecret: v.string(), clerkUserId: v.string() },
  handler: async (ctx, args) => {
    if (!process.env.AREYOUIN_BACKEND_SECRET ||
        args.backendSecret !== process.env.AREYOUIN_BACKEND_SECRET) {
      throw new Error("Unauthorized backend mutation.");
    }
    const now = Date.now();
    const limits = [
      { key: `minute:${args.clerkUserId}`, duration: 60_000, limit: 3 },
      { key: `day:${args.clerkUserId}`, duration: 86_400_000, limit: 20 },
      { key: "global", duration: 86_400_000, limit: 500 },
    ];
    const counters = await Promise.all(limits.map(async (limit) => {
      const row = await ctx.db.query("characterDraftQuotas")
        .withIndex("by_key", (q) => q.eq("key", limit.key)).unique();
      const active = row && now < row.windowStart + limit.duration;
      return { ...limit, row, count: active ? row.count : 0,
        windowStart: active ? row.windowStart : now };
    }));
    const blocked = counters.filter((counter) => counter.count >= counter.limit);
    if (blocked.length) {
      return { allowed: false, retryAfter: Math.max(...blocked.map((counter) =>
        Math.ceil((counter.windowStart + counter.duration - now) / 1000))) };
    }
    for (const counter of counters) {
      const value = { key: counter.key, windowStart: counter.windowStart, count: counter.count + 1 };
      if (counter.row) await ctx.db.patch(counter.row._id, value);
      else await ctx.db.insert("characterDraftQuotas", value);
    }
    return { allowed: true, retryAfter: 0 };
  },
});
