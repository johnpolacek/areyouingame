import type { FirstConnectedPath, FirstDecision } from "./player-store";

export type PlayerFacingStatus = {
  answer: string;
  known: string;
  unknown: string;
  currentObjective: string;
};

export function buildPlayerFacingStatus({
  decision,
  firstConnectedPath,
}: {
  decision: FirstDecision;
  firstConnectedPath?: FirstConnectedPath;
}): PlayerFacingStatus {
  if (decision.choice === "NO") {
    return {
      answer: "NO has been recorded.",
      known: "No visible physical change yet. Public reaction is still unfolding.",
      unknown:
        "Source, permanence, reversibility, and consequences are unknown in-world.",
      currentObjective:
        "Investigate the refusal: check public reports, contact someone you trust, inspect your device, document evidence, or wait and watch.",
    };
  }

  const orbLifecycle = getPlayerFacingOrbLifecycle(firstConnectedPath);

  if (orbLifecycle === "orb_accepted") {
    return {
      answer: "YES has been recorded.",
      known:
        "The orb has been accepted. A larger connected presence is now perceptible.",
      unknown:
        "Its full source, limits, permanence, reversibility, and consequences remain unknown in-world.",
      currentObjective:
        "Ask what is happening, set boundaries, request help, or test what you can perceive and do.",
    };
  }

  if (orbLifecycle === "orb_lost") {
    return {
      answer: "YES has been recorded.",
      known:
        "The orb is no longer available. You remain unconnected for current gameplay.",
      unknown:
        "Source, permanence, reversibility, and longer-term consequences remain unknown in-world.",
      currentObjective:
        "Continue observing, investigating, warning others, or acting in your scene.",
    };
  }

  if (
    firstConnectedPath?.packageStatus === "opened" &&
    firstConnectedPath.orbStatus === "revealed"
  ) {
    return {
      answer: "YES has been recorded.",
      known:
        "The package is open. A smooth featureless orb is present with an instruction to place it at the center of your forehead.",
      unknown:
        "What the orb is, who sent it, whether it is reversible, and what acceptance changes are unknown in-world.",
      currentObjective:
        "Decide what to do with the orb: inspect it, delay, ask others, refuse it, destroy it, or place it at the center of your forehead.",
    };
  }

  if (firstConnectedPath?.packageStatus === "available") {
    const hasRepeatedSealedPackageActions =
      firstConnectedPath.turns.filter(
        (turn) =>
          turn.actionKind.includes("inspect") ||
          turn.actionKind.includes("measure") ||
          turn.actionKind.includes("weigh") ||
          turn.actionKind.includes("verify") ||
          turn.actionKind.includes("photo") ||
          turn.actionKind.includes("document") ||
          turn.actionKind.includes("compare"),
      ).length >= 2;

    return {
      answer: "YES has been recorded.",
      known: "A sealed package is present.",
      unknown:
        "Its source, contents, permanence, reversibility, and purpose are unknown in-world.",
      currentObjective: hasRepeatedSealedPackageActions
        ? "You have documented the sealed package. Now choose a next commitment: isolate it, show someone, report it, keep refusing to open it, or open it."
        : "A sealed package is present. You can inspect, move, photograph, ignore, or open it.",
    };
  }

  return {
    answer: "YES has been recorded.",
    known: "No visible physical change yet.",
    unknown:
      "Source, permanence, and reversibility are unknown in-world.",
    currentObjective:
      "Look for proof: check public channels, contact someone nearby, test an ordinary action, leave, wait, or keep watching your scene.",
  };
}

function getPlayerFacingOrbLifecycle(
  firstConnectedPath?: FirstConnectedPath,
) {
  if (!firstConnectedPath) {
    return undefined;
  }

  if (firstConnectedPath.orbLifecycle) {
    return firstConnectedPath.orbLifecycle;
  }

  if (
    firstConnectedPath.packageStatus === "opened" &&
    firstConnectedPath.orbStatus === "revealed"
  ) {
    return "orb_delivered";
  }

  return undefined;
}
