import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackedGenerateText } from "./ai-usage";
import type { DailyGame } from "./daily-game";
import { createFirstNoPostChoiceActionResponse } from "./first-post-choice-action-response";
import type { DailyPlayer } from "./player-store";

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
  name: "Mara",
  age: "34",
  location: "Chicago, IL",
  occupation: "ER nurse",
  bio: "Skeptical and practical.",
  timeZone: "America/Chicago",
  openingResponse: "No. I need proof before I commit.",
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
    choice: "NO",
    status: "first_choice_submitted",
    consequenceTitle: "NO Answered",
    consequenceBody: "The screen goes quiet.",
    consequenceModel: "test-model",
    consequenceSource: "fallback",
    revealId: "reveal-1",
    revealGeneratedAt: "2026-04-30T20:01:00.000Z",
    revealModel: "test-model",
    revealSource: "fallback",
    submittedAt: "2026-04-30T20:02:00.000Z",
  },
  firstPostChoiceTurns: [
    {
      id: "turn-1",
      actionText: "I check public reports and message a coworker.",
      responseText: "The first reports are scattered.",
      sceneTitle: "Reports Start",
      responseModel: "test-model",
      responseSource: "ai",
      actionKind: "check_public_reports",
      playerVisibleFacts: ["Public reports are scattered."],
      storylineContextSourceVersion: "test",
      turnNumber: 1,
      submittedAt: "2026-04-30T20:03:00.000Z",
      resolvedAt: "2026-04-30T20:03:10.000Z",
    },
  ],
  createdAt: "2026-04-30T20:00:00.000Z",
  updatedAt: "2026-04-30T20:04:00.000Z",
};

describe("createFirstNoPostChoiceActionResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("instructs repeated NO-path verification to advance with concrete forks", async () => {
    vi.mocked(trackedGenerateText).mockResolvedValueOnce({
      text: JSON.stringify({
        responseText:
          "You check the reports again, this time sorting by timestamp instead of volume. The first posts do not line up cleanly: one hospital thread claims the prompt hit wall displays before phones, while a coworker texts back that their unit saw only patient-room televisions.\n\nYour NO still sits unchanged on your phone. The useful forks are practical now: preserve the screenshots, call the coworker directly, inspect app permissions, or leave the phone face down and watch the room.",
        sceneTitle: "Timestamps Disagree",
        actionKind: "repeat_public_verification",
        playerVisibleFacts: [
          "The player's NO remains recorded.",
          "Public timestamps disagree across reports.",
        ],
      }),
    } as Awaited<ReturnType<typeof trackedGenerateText>>);

    await createFirstNoPostChoiceActionResponse({
      actionText: "I check public reports again and text my coworker.",
      dailyGame,
      day1GameplayContext: {} as never,
      storylineContext: { sourceVersion: "test" } as never,
      player,
    });

    const firstCall = vi.mocked(trackedGenerateText).mock.calls[0]?.[0];

    expect(firstCall?.system).toContain(
      "If the player repeats a verification action from a prior NO-path turn",
    );
    expect(firstCall?.system).toContain(
      "End each NO-path response with 2 to 4 concrete next forks",
    );
    expect(firstCall?.prompt).toContain("check public reports and message a coworker");
  });
});
