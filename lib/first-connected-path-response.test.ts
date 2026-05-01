import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFirstConnectedPathTurnResponse,
  getNextConnectedPathTransition,
} from "./first-connected-path-response";
import type { DailyGame } from "./daily-game";
import type { DailyPlayer } from "./player-store";
import { trackedGenerateText } from "./ai-usage";

vi.mock("./ai-usage", () => ({
  trackedGenerateText: vi.fn(),
}));

const dailyGame: DailyGame = {
  id: "game-1",
  eventStartsAtIso: "2026-04-30T20:00:00.000Z",
  eventStartsAtLabel: "3:00 PM",
};

const player: DailyPlayer = {
  id: "player-1",
  clerkUserId: "user-1",
  dailyGameId: "game-1",
  name: "Alex",
  age: "34",
  location: "apartment",
  occupation: "software developer",
  bio: "Works from home.",
  timeZone: "America/Chicago",
  openingResponse: "I am coding and eating dinner.",
  firstMoveReveal: {
    id: "reveal-1",
    sceneIntro: ["The question appears."],
    revealCopy: {
      availability: "A new way of being is available.",
      promise: "Connection. Understanding. Freedom.",
      question: "Are you in?",
      yesLabel: "YES",
      noLabel: "NO",
      audioPrompt: "Please respond yes or no",
    },
    status: "yes_no_pending",
    generatedAt: "2026-04-30T20:01:00.000Z",
    model: "test-model",
    source: "fallback",
  },
  firstDecision: {
    id: "decision-1",
    choice: "YES",
    status: "first_choice_submitted",
    consequenceTitle: "YES Answered",
    consequenceBody: "The room returns to normal.",
    consequenceModel: "test-model",
    consequenceSource: "fallback",
    revealId: "reveal-1",
    revealGeneratedAt: "2026-04-30T20:01:00.000Z",
    revealModel: "test-model",
    revealSource: "fallback",
    submittedAt: "2026-04-30T20:02:00.000Z",
  },
  firstConnectedPath: {
    id: "connected-1",
    status: "pre_delivery",
    deliveryStatus: "pending",
    packageStatus: "not_arrived",
    orbStatus: "unknown",
    turnCount: 2,
    turns: [],
    startedAt: "2026-04-30T20:03:00.000Z",
    updatedAt: "2026-04-30T20:04:00.000Z",
  },
  createdAt: "2026-04-30T20:00:00.000Z",
  updatedAt: "2026-04-30T20:04:00.000Z",
};

describe("getNextConnectedPathTransition", () => {
  it("makes the third non-disruptive YES path turn delivery eligible", () => {
    expect(
      getNextConnectedPathTransition({
        actionText: "I chill and keep watching the feeds.",
        firstConnectedPath: {
          id: "connected-1",
          status: "pre_delivery",
          deliveryStatus: "pending",
          packageStatus: "not_arrived",
          orbStatus: "unknown",
          turnCount: 2,
          turns: [],
          startedAt: "2026-04-30T20:03:00.000Z",
          updatedAt: "2026-04-30T20:04:00.000Z",
        },
      }),
    ).toMatchObject({
      expectedTurnNumber: 3,
      transitionKind: "delivered",
      deliveryStatus: "delivered",
      packageStatus: "available",
    });
  });
});

describe("createFirstConnectedPathTurnResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("regenerates a delivered turn when the prose skips the drone package beat", async () => {
    vi.mocked(trackedGenerateText)
      .mockResolvedValueOnce({
        text: JSON.stringify({
          responseText: "You sit with the cold dinner while the feeds keep getting louder.",
          sceneTitle: "Cold Feed",
          actionKind: "wait_and_watch",
          playerVisibleFacts: ["Public reports are accelerating."],
        }),
      } as Awaited<ReturnType<typeof trackedGenerateText>>)
      .mockResolvedValueOnce({
        text: JSON.stringify({
          responseText:
            "A drone drops low outside with a thin electric whine.\n\nIt leaves a small matte package near your door, clean-edged and unmarked.",
          sceneTitle: "Package At The Door",
          actionKind: "drone_delivery",
          playerVisibleFacts: ["A drone delivered a small package nearby."],
        }),
      } as Awaited<ReturnType<typeof trackedGenerateText>>);

    await expect(
      createFirstConnectedPathTurnResponse({
        actionText: "I chill",
        dailyGame,
        day1GameplayContext: {} as never,
        storylineContext: { sourceVersion: "test" } as never,
        player,
      }),
    ).resolves.toMatchObject({
      transitionKind: "delivered",
      responseText: expect.stringContaining("drone"),
      packageStatus: "available",
    });

    expect(trackedGenerateText).toHaveBeenCalledTimes(2);
  });

  it.each(["Can I back out?", "What changed?"])(
    "instructs terms questions to separate visible truth, unknowns, and next steps: %s",
    async (actionText) => {
      vi.mocked(trackedGenerateText).mockResolvedValueOnce({
        text: JSON.stringify({
          responseText:
            "Your room remains physically unchanged, but the question has left you watching everything differently.\n\nWhat is visibly true: your answer is recorded and the world outside is still reacting. What remains unknown: who made the offer, whether it can be reversed, and what control means now. What you can do next: keep checking people and devices around you, ask for help, wait, leave, or test one ordinary action at a time.",
          sceneTitle: "No Clear Terms",
          actionKind: "ask_about_terms",
          playerVisibleFacts: [
            "The player can see no direct physical change yet.",
            "The source and reversibility remain unknown.",
          ],
        }),
      } as Awaited<ReturnType<typeof trackedGenerateText>>);

      await createFirstConnectedPathTurnResponse({
        actionText,
        dailyGame,
        day1GameplayContext: {} as never,
        storylineContext: { sourceVersion: "test" } as never,
        player: {
          ...player,
          firstConnectedPath: {
            ...player.firstConnectedPath!,
            turnCount: 0,
          },
        },
      });

      const firstCall = vi.mocked(trackedGenerateText).mock.calls[0]?.[0];

      expect(firstCall?.system).toContain(
        "what is visibly true now, what remains unknown in-world, and what the player can do next",
      );
      expect(firstCall?.system).toContain(
        "Do not strand the player in dead-end phrasing",
      );
    },
  );
});
