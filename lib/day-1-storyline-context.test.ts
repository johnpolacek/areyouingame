import { describe, expect, it } from "vitest";
import { buildDay1GameplayContextPayload, createSeedDay1StorylineContext } from "./day-1-storyline-context";
import type { DailyPlayer } from "./player-store";

describe("player-visible storyline context", () => {
  it.each(["local", "waiting", "package_available", "orb_revealed", "connected"] as const)(
    "allowlists only facts revealed at %s",
    (stage) => {
      const player = {
        id: "player",
        name: "Alex",
        location: "Home",
        occupation: "Developer",
        timeZone: "UTC",
        ...(stage !== "local" ? {
          firstDecision: { choice: "YES" },
          firstConnectedPath: {
            deliveryStatus: stage === "waiting" ? "pending" : "delivered",
            packageStatus: ["orb_revealed", "connected"].includes(stage) ? "opened" : "available",
            orbStatus: "unknown",
            ...(stage === "connected" ? { orbAcceptedAt: "now" } : {}),
          },
        } : {}),
      } as DailyPlayer;
      const storylineContext = createSeedDay1StorylineContext("game");
      storylineContext.publicReports.push("SECRET_FUTURE_FACT");
      const context = buildDay1GameplayContextPayload({
        dailyGame: { id: "game", eventStartsAtIso: "now", eventStartsAtLabel: "Now" },
        player,
        storylineContext,
      });
      const serialized = JSON.stringify(context);
      expect(context.storyline.stage).toBe(stage);
      expect(serialized).not.toMatch(/globalTruth|rumors|phases|SECRET_FUTURE_FACT|deliveryStatus|packageStatus|orbStatus|not_arrived/);
      if (stage === "waiting" || stage === "local") expect(serialized).not.toMatch(/drone|package|orb|delivery|ASI/i);
      if (stage === "package_available") {
        expect(serialized).toContain("drone");
        expect(serialized).not.toMatch(/orb|ASI|forehead/);
      }
      if (stage === "orb_revealed") expect(serialized).not.toContain("ASI");
      if (stage === "connected") expect(serialized).toContain("ASI");
    },
  );
});
