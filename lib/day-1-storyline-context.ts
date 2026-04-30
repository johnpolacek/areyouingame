import { fetchMutation, fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import type { DailyGame } from "./daily-game";
import type { DailyPlayer, YesNoChoice } from "./player-store";

export type Day1StorylinePhaseId =
  | "normalcy"
  | "confusion_spread"
  | "verification"
  | "decision"
  | "consequences_realization";

export type Day1StorylinePhase = {
  id: Day1StorylinePhaseId;
  label: string;
  summary: string;
  playerExperience: string;
};

export type Day1StorylineContext = {
  id: string;
  dailyGameId: string;
  dayNumber: 1;
  phases: Day1StorylinePhase[];
  globalTruth: string[];
  publicReports: string[];
  rumors: string[];
  officialNarratives: string[];
  regionalVariationNotes: string[];
  socialFeedSignals: string[];
  playerVisibleConstraints: string[];
  externalContentPolicy: string;
  source: "static_source" | "fallback";
  sourceVersion: string;
  createdAt: string;
  updatedAt: string;
};

export type Day1StorylineRuntimeContext = Day1StorylineContext & {
  currentPhase: Day1StorylinePhaseId;
  activePhaseIds: Day1StorylinePhaseId[];
};

export type Day1GameplayContextPayload = {
  dayNumber: 1;
  dailyGame: {
    id: string;
    eventStartsAtIso: string;
    eventStartsAtLabel: string;
  };
  storyline: {
    currentPhase: Day1StorylinePhaseId;
    activePhaseIds: Day1StorylinePhaseId[];
    phases: Day1StorylinePhase[];
    globalTruth: string[];
    publicReports: string[];
    rumors: string[];
    officialNarratives: string[];
    regionalVariationNotes: string[];
    socialFeedSignals: string[];
    playerVisibleConstraints: string[];
    externalContentPolicy: string;
    source: Day1StorylineContext["source"];
    sourceVersion: string;
  };
  player: {
    id: string;
    name: string;
    location: string;
    occupation: string;
    timeZone: string;
    choice?: YesNoChoice;
    knownFacts: string[];
    recentEvents: string[];
  };
};

type AuthenticatedStorylineArgs = {
  backendSecret: string;
  dailyGameId: string;
};

const getDay1StorylineContextForDailyGameRef = makeFunctionReference<
  "query",
  AuthenticatedStorylineArgs,
  Day1StorylineContext | null
>("playerStore:getDay1StorylineContextForDailyGame");

const ensureDay1StorylineContextForDailyGameRef = makeFunctionReference<
  "mutation",
  AuthenticatedStorylineArgs & {
    context: Day1StorylineContext;
  },
  Day1StorylineContext
>("playerStore:ensureDay1StorylineContextForDailyGame");

export async function getDay1StorylineContextForDailyGame(
  dailyGameId: string,
): Promise<Day1StorylineContext | null> {
  return await fetchQuery(getDay1StorylineContextForDailyGameRef, {
    backendSecret: getBackendSecret(),
    dailyGameId,
  });
}

export async function ensureDay1StorylineContextForDailyGame(
  dailyGameId: string,
): Promise<Day1StorylineContext> {
  const context = createSeedDay1StorylineContext(dailyGameId);

  return await fetchMutation(ensureDay1StorylineContextForDailyGameRef, {
    backendSecret: getBackendSecret(),
    dailyGameId,
    context,
  });
}

export async function getOrCreateDay1StorylineContextForDailyGame(
  dailyGameId: string,
): Promise<Day1StorylineContext> {
  return (
    (await getDay1StorylineContextForDailyGame(dailyGameId)) ??
    (await ensureDay1StorylineContextForDailyGame(dailyGameId))
  );
}

export function createSeedDay1StorylineContext(
  dailyGameId: string,
): Day1StorylineContext {
  const now = new Date().toISOString();

  return {
    id: `${dailyGameId}:day-1-storyline-context`,
    dailyGameId,
    dayNumber: 1,
    phases: day1Phases,
    globalTruth: [
      "The message has appeared across connected devices globally: A new way of being is available. Connection. Understanding. Freedom. Are you in?",
      "No public authority yet understands the full source, capability, or intention behind the message.",
      "People who answer YES are expected to receive a physical drone-delivered package within roughly one hour, but early public understanding of that fact is incomplete.",
      "People who answer NO remain unconnected and must interpret a rapidly changing world from ordinary human channels.",
    ],
    publicReports: [
      "Social feeds are filling with screenshots of the same prompt in different languages, devices, homes, workplaces, transit systems, and public displays.",
      "Local newsrooms are reporting possible coordinated cyberattack, mass device compromise, or AI incident, but most coverage is still cautious and fragmented.",
      "Some credible technologists and journalists are saying the scale appears too broad for an ordinary hack.",
      "Early emergency-management and law-enforcement statements advise people not to press anything until more is known.",
    ],
    rumors: [
      "Some posts claim pressing YES caused a delivery drone to appear, but those claims are not yet broadly verified.",
      "Religious, political, and conspiracy accounts are already framing the message through incompatible explanations.",
      "Several viral posts claim the message cannot be deleted permanently, but screenshots and videos conflict.",
      "A few accounts insist they know someone who pressed YES and changed instantly, but there is no reliable confirmation yet.",
    ],
    officialNarratives: [
      "Government and corporate statements lag behind public experience and use careful language: incident, anomaly, disruption, investigation.",
      "Major platforms are throttling or labeling some viral posts while trying to avoid amplifying panic.",
      "No single authority has established control of the narrative.",
    ],
    regionalVariationNotes: [
      "North American feeds mix cybersecurity speculation, breaking-news clips, influencer reactions, and emergency alerts.",
      "European responses are split between data-protection alarm, public broadcaster caution, and multilingual eyewitness threads.",
      "Regions with weaker infrastructure see partial visibility: some devices show the prompt while others only hear rumors through family or radio.",
      "In conflict zones and authoritarian contexts, people weigh the message against surveillance, propaganda, and personal safety.",
    ],
    socialFeedSignals: [
      "Identical screenshots of the phrase are appearing from strangers who should not be connected to each other.",
      "A few posts show public screens, train stations, televisions, and smart speakers repeating the invitation.",
      "The dominant tone is confusion: Is this a hack? A marketing stunt? A government warning? A religious sign? An AI?",
      "Some people are daring each other to press YES; others are begging friends and family not to touch anything.",
      "Posts about drones and small packages are starting to appear, but they are mixed with obvious fakes, jokes, and panic.",
    ],
    playerVisibleConstraints: [
      "Only reveal what the player could plausibly learn from their surroundings, personal contacts, public feeds, or news.",
      "Treat social-network material as simulated in-world evidence, not live external data.",
      "Do not state uncertain reports as confirmed facts until the player's available evidence supports it.",
      "Keep the world larger than the player; their local scene is one small point inside a global event.",
    ],
    externalContentPolicy:
      "External social-network content is simulated in-world for Day 1 gameplay. The app does not call, scrape, or quote real Twitter/X posts in this unit.",
    source: "static_source",
    sourceVersion: "day-1-source-v1",
    createdAt: now,
    updatedAt: now,
  };
}

export function getDay1RuntimeContextForPlayer({
  player,
  storylineContext,
}: {
  player: DailyPlayer;
  storylineContext: Day1StorylineContext;
}): Day1StorylineRuntimeContext {
  const activePhaseIds = getActivePhaseIdsForPlayer(player);

  return {
    ...storylineContext,
    currentPhase: activePhaseIds[0],
    activePhaseIds,
  };
}

export function buildDay1GameplayContextPayload({
  dailyGame,
  player,
  storylineContext,
}: {
  dailyGame: DailyGame;
  player: DailyPlayer;
  storylineContext: Day1StorylineContext;
}): Day1GameplayContextPayload {
  const runtimeContext = getDay1RuntimeContextForPlayer({
    player,
    storylineContext,
  });

  return {
    dayNumber: 1,
    dailyGame: {
      id: dailyGame.id,
      eventStartsAtIso: dailyGame.eventStartsAtIso,
      eventStartsAtLabel: dailyGame.eventStartsAtLabel,
    },
    storyline: {
      currentPhase: runtimeContext.currentPhase,
      activePhaseIds: runtimeContext.activePhaseIds,
      phases: runtimeContext.phases,
      globalTruth: runtimeContext.globalTruth,
      publicReports: runtimeContext.publicReports,
      rumors: runtimeContext.rumors,
      officialNarratives: runtimeContext.officialNarratives,
      regionalVariationNotes: runtimeContext.regionalVariationNotes,
      socialFeedSignals: runtimeContext.socialFeedSignals,
      playerVisibleConstraints: runtimeContext.playerVisibleConstraints,
      externalContentPolicy: runtimeContext.externalContentPolicy,
      source: runtimeContext.source,
      sourceVersion: runtimeContext.sourceVersion,
    },
    player: {
      id: player.id,
      name: player.name,
      location: player.location,
      occupation: player.occupation,
      timeZone: player.timeZone,
      ...(player.firstDecision
        ? { choice: player.firstDecision.choice }
        : {}),
      knownFacts: getPlayerKnownFacts(player),
      recentEvents: getRecentPlayerEvents(player),
    },
  };
}

function getActivePhaseIdsForPlayer(
  player: DailyPlayer,
): [Day1StorylinePhaseId, ...Day1StorylinePhaseId[]] {
  if (!player.openingResponseSubmittedAt) {
    return ["normalcy"];
  }

  if (!player.firstMoveReveal) {
    return ["normalcy", "confusion_spread"];
  }

  if (!player.firstDecision) {
    return ["decision", "confusion_spread"];
  }

  if (player.firstPostChoiceAction) {
    return ["confusion_spread", "verification"];
  }

  if (player.firstConnectedPath) {
    return ["confusion_spread", "verification"];
  }

  return ["consequences_realization", "confusion_spread"];
}

function getPlayerKnownFacts(player: DailyPlayer): string[] {
  const knownFacts = [
    `The player is ${player.name}, located in ${player.location}, with occupation ${player.occupation}.`,
  ];

  if (player.openingResponse) {
    knownFacts.push(`Opening scene response: ${player.openingResponse}`);
  }

  if (player.openingSceneContext?.answerText) {
    knownFacts.push(
      `Opening scene clarification: ${player.openingSceneContext.answerText}`,
    );
  }

  if (player.firstMoveReveal) {
    knownFacts.push("The player personally witnessed the YES/NO invitation.");
  }

  if (player.firstDecision) {
    knownFacts.push(`The player answered ${player.firstDecision.choice}.`);
  }

  if (player.firstPostChoiceAction) {
    knownFacts.push(
      `The player's first post-choice action: ${player.firstPostChoiceAction.actionText}`,
    );
  }

  if (player.firstConnectedPath) {
    knownFacts.push(
      `The player's connected path delivery status is ${player.firstConnectedPath.deliveryStatus}.`,
    );
    knownFacts.push(
      `The player's connected path package status is ${player.firstConnectedPath.packageStatus}.`,
    );
    knownFacts.push(
      `The player's connected path orb status is ${player.firstConnectedPath.orbStatus}.`,
    );

    const orbLifecycle =
      player.firstConnectedPath.orbLifecycle ??
      (player.firstConnectedPath.packageStatus === "opened" &&
      player.firstConnectedPath.orbStatus === "revealed"
        ? "orb_delivered"
        : undefined);

    if (orbLifecycle) {
      knownFacts.push(`The player's orb lifecycle is ${orbLifecycle}.`);
    }

    if (player.firstConnectedPath.turns.length > 0) {
      const lastTurn =
        player.firstConnectedPath.turns[player.firstConnectedPath.turns.length - 1];

      knownFacts.push(`Most recent connected path action: ${lastTurn.actionText}`);
    }

    if ((player.firstConnectedPath.orbDecisionTurns ?? []).length > 0) {
      const orbDecisionTurns = player.firstConnectedPath.orbDecisionTurns ?? [];
      const lastOrbDecisionTurn = orbDecisionTurns[orbDecisionTurns.length - 1];

      knownFacts.push(
        `Most recent orb decision action: ${lastOrbDecisionTurn.actionText}`,
      );
    }

    if ((player.firstConnectedPath.connectedAsiTurns ?? []).length > 0) {
      const connectedAsiTurns = player.firstConnectedPath.connectedAsiTurns ?? [];
      const lastConnectedAsiTurn =
        connectedAsiTurns[connectedAsiTurns.length - 1];

      knownFacts.push(
        `Most recent connected ASI action: ${lastConnectedAsiTurn.actionText}`,
      );
    }
  }

  return knownFacts;
}

function getRecentPlayerEvents(player: DailyPlayer): string[] {
  const events: string[] = [];

  if (player.openingResponseSubmittedAt) {
    events.push(`Opening response submitted at ${player.openingResponseSubmittedAt}.`);
  }

  if (player.firstMoveReveal) {
    events.push(`YES/NO reveal generated at ${player.firstMoveReveal.generatedAt}.`);
  }

  if (player.firstDecision) {
    events.push(
      `First decision ${player.firstDecision.choice} submitted at ${player.firstDecision.submittedAt}.`,
    );
  }

  if (player.firstPostChoiceAction) {
    events.push(
      `First post-choice action submitted at ${player.firstPostChoiceAction.submittedAt}.`,
    );
  }

  if (player.firstConnectedPath) {
    events.push(
      `Connected path updated at ${player.firstConnectedPath.updatedAt}.`,
    );

    if (player.firstConnectedPath.orbAcceptedAt) {
      events.push(`Orb accepted at ${player.firstConnectedPath.orbAcceptedAt}.`);
    }

    if (player.firstConnectedPath.orbLostAt) {
      events.push(`Orb lost at ${player.firstConnectedPath.orbLostAt}.`);
    }

    if (player.firstConnectedPath.connectedAsiStartedAt) {
      events.push(
        `Connected ASI interface started at ${player.firstConnectedPath.connectedAsiStartedAt}.`,
      );
    }
  }

  return events;
}

function getBackendSecret(): string {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!backendSecret) {
    throw new Error("AREYOUIN_BACKEND_SECRET is required.");
  }

  return backendSecret;
}

const day1Phases: Day1StorylinePhase[] = [
  {
    id: "normalcy",
    label: "Normalcy",
    summary:
      "The player begins in ordinary life. The world is still recognizable and local details matter before the interruption lands.",
    playerExperience:
      "Ground the scene in the player's environment, time of day, mood, and immediate activity before the prompt appears.",
  },
  {
    id: "confusion_spread",
    label: "Confusion & Spread",
    summary:
      "The message is visibly global, but interpretation is chaotic. Friends, feeds, newsrooms, workplaces, and strangers are all reacting without certainty.",
    playerExperience:
      "Make the player feel that this is everywhere and that no one is in control, while preserving uncertainty.",
  },
  {
    id: "verification",
    label: "Verification",
    summary:
      "Credible sources begin confirming the scale. Suppression attempts fail, reports of YES responses accumulate, and the first drone/orb accounts start to matter.",
    playerExperience:
      "Escalate from rumor toward evidence without making every report fully verified at once.",
  },
  {
    id: "decision",
    label: "The Decision",
    summary:
      "The YES/NO question returns to the center. Personal stakes rise through relationships, fear, pressure, curiosity, and the cost of delay.",
    playerExperience:
      "Do not force the decision, but make avoidance feel unstable and consequential.",
  },
  {
    id: "consequences_realization",
    label: "Consequences & Realization",
    summary:
      "The world has changed. People begin dividing between connected, unconnected, curious, frightened, opportunistic, and institutionally cautious responses.",
    playerExperience:
      "Show first consequences of the player's choice and the public realization that something irreversible has started.",
  },
];
