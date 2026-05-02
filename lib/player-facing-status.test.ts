import { describe, expect, it } from "vitest";
import { buildPlayerFacingStatus } from "./player-facing-status";
import type { FirstConnectedPath, FirstDecision } from "./player-store";

const baseDecision: FirstDecision = {
  id: "decision-1",
  choice: "YES",
  status: "first_choice_submitted",
  consequenceTitle: "",
  consequenceBody: "The room returns to normal.",
  consequenceModel: "test-model",
  consequenceSource: "fallback",
  revealId: "reveal-1",
  revealGeneratedAt: "2026-04-30T20:01:00.000Z",
  revealModel: "test-model",
  revealSource: "fallback",
  submittedAt: "2026-04-30T20:02:00.000Z",
};

const baseConnectedPath: FirstConnectedPath = {
  id: "connected-1",
  status: "pre_delivery",
  deliveryStatus: "pending",
  packageStatus: "not_arrived",
  orbStatus: "unknown",
  turnCount: 0,
  turns: [],
  startedAt: "2026-04-30T20:03:00.000Z",
  updatedAt: "2026-04-30T20:03:00.000Z",
};

describe("buildPlayerFacingStatus", () => {
  it("summarizes YES immediately after choice without future reveals", () => {
    expect(buildPlayerFacingStatus({ decision: baseDecision })).toEqual({
      answer: "YES has been recorded.",
      known: "No visible physical change yet.",
      unknown:
        "Source, permanence, and reversibility are unknown in-world.",
      currentObjective:
        "Look for proof: check public channels, contact someone nearby, test an ordinary action, leave, wait, or keep watching your scene.",
    });
  });

  it("summarizes YES pre-delivery without delivery language", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: baseConnectedPath,
      }),
    ).toMatchObject({
      known: "No visible physical change yet.",
      currentObjective:
        "Look for proof: check public channels, contact someone nearby, test an ordinary action, leave, wait, or keep watching your scene.",
    });
  });

  it("summarizes package available with package actions", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: {
          ...baseConnectedPath,
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
        },
      }),
    ).toMatchObject({
      known: "A sealed package is present.",
      currentObjective:
        "A sealed package is present. You can inspect, move, photograph, ignore, or open it.",
    });
  });

  it("advances the package objective after repeated verification", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: {
          ...baseConnectedPath,
          status: "package_available",
          deliveryStatus: "delivered",
          packageStatus: "available",
          turns: [
            {
              id: "turn-1",
              turnNumber: 1,
              actionText: "I inspect it.",
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
              actionText: "I measure it.",
              responseText: "The package dimensions hold.",
              sceneTitle: "Measurement",
              responseModel: "test-model",
              responseSource: "ai",
              actionKind: "measure_package",
              playerVisibleFacts: ["The package dimensions hold."],
              storylineContextSourceVersion: "test",
              deliveryStatus: "delivered",
              packageStatus: "available",
              orbStatus: "unknown",
              resolvedAt: "2026-04-30T20:06:00.000Z",
            },
          ],
        },
      }),
    ).toMatchObject({
      currentObjective:
        "You have documented the sealed package. Now choose a next commitment: isolate it, show someone, report it, keep refusing to open it, or open it.",
    });
  });

  it("summarizes orb revealed without exposing later interface details", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: {
          ...baseConnectedPath,
          status: "orb_revealed",
          deliveryStatus: "delivered",
          packageStatus: "opened",
          orbStatus: "revealed",
        },
      }),
    ).toMatchObject({
      known:
        "The package is open. A smooth featureless orb is present with an instruction to place it at the center of your forehead.",
      currentObjective:
        "Decide what to do with the orb: inspect it, delay, ask others, refuse it, destroy it, or place it at the center of your forehead.",
    });
  });

  it("summarizes orb accepted", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: {
          ...baseConnectedPath,
          status: "orb_revealed",
          deliveryStatus: "delivered",
          packageStatus: "opened",
          orbStatus: "revealed",
          orbLifecycle: "orb_accepted",
        },
      }),
    ).toMatchObject({
      known:
        "The orb has been accepted. A larger connected presence is now perceptible.",
      currentObjective:
        "Ask what is happening, set boundaries, request help, or test what you can perceive and do.",
    });
  });

  it("summarizes orb lost", () => {
    expect(
      buildPlayerFacingStatus({
        decision: baseDecision,
        firstConnectedPath: {
          ...baseConnectedPath,
          status: "orb_revealed",
          deliveryStatus: "delivered",
          packageStatus: "opened",
          orbStatus: "revealed",
          orbLifecycle: "orb_lost",
        },
      }),
    ).toMatchObject({
      known:
        "The orb is no longer available. You remain unconnected for current gameplay.",
      currentObjective:
        "Continue observing, investigating, warning others, or acting in your scene.",
    });
  });

  it("summarizes NO after choice", () => {
    expect(
      buildPlayerFacingStatus({
        decision: {
          ...baseDecision,
          choice: "NO",
        },
      }),
    ).toEqual({
      answer: "NO has been recorded.",
      known: "No visible physical change yet. Public reaction is still unfolding.",
      unknown:
        "Source, permanence, reversibility, and consequences are unknown in-world.",
      currentObjective:
        "Investigate the refusal: check public reports, contact someone you trust, inspect your device, document evidence, or wait and watch.",
    });
  });
});
