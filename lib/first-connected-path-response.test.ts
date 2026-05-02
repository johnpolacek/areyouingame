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
  it("makes the second non-disruptive YES path turn delivery eligible", () => {
    expect(
      getNextConnectedPathTransition({
        actionText: "I chill and keep watching the feeds.",
        firstConnectedPath: {
          id: "connected-1",
          status: "pre_delivery",
          deliveryStatus: "pending",
          packageStatus: "not_arrived",
          orbStatus: "unknown",
          turnCount: 1,
          turns: [],
          startedAt: "2026-04-30T20:03:00.000Z",
          updatedAt: "2026-04-30T20:04:00.000Z",
        },
      }),
    ).toMatchObject({
      expectedTurnNumber: 2,
      transitionKind: "delivered",
      deliveryStatus: "delivered",
      packageStatus: "available",
    });
  });

  it("keeps the first YES path turn in the grounded waiting beat", () => {
    expect(
      getNextConnectedPathTransition({
        actionText: "I look around the room and check my phone.",
      }),
    ).toMatchObject({
      expectedTurnNumber: 1,
      transitionKind: "waiting",
      deliveryStatus: "pending",
      packageStatus: "not_arrived",
    });
  });

  it.each([
    "I am not opening it yet. I inspect the label and weight without breaking the seal.",
    "If you want me to open it, say what changes first. Keep the package sealed.",
    "I want comparison reports before opening anything.",
  ])("keeps delay and inspection language from opening the package: %s", (actionText) => {
    expect(
      getNextConnectedPathTransition({
        actionText,
        firstConnectedPath: {
          id: "connected-1",
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
          orbStatus: "unknown",
          turnCount: 3,
          turns: [],
          startedAt: "2026-04-30T20:03:00.000Z",
          updatedAt: "2026-04-30T20:04:00.000Z",
        },
      }),
    ).toMatchObject({
      transitionKind: "unchanged",
      packageStatus: "available",
      orbStatus: "unknown",
    });
  });

  it.each([
    "I open the package.",
    "I open package carefully.",
    "I cut the seal.",
    "I look inside.",
  ])("opens the package only on affirmative opening actions: %s", (actionText) => {
    expect(
      getNextConnectedPathTransition({
        actionText,
        firstConnectedPath: {
          id: "connected-1",
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
          orbStatus: "unknown",
          turnCount: 3,
          turns: [],
          startedAt: "2026-04-30T20:03:00.000Z",
          updatedAt: "2026-04-30T20:04:00.000Z",
        },
      }),
    ).toMatchObject({
      transitionKind: "opened",
      packageStatus: "opened",
      orbStatus: "revealed",
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
    "instructs terms questions to use scene facts, limits, and choices: %s",
    async (actionText) => {
      vi.mocked(trackedGenerateText).mockResolvedValueOnce({
        text: JSON.stringify({
          responseText:
            "The room does not change.\n\nYour phone stays dark in your hand. Outside, people keep posting the same question from different rooms.\n\nYou can ask someone nearby. You can check public reports. Or you can wait and watch one ordinary thing at a time.",
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
        "answer through concrete scene facts, limits, and choices",
      );
      expect(firstCall?.system).toContain("Do not use recap headings");
      expect(firstCall?.system).toContain(
        "Do not strand the player in dead-end phrasing",
      );
    },
  );

  it("instructs sealed-package turns to add a concrete new delta", async () => {
    vi.mocked(trackedGenerateText).mockResolvedValueOnce({
      text: JSON.stringify({
        responseText:
          "You keep the package sealed and turn it once in your hands. It is lighter than it looks, but one edge carries a shallow notch that was not visible from the doorway.\n\nThe room does not answer for it. The next fork is practical: photograph the notch, isolate the package, open it, or get another person to witness it before you do anything irreversible.",
        sceneTitle: "Notch In The Seam",
        actionKind: "inspect_sealed_package",
        playerVisibleFacts: [
          "The package remains sealed.",
          "A shallow notch is visible on one edge.",
        ],
      }),
    } as Awaited<ReturnType<typeof trackedGenerateText>>);

    await createFirstConnectedPathTurnResponse({
      actionText: "I inspect the package but do not open it.",
      dailyGame,
      day1GameplayContext: {} as never,
      storylineContext: { sourceVersion: "test" } as never,
      player: {
        ...player,
        firstConnectedPath: {
          ...player.firstConnectedPath!,
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
          turnCount: 3,
        },
      },
    });

    const firstCall = vi.mocked(trackedGenerateText).mock.calls[0]?.[0];

    expect(firstCall?.system).toContain(
      "each response must add a concrete new observable delta tied to the player's action",
    );
    expect(firstCall?.system).toContain(
      "Do not repeat the previous connected-path scene",
    );
    expect(firstCall?.system).toContain(
      "For sealed-package caution, let non-opening actions matter.",
    );
    expect(firstCall?.system).toContain(
      "After two sealed-package verification turns",
    );
  });

  it("passes sealed-package verification count for escalation", async () => {
    vi.mocked(trackedGenerateText).mockResolvedValueOnce({
      text: JSON.stringify({
        responseText:
          "You stop measuring because the numbers are no longer changing. The practical choice shifts: isolate it, show someone else, report the exact details, or open the seam.",
        sceneTitle: "No New Numbers",
        actionKind: "isolate_package",
        playerVisibleFacts: [
          "Further measurement adds no new visible facts.",
          "The package remains sealed.",
        ],
      }),
    } as Awaited<ReturnType<typeof trackedGenerateText>>);

    await createFirstConnectedPathTurnResponse({
      actionText: "I measure it again and keep it sealed.",
      dailyGame,
      day1GameplayContext: {} as never,
      storylineContext: { sourceVersion: "test" } as never,
      player: {
        ...player,
        firstConnectedPath: {
          ...player.firstConnectedPath!,
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
          turnCount: 5,
          turns: [
            {
              id: "turn-1",
              turnNumber: 1,
              actionText: "I inspect the package.",
              responseText: "The package remains sealed.",
              sceneTitle: "Inspection",
              responseModel: "test-model",
              responseSource: "ai",
              actionKind: "inspect_sealed_package",
              playerVisibleFacts: ["The package remains sealed."],
              storylineContextSourceVersion: "test",
              deliveryStatus: "delivered",
              packageStatus: "available",
              orbStatus: "unknown",
              resolvedAt: "2026-04-30T20:05:00.000Z",
            },
            {
              id: "turn-2",
              turnNumber: 2,
              actionText: "I measure the package.",
              responseText: "The dimensions hold.",
              sceneTitle: "Measurement",
              responseModel: "test-model",
              responseSource: "ai",
              actionKind: "measure_package",
              playerVisibleFacts: ["The dimensions hold."],
              storylineContextSourceVersion: "test",
              deliveryStatus: "delivered",
              packageStatus: "available",
              orbStatus: "unknown",
              resolvedAt: "2026-04-30T20:06:00.000Z",
            },
          ],
        },
      },
    });

    const firstCall = vi.mocked(trackedGenerateText).mock.calls[0]?.[0];

    expect(firstCall?.prompt).toContain('"sealedPackageVerificationCount": 2');
  });
});
