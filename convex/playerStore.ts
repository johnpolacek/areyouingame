import { mutationGeneric, queryGeneric } from "convex/server";
import { ConvexError, v } from "convex/values";

const playerDraft = {
  name: v.string(),
  age: v.string(),
  location: v.string(),
  occupation: v.string(),
  bio: v.string(),
  timeZone: v.string(),
};

const firstMoveReveal = v.object({
  id: v.string(),
  sceneIntro: v.array(v.string()),
  revealCopy: v.object({
    availability: v.literal("A new way of being is available."),
    promise: v.literal("Connection. Understanding. Freedom."),
    question: v.literal("Are you in?"),
    yesLabel: v.literal("YES"),
    noLabel: v.literal("NO"),
    audioPrompt: v.literal("Please respond yes or no"),
  }),
  status: v.literal("yes_no_pending"),
  generatedAt: v.string(),
  model: v.string(),
  source: v.union(v.literal("ai"), v.literal("fallback")),
});

const firstDecisionConsequence = v.object({
  consequenceTitle: v.string(),
  consequenceBody: v.string(),
  consequenceModel: v.string(),
  consequenceSource: v.union(v.literal("ai"), v.literal("fallback")),
});

const firstDecision = v.object({
  id: v.string(),
  choice: v.union(v.literal("YES"), v.literal("NO")),
  status: v.literal("first_choice_submitted"),
  consequenceTitle: v.string(),
  consequenceBody: v.string(),
  consequenceModel: v.string(),
  consequenceSource: v.union(v.literal("ai"), v.literal("fallback")),
  revealId: v.string(),
  revealGeneratedAt: v.string(),
  revealModel: v.string(),
  revealSource: v.union(v.literal("ai"), v.literal("fallback")),
  submittedAt: v.string(),
});

const firstRevealTextResponse = v.object({
  id: v.string(),
  inputText: v.string(),
  classification: v.union(
    v.literal("YES"),
    v.literal("NO"),
    v.literal("DEFERRED"),
    v.literal("END_DAY"),
  ),
  model: v.string(),
  source: v.union(v.literal("ai"), v.literal("fallback")),
  submittedAt: v.string(),
  interruptionText: v.optional(v.string()),
  dayEndText: v.optional(v.string()),
});

const firstPostChoiceAction = v.object({
  id: v.string(),
  actionText: v.string(),
  submittedAt: v.string(),
  responseText: v.optional(v.string()),
  responseModel: v.optional(v.string()),
  responseSource: v.optional(v.literal("ai")),
  actionKind: v.optional(v.string()),
  playerVisibleFacts: v.optional(v.array(v.string())),
  storylineContextSourceVersion: v.optional(v.string()),
  resolvedAt: v.optional(v.string()),
});

const connectedDeliveryStatus = v.union(
  v.literal("pending"),
  v.literal("delivered"),
);

const connectedPackageStatus = v.union(
  v.literal("not_arrived"),
  v.literal("available"),
  v.literal("opened"),
);

const connectedOrbStatus = v.union(
  v.literal("unknown"),
  v.literal("revealed"),
);

const connectedOrbLifecycle = v.union(
  v.literal("orb_delivered"),
  v.literal("orb_accepted"),
  v.literal("orb_lost"),
);

const firstConnectedPathTurn = v.object({
  id: v.string(),
  turnNumber: v.number(),
  actionText: v.string(),
  responseText: v.string(),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  storylineContextSourceVersion: v.string(),
  deliveryStatus: connectedDeliveryStatus,
  packageStatus: connectedPackageStatus,
  orbStatus: connectedOrbStatus,
  resolvedAt: v.string(),
});

const firstOrbDecisionTurn = v.object({
  id: v.string(),
  turnNumber: v.number(),
  actionText: v.string(),
  responseText: v.string(),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  storylineContextSourceVersion: v.string(),
  orbLifecycle: connectedOrbLifecycle,
  resolvedAt: v.string(),
});

const firstConnectedPath = v.object({
  id: v.string(),
  status: v.union(
    v.literal("pre_delivery"),
    v.literal("package_available"),
    v.literal("orb_revealed"),
  ),
  deliveryStatus: connectedDeliveryStatus,
  packageStatus: connectedPackageStatus,
  orbStatus: connectedOrbStatus,
  orbLifecycle: v.optional(connectedOrbLifecycle),
  turnCount: v.number(),
  turns: v.array(firstConnectedPathTurn),
  orbDecisionTurns: v.optional(v.array(firstOrbDecisionTurn)),
  startedAt: v.string(),
  deliveredAt: v.optional(v.string()),
  openedAt: v.optional(v.string()),
  orbAcceptedAt: v.optional(v.string()),
  orbLostAt: v.optional(v.string()),
  updatedAt: v.string(),
});

const openingSceneContext = v.object({
  id: v.string(),
  scope: v.literal("opening_scene"),
  status: v.union(v.literal("question_pending"), v.literal("answered")),
  promptText: v.string(),
  reason: v.string(),
  source: v.union(v.literal("ai"), v.literal("fallback")),
  model: v.optional(v.string()),
  answerText: v.optional(v.string()),
  createdAt: v.string(),
  answeredAt: v.optional(v.string()),
});

const day1StorylinePhaseId = v.union(
  v.literal("normalcy"),
  v.literal("confusion_spread"),
  v.literal("verification"),
  v.literal("decision"),
  v.literal("consequences_realization"),
);

const day1StorylinePhase = v.object({
  id: day1StorylinePhaseId,
  label: v.string(),
  summary: v.string(),
  playerExperience: v.string(),
});

const day1StorylineContext = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  dayNumber: v.literal(1),
  phases: v.array(day1StorylinePhase),
  globalTruth: v.array(v.string()),
  publicReports: v.array(v.string()),
  rumors: v.array(v.string()),
  officialNarratives: v.array(v.string()),
  regionalVariationNotes: v.array(v.string()),
  socialFeedSignals: v.array(v.string()),
  playerVisibleConstraints: v.array(v.string()),
  externalContentPolicy: v.string(),
  source: v.union(v.literal("static_source"), v.literal("fallback")),
  sourceVersion: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const player = v.object({
  id: v.string(),
  clerkUserId: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  firstDecision: v.optional(firstDecision),
  firstRevealTextResponses: v.optional(v.array(firstRevealTextResponse)),
  firstPostChoiceAction: v.optional(firstPostChoiceAction),
  firstConnectedPath: v.optional(firstConnectedPath),
  firstMoveReveal: v.optional(firstMoveReveal),
  openingSceneContext: v.optional(openingSceneContext),
  openingResponse: v.optional(v.string()),
  openingResponseSubmittedAt: v.optional(v.string()),
  publicGameplayAgreementAcceptedAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const dailyGame = v.object({
  id: v.string(),
  eventStartsAtIso: v.string(),
  eventStartsAtLabel: v.string(),
});

const authenticatedArgs = {
  backendSecret: v.string(),
  clerkUserId: v.string(),
  dailyGameId: v.string(),
};

export const getPlayerForUserGame = queryGeneric({
  args: authenticatedArgs,
  returns: v.union(player, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayer(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    return existingPlayer ? toDailyPlayer(existingPlayer) : null;
  },
});

export const getDay1StorylineContextForDailyGame = queryGeneric({
  args: {
    backendSecret: v.string(),
    dailyGameId: v.string(),
  },
  returns: v.union(day1StorylineContext, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingContext = await findDay1StorylineContext(
      ctx,
      args.dailyGameId,
    );

    return existingContext ? toDay1StorylineContext(existingContext) : null;
  },
});

export const ensureDay1StorylineContextForDailyGame = mutationGeneric({
  args: {
    backendSecret: v.string(),
    dailyGameId: v.string(),
    context: day1StorylineContext,
  },
  returns: day1StorylineContext,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (args.context.dailyGameId !== args.dailyGameId) {
      throw new ConvexError("Storyline context daily game mismatch.");
    }

    const existingContext = await findDay1StorylineContext(
      ctx,
      args.dailyGameId,
    );
    const now = new Date().toISOString();

    if (existingContext) {
      await ctx.db.patch(existingContext._id, {
        ...args.context,
        createdAt: existingContext.createdAt,
        updatedAt: now,
      });

      return {
        ...args.context,
        createdAt: existingContext.createdAt,
        updatedAt: now,
      };
    }

    await ctx.db.insert("day1StorylineContexts", {
      ...args.context,
      createdAt: now,
      updatedAt: now,
    });

    return {
      ...args.context,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const createPlayerForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    dailyGame,
    draft: v.object(playerDraft),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);
    await ensureDailyGame(ctx, args.dailyGame);

    const existingPlayer = await findPlayer(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (existingPlayer) {
      return toDailyPlayer(existingPlayer);
    }

    const now = new Date().toISOString();
    const newPlayer = {
      ...args.draft,
      id: `${args.dailyGameId}:${args.clerkUserId}`,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      createdAt: now,
      updatedAt: now,
    };

    await ctx.db.insert("players", newPlayer);

    return toDailyPlayer(newPlayer);
  },
});

export const acceptPublicGameplayAgreement = mutationGeneric({
  args: authenticatedArgs,
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );
    const now = new Date().toISOString();
    const publicGameplayAgreementAcceptedAt =
      existingPlayer.publicGameplayAgreementAcceptedAt ?? now;

    await ctx.db.patch(existingPlayer._id, {
      publicGameplayAgreementAcceptedAt,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      publicGameplayAgreementAcceptedAt,
      updatedAt: now,
    });
  },
});

export const submitOpeningResponseForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    openingResponse: v.string(),
    openingSceneContext: v.optional(openingSceneContext),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.publicGameplayAgreementAcceptedAt) {
      throw new ConvexError("Public gameplay agreement is required first.");
    }

    if (existingPlayer.openingResponseSubmittedAt) {
      throw new ConvexError("Opening response has already been submitted.");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(existingPlayer._id, {
      ...(args.openingSceneContext
        ? { openingSceneContext: args.openingSceneContext }
        : {}),
      openingResponse: args.openingResponse,
      openingResponseSubmittedAt: now,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      ...(args.openingSceneContext
        ? { openingSceneContext: args.openingSceneContext }
        : {}),
      openingResponse: args.openingResponse,
      openingResponseSubmittedAt: now,
      updatedAt: now,
    });
  },
});

export const answerOpeningSceneContextForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    answerText: v.string(),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (!args.answerText.trim()) {
      throw new ConvexError("Answer is required.");
    }

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.openingSceneContext) {
      throw new ConvexError("Opening scene context question is not pending.");
    }

    if (existingPlayer.openingSceneContext.status === "answered") {
      return toDailyPlayer(existingPlayer);
    }

    const now = new Date().toISOString();
    const openingSceneContextRecord = {
      ...existingPlayer.openingSceneContext,
      status: "answered" as const,
      answerText: args.answerText,
      answeredAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      openingSceneContext: openingSceneContextRecord,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      openingSceneContext: openingSceneContextRecord,
      updatedAt: now,
    });
  },
});

export const saveFirstMoveRevealForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    reveal: firstMoveReveal,
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (
      !existingPlayer.openingResponseSubmittedAt ||
      !existingPlayer.openingResponse
    ) {
      throw new ConvexError("Opening response is required first.");
    }

    if (existingPlayer.firstMoveReveal) {
      return toDailyPlayer(existingPlayer);
    }

    await ctx.db.patch(existingPlayer._id, {
      firstMoveReveal: args.reveal,
      updatedAt: args.reveal.generatedAt,
    });

    return toDailyPlayer({
      ...existingPlayer,
      firstMoveReveal: args.reveal,
      updatedAt: args.reveal.generatedAt,
    });
  },
});

export const submitFirstDecisionForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    choice: v.union(v.literal("YES"), v.literal("NO")),
    consequence: v.optional(firstDecisionConsequence),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.firstMoveReveal) {
      throw new ConvexError("YES/NO reveal is required first.");
    }

    if (existingPlayer.firstDecision) {
      throw new ConvexError("YES/NO choice has already been submitted.");
    }

    const now = new Date().toISOString();
    const firstDecisionRecord = createFirstDecision({
      choice: args.choice,
      consequence: args.consequence,
      dailyGameId: args.dailyGameId,
      firstMoveReveal: existingPlayer.firstMoveReveal,
      playerId: existingPlayer.id,
      submittedAt: now,
    });

    await ctx.db.patch(existingPlayer._id, {
      firstDecision: firstDecisionRecord,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      firstDecision: firstDecisionRecord,
      updatedAt: now,
    });
  },
});

export const submitFirstRevealTextResponseForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    responseText: v.string(),
    classification: v.union(
      v.literal("YES"),
      v.literal("NO"),
      v.literal("DEFERRED"),
      v.literal("END_DAY"),
    ),
    model: v.string(),
    source: v.union(v.literal("ai"), v.literal("fallback")),
    interruptionText: v.optional(v.string()),
    dayEndText: v.optional(v.string()),
    consequence: v.optional(firstDecisionConsequence),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (!args.responseText.trim()) {
      throw new ConvexError("Response text is required.");
    }

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.firstMoveReveal) {
      throw new ConvexError("YES/NO reveal is required first.");
    }

    if (existingPlayer.firstDecision) {
      throw new ConvexError("YES/NO choice has already been submitted.");
    }

    const now = new Date().toISOString();
    const previousResponses = existingPlayer.firstRevealTextResponses ?? [];

    if (
      previousResponses.some(
        (response: { classification: string }) =>
          response.classification === "END_DAY",
      )
    ) {
      throw new ConvexError("Today's active play has already ended.");
    }

    const responseRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-reveal-text-response:${previousResponses.length + 1}`,
      inputText: args.responseText,
      classification: args.classification,
      model: args.model,
      source: args.source,
      submittedAt: now,
      ...(args.interruptionText
        ? { interruptionText: args.interruptionText }
        : {}),
      ...(args.dayEndText ? { dayEndText: args.dayEndText } : {}),
    };
    const firstRevealTextResponses = [...previousResponses, responseRecord];

    if (
      args.classification === "DEFERRED" ||
      args.classification === "END_DAY"
    ) {
      await ctx.db.patch(existingPlayer._id, {
        firstRevealTextResponses,
        updatedAt: now,
      });

      return toDailyPlayer({
        ...existingPlayer,
        firstRevealTextResponses,
        updatedAt: now,
      });
    }

    const firstDecisionRecord = createFirstDecision({
      choice: args.classification,
      consequence: args.consequence,
      dailyGameId: args.dailyGameId,
      firstMoveReveal: existingPlayer.firstMoveReveal,
      playerId: existingPlayer.id,
      submittedAt: now,
    });

    await ctx.db.patch(existingPlayer._id, {
      firstDecision: firstDecisionRecord,
      firstRevealTextResponses,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      firstDecision: firstDecisionRecord,
      firstRevealTextResponses,
      updatedAt: now,
    });
  },
});

export const submitFirstPostChoiceActionForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    storylineContextSourceVersion: v.string(),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (!args.actionText.trim()) {
      throw new ConvexError("Action text is required.");
    }

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.firstDecision) {
      throw new ConvexError("YES/NO choice is required first.");
    }

    if (existingPlayer.firstPostChoiceAction) {
      return toDailyPlayer(existingPlayer);
    }

    const now = new Date().toISOString();
    const firstPostChoiceActionRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-post-choice-action`,
      actionText: args.actionText,
      submittedAt: now,
      responseText: args.responseText,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      resolvedAt: now,
    };
    const eventRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:post-choice-turn-resolved`,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      eventType: "post_choice_turn_resolved" as const,
      sourceTurnId: firstPostChoiceActionRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      model: args.responseModel,
      source: args.responseSource,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      createdAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstPostChoiceAction: firstPostChoiceActionRecord,
      updatedAt: now,
    });
    await ctx.db.insert("gameplayEvents", eventRecord);

    return toDailyPlayer({
      ...existingPlayer,
      firstPostChoiceAction: firstPostChoiceActionRecord,
      updatedAt: now,
    });
  },
});

export const submitFirstConnectedPathTurnForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    storylineContextSourceVersion: v.string(),
    expectedTurnNumber: v.number(),
    status: v.union(
      v.literal("pre_delivery"),
      v.literal("package_available"),
      v.literal("orb_revealed"),
    ),
    deliveryStatus: connectedDeliveryStatus,
    packageStatus: connectedPackageStatus,
    orbStatus: connectedOrbStatus,
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (!args.actionText.trim()) {
      throw new ConvexError("Action text is required.");
    }

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.firstDecision) {
      throw new ConvexError("YES/NO choice is required first.");
    }

    if (existingPlayer.firstDecision.choice !== "YES") {
      throw new ConvexError("Connected path is only available after YES.");
    }

    const existingPath = existingPlayer.firstConnectedPath;
    const existingTurns = existingPath?.turns ?? [];

    if (existingTurns.length >= args.expectedTurnNumber) {
      return toDailyPlayer(existingPlayer);
    }

    if (existingTurns.length !== args.expectedTurnNumber - 1) {
      throw new ConvexError("Connected path turn is out of order.");
    }

    const now = new Date().toISOString();
    const turnRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-connected-path-turn:${args.expectedTurnNumber}`,
      turnNumber: args.expectedTurnNumber,
      actionText: args.actionText,
      responseText: args.responseText,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      deliveryStatus: args.deliveryStatus,
      packageStatus: args.packageStatus,
      orbStatus: args.orbStatus,
      resolvedAt: now,
    };
    const wasDelivered = existingPath?.deliveryStatus === "delivered";
    const wasOrbRevealed = existingPath?.orbStatus === "revealed";
    const orbLifecycle =
      args.packageStatus === "opened" && args.orbStatus === "revealed"
        ? (existingPath?.orbLifecycle ?? ("orb_delivered" as const))
        : existingPath?.orbLifecycle;
    const firstConnectedPathRecord = {
      id:
        existingPath?.id ??
        `${args.dailyGameId}:${existingPlayer.id}:first-connected-path`,
      status: args.status,
      deliveryStatus: args.deliveryStatus,
      packageStatus: args.packageStatus,
      orbStatus: args.orbStatus,
      ...(orbLifecycle ? { orbLifecycle } : {}),
      turnCount: args.expectedTurnNumber,
      turns: [...existingTurns, turnRecord],
      ...(existingPath?.orbDecisionTurns
        ? { orbDecisionTurns: existingPath.orbDecisionTurns }
        : {}),
      startedAt: existingPath?.startedAt ?? now,
      ...(existingPath?.deliveredAt
        ? { deliveredAt: existingPath.deliveredAt }
        : args.deliveryStatus === "delivered"
          ? { deliveredAt: now }
          : {}),
      ...(existingPath?.openedAt
        ? { openedAt: existingPath.openedAt }
        : args.orbStatus === "revealed"
          ? { openedAt: now }
          : {}),
      ...(existingPath?.orbAcceptedAt
        ? { orbAcceptedAt: existingPath.orbAcceptedAt }
        : {}),
      ...(existingPath?.orbLostAt ? { orbLostAt: existingPath.orbLostAt } : {}),
      updatedAt: now,
    };
    const baseEvent = {
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      sourceTurnId: turnRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      connectedDeliveryStatus: args.deliveryStatus,
      connectedPackageStatus: args.packageStatus,
      connectedOrbStatus: args.orbStatus,
      ...(orbLifecycle ? { connectedOrbLifecycle: orbLifecycle } : {}),
      model: args.responseModel,
      source: args.responseSource,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      createdAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstConnectedPath: firstConnectedPathRecord,
      updatedAt: now,
    });
    await ctx.db.insert("gameplayEvents", {
      ...baseEvent,
      id: `${turnRecord.id}:connected-path-turn-resolved`,
      eventType:
        args.expectedTurnNumber === 1
          ? ("connected_path_started" as const)
          : ("connected_path_turn_resolved" as const),
    });

    if (!wasDelivered && args.deliveryStatus === "delivered") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:package-received`,
        eventType: "package_received" as const,
      });
    }

    if (!wasOrbRevealed && args.orbStatus === "revealed") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-revealed`,
        eventType: "orb_revealed" as const,
      });
    }

    return toDailyPlayer({
      ...existingPlayer,
      firstConnectedPath: firstConnectedPathRecord,
      updatedAt: now,
    });
  },
});

export const submitFirstOrbDecisionTurnForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    storylineContextSourceVersion: v.string(),
    expectedTurnNumber: v.number(),
    orbLifecycle: connectedOrbLifecycle,
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    if (!args.actionText.trim()) {
      throw new ConvexError("Action text is required.");
    }

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer.firstDecision) {
      throw new ConvexError("YES/NO choice is required first.");
    }

    if (existingPlayer.firstDecision.choice !== "YES") {
      throw new ConvexError("Orb decision is only available after YES.");
    }

    const existingPath = existingPlayer.firstConnectedPath;

    if (
      !existingPath ||
      existingPath.packageStatus !== "opened" ||
      existingPath.orbStatus !== "revealed"
    ) {
      throw new ConvexError("The orb is not available yet.");
    }

    const currentLifecycle =
      existingPath.orbLifecycle ?? ("orb_delivered" as const);

    if (
      currentLifecycle === "orb_accepted" ||
      currentLifecycle === "orb_lost"
    ) {
      return toDailyPlayer(existingPlayer);
    }

    const existingOrbDecisionTurns = existingPath.orbDecisionTurns ?? [];

    if (existingOrbDecisionTurns.length >= args.expectedTurnNumber) {
      return toDailyPlayer(existingPlayer);
    }

    if (existingOrbDecisionTurns.length !== args.expectedTurnNumber - 1) {
      throw new ConvexError("Orb decision turn is out of order.");
    }

    const now = new Date().toISOString();
    const turnRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-orb-decision-turn:${args.expectedTurnNumber}`,
      turnNumber: args.expectedTurnNumber,
      actionText: args.actionText,
      responseText: args.responseText,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      orbLifecycle: args.orbLifecycle,
      resolvedAt: now,
    };
    const firstConnectedPathRecord = {
      ...existingPath,
      orbLifecycle: args.orbLifecycle,
      orbDecisionTurns: [...existingOrbDecisionTurns, turnRecord],
      ...(args.orbLifecycle === "orb_accepted" ? { orbAcceptedAt: now } : {}),
      ...(args.orbLifecycle === "orb_lost" ? { orbLostAt: now } : {}),
      updatedAt: now,
    };
    const baseEvent = {
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      sourceTurnId: turnRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      connectedDeliveryStatus: existingPath.deliveryStatus,
      connectedPackageStatus: existingPath.packageStatus,
      connectedOrbStatus: existingPath.orbStatus,
      connectedOrbLifecycle: args.orbLifecycle,
      model: args.responseModel,
      source: args.responseSource,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      createdAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstConnectedPath: firstConnectedPathRecord,
      updatedAt: now,
    });
    await ctx.db.insert("gameplayEvents", {
      ...baseEvent,
      id: `${turnRecord.id}:orb-action-resolved`,
      eventType: "orb_action_resolved" as const,
    });

    if (args.orbLifecycle === "orb_accepted") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-accepted`,
        eventType: "orb_accepted" as const,
      });
    }

    if (args.orbLifecycle === "orb_lost") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-lost`,
        eventType: "orb_lost" as const,
      });
    }

    return toDailyPlayer({
      ...existingPlayer,
      firstConnectedPath: firstConnectedPathRecord,
      updatedAt: now,
    });
  },
});

export const deletePlayerForUserGame = mutationGeneric({
  args: authenticatedArgs,
  returns: v.boolean(),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayer(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer) {
      return false;
    }

    await ctx.db.delete(existingPlayer._id);

    return true;
  },
});

export const resetPlayerDayForUserGame = mutationGeneric({
  args: authenticatedArgs,
  returns: v.boolean(),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayer(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    if (!existingPlayer) {
      return false;
    }

    const now = new Date().toISOString();

    await ctx.db.patch(existingPlayer._id, {
      firstDecision: undefined,
      firstRevealTextResponses: undefined,
      firstPostChoiceAction: undefined,
      firstConnectedPath: undefined,
      firstMoveReveal: undefined,
      openingSceneContext: undefined,
      openingResponse: undefined,
      openingResponseSubmittedAt: undefined,
      updatedAt: now,
    });

    return true;
  },
});

async function ensureDailyGame(
  ctx: any,
  game: {
    id: string;
    eventStartsAtIso: string;
    eventStartsAtLabel: string;
  },
) {
  const existingGame = await ctx.db
    .query("dailyGames")
    .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", game.id))
    .unique();

  const now = new Date().toISOString();

  if (existingGame) {
    await ctx.db.patch(existingGame._id, {
      eventStartsAtIso: game.eventStartsAtIso,
      eventStartsAtLabel: game.eventStartsAtLabel,
      updatedAt: now,
    });
    return;
  }

  await ctx.db.insert("dailyGames", {
    dailyGameId: game.id,
    eventStartsAtIso: game.eventStartsAtIso,
    eventStartsAtLabel: game.eventStartsAtLabel,
    createdAt: now,
    updatedAt: now,
  });
}

async function findPlayer(
  ctx: any,
  clerkUserId: string,
  dailyGameId: string,
) {
  return await ctx.db
    .query("players")
    .withIndex("by_clerkUserId_and_dailyGameId", (q: any) =>
      q.eq("clerkUserId", clerkUserId).eq("dailyGameId", dailyGameId),
    )
    .unique();
}

async function findDay1StorylineContext(ctx: any, dailyGameId: string) {
  return await ctx.db
    .query("day1StorylineContexts")
    .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
    .first();
}

async function findPlayerOrThrow(
  ctx: any,
  clerkUserId: string,
  dailyGameId: string,
) {
  const existingPlayer = await findPlayer(ctx, clerkUserId, dailyGameId);

  if (!existingPlayer) {
    throw new ConvexError("Player not found.");
  }

  return existingPlayer;
}

function requireBackendSecret(secret: string) {
  const expectedSecret = process.env.AREYOUIN_BACKEND_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    throw new ConvexError("Unauthorized backend mutation.");
  }
}

function createFirstDecision({
  choice,
  consequence: providedConsequence,
  dailyGameId,
  firstMoveReveal,
  playerId,
  submittedAt,
}: {
  choice: "YES" | "NO";
  consequence?: {
    consequenceTitle: string;
    consequenceBody: string;
    consequenceModel: string;
    consequenceSource: "ai" | "fallback";
  };
  dailyGameId: string;
  firstMoveReveal: {
    id: string;
    generatedAt: string;
    model: string;
    source: "ai" | "fallback";
  };
  playerId: string;
  submittedAt: string;
}) {
  const resolvedConsequence =
    providedConsequence ??
    (choice === "YES"
      ? {
          consequenceTitle: "",
          consequenceBody:
            "The message clears. Nothing obvious arrives to replace it, and the day resumes around whatever you were doing before it appeared.",
          consequenceModel: "deterministic-stage-05",
          consequenceSource: "fallback" as const,
        }
      : {
          consequenceTitle: "",
          consequenceBody:
            "The message disappears. Everything returns to normal, and the day resumes around whatever you were doing before it arrived.",
          consequenceModel: "deterministic-stage-05",
          consequenceSource: "fallback" as const,
        });

  return {
    id: `${dailyGameId}:${playerId}:first-decision`,
    choice,
    status: "first_choice_submitted" as const,
    ...resolvedConsequence,
    revealId: firstMoveReveal.id,
    revealGeneratedAt: firstMoveReveal.generatedAt,
    revealModel: firstMoveReveal.model,
    revealSource: firstMoveReveal.source,
    submittedAt,
  };
}

function toDailyPlayer(source: any) {
  return {
    id: source.id,
    clerkUserId: source.clerkUserId,
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    timeZone: source.timeZone,
    ...(source.firstDecision
      ? { firstDecision: source.firstDecision }
      : {}),
    ...(source.firstRevealTextResponses
      ? { firstRevealTextResponses: source.firstRevealTextResponses }
      : {}),
    ...(source.firstPostChoiceAction
      ? { firstPostChoiceAction: source.firstPostChoiceAction }
      : {}),
    ...(source.firstConnectedPath
      ? { firstConnectedPath: source.firstConnectedPath }
      : {}),
    ...(source.firstMoveReveal
      ? { firstMoveReveal: source.firstMoveReveal }
      : {}),
    ...(source.openingSceneContext
      ? { openingSceneContext: source.openingSceneContext }
      : {}),
    ...(source.openingResponse
      ? { openingResponse: source.openingResponse }
      : {}),
    ...(source.openingResponseSubmittedAt
      ? { openingResponseSubmittedAt: source.openingResponseSubmittedAt }
      : {}),
    ...(source.publicGameplayAgreementAcceptedAt
      ? {
          publicGameplayAgreementAcceptedAt:
            source.publicGameplayAgreementAcceptedAt,
        }
      : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toDay1StorylineContext(source: any) {
  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    dayNumber: source.dayNumber,
    phases: source.phases,
    globalTruth: source.globalTruth,
    publicReports: source.publicReports,
    rumors: source.rumors,
    officialNarratives: source.officialNarratives,
    regionalVariationNotes: source.regionalVariationNotes,
    socialFeedSignals: source.socialFeedSignals,
    playerVisibleConstraints: source.playerVisibleConstraints,
    externalContentPolicy: source.externalContentPolicy,
    source: source.source,
    sourceVersion: source.sourceVersion,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}
