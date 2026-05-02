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

const characterInfoSource = v.union(
  v.literal("draft"),
  v.literal("ai"),
  v.literal("player_correction"),
);

const characterInfoSectionKey = v.union(
  v.literal("currentSituation"),
  v.literal("relationships"),
  v.literal("resources"),
  v.literal("constraints"),
  v.literal("goals"),
  v.literal("knowledge"),
  v.literal("openThreads"),
  v.literal("recentChanges"),
);

const characterInfoItem = v.object({
  id: v.string(),
  text: v.string(),
  updatedAt: v.string(),
  source: characterInfoSource,
  sourceTurnId: v.optional(v.string()),
});

const characterInfoCorrection = v.object({
  id: v.string(),
  section: characterInfoSectionKey,
  itemId: v.string(),
  previousText: v.optional(v.string()),
  text: v.string(),
  updatedAt: v.string(),
});

const characterInfoSections = v.object({
  currentSituation: v.optional(v.array(characterInfoItem)),
  relationships: v.optional(v.array(characterInfoItem)),
  resources: v.optional(v.array(characterInfoItem)),
  constraints: v.optional(v.array(characterInfoItem)),
  goals: v.optional(v.array(characterInfoItem)),
  knowledge: v.optional(v.array(characterInfoItem)),
  openThreads: v.optional(v.array(characterInfoItem)),
  recentChanges: v.optional(v.array(characterInfoItem)),
});

const characterInfo = v.object({
  sections: characterInfoSections,
  corrections: v.optional(v.array(characterInfoCorrection)),
  updatedAt: v.string(),
});

const characterInfoUpdate = v.object({
  section: characterInfoSectionKey,
  operation: v.union(
    v.literal("add"),
    v.literal("replace"),
    v.literal("remove"),
  ),
  itemId: v.optional(v.string()),
  targetText: v.optional(v.string()),
  text: v.optional(v.string()),
});

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
  sceneTitle: v.optional(v.string()),
  responseModel: v.optional(v.string()),
  responseSource: v.optional(v.literal("ai")),
  actionKind: v.optional(v.string()),
  playerVisibleFacts: v.optional(v.array(v.string())),
  characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
  storylineContextSourceVersion: v.optional(v.string()),
  resolvedAt: v.optional(v.string()),
});

const firstPostChoiceTurn = v.object({
  id: v.string(),
  turnNumber: v.number(),
  actionText: v.string(),
  submittedAt: v.string(),
  responseText: v.string(),
  sceneTitle: v.string(),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
  storylineContextSourceVersion: v.string(),
  resolvedAt: v.string(),
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
  sceneTitle: v.optional(v.string()),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
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
  sceneTitle: v.optional(v.string()),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
  storylineContextSourceVersion: v.string(),
  orbLifecycle: connectedOrbLifecycle,
  resolvedAt: v.string(),
});

const firstConnectedAsiTurn = v.object({
  id: v.string(),
  turnNumber: v.number(),
  actionText: v.string(),
  responseText: v.string(),
  sceneTitle: v.optional(v.string()),
  responseModel: v.string(),
  responseSource: v.literal("ai"),
  actionKind: v.string(),
  playerVisibleFacts: v.array(v.string()),
  characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
  storylineContextSourceVersion: v.string(),
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
  connectedAsiTurns: v.optional(v.array(firstConnectedAsiTurn)),
  startedAt: v.string(),
  deliveredAt: v.optional(v.string()),
  openedAt: v.optional(v.string()),
  orbAcceptedAt: v.optional(v.string()),
  orbLostAt: v.optional(v.string()),
  connectedAsiStartedAt: v.optional(v.string()),
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

const aiUsageStatus = v.union(v.literal("success"), v.literal("error"));

const aiUsageEvent = v.object({
  id: v.string(),
  provider: v.literal("openai"),
  model: v.string(),
  operation: v.string(),
  dailyGameId: v.optional(v.string()),
  playerId: v.optional(v.string()),
  clerkUserId: v.optional(v.string()),
  inputTokens: v.number(),
  cachedInputTokens: v.number(),
  outputTokens: v.number(),
  reasoningTokens: v.number(),
  totalTokens: v.number(),
  estimatedCostUsd: v.number(),
  pricingSourceUrl: v.string(),
  pricingEffectiveDate: v.string(),
  status: aiUsageStatus,
  errorType: v.optional(v.string()),
  createdAt: v.string(),
});

const playerTurnImageStatus = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("ready"),
  v.literal("error"),
);

const playerTurnImageKind = v.union(
  v.literal("post_choice_turn"),
  v.literal("connected_path_turn"),
  v.literal("orb_decision_turn"),
  v.literal("connected_asi_turn"),
);

const playerTurnImage = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  playerId: v.string(),
  clerkUserId: v.string(),
  sourceTurnId: v.string(),
  sourceTurnKind: playerTurnImageKind,
  status: playerTurnImageStatus,
  prompt: v.optional(v.string()),
  promptModel: v.optional(v.string()),
  imageModel: v.optional(v.string()),
  quality: v.optional(v.literal("low")),
  size: v.optional(v.literal("1024x1024")),
  bucket: v.optional(v.string()),
  objectKey: v.optional(v.string()),
  contentType: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
  generatedAt: v.optional(v.string()),
});

const publicPlayerTurnImage = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  playerId: v.string(),
  sourceTurnId: v.string(),
  sourceTurnKind: playerTurnImageKind,
  status: playerTurnImageStatus,
  prompt: v.optional(v.string()),
  promptModel: v.optional(v.string()),
  imageModel: v.optional(v.string()),
  quality: v.optional(v.literal("low")),
  size: v.optional(v.literal("1024x1024")),
  bucket: v.optional(v.string()),
  objectKey: v.optional(v.string()),
  contentType: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
  generatedAt: v.optional(v.string()),
});

const publicCharacterSnapshot = v.object({
  name: v.string(),
  age: v.string(),
  location: v.string(),
  occupation: v.string(),
  bio: v.string(),
});

const publicActivityPlaytestMetadata = v.object({
  synthetic: v.literal(true),
  build: v.optional(v.string()),
  persona: v.optional(v.string()),
  scenario: v.optional(v.string()),
  run: v.optional(v.string()),
});

const publicActivityEventKind = v.union(
  v.literal("opening_response_submitted"),
  v.literal("opening_context_answered"),
  v.literal("first_reveal_presented"),
  v.literal("first_choice_submitted"),
  v.literal("first_reveal_text_response_submitted"),
  v.literal("post_choice_turn_resolved"),
  v.literal("connected_path_turn_resolved"),
  v.literal("package_received"),
  v.literal("orb_revealed"),
  v.literal("orb_action_resolved"),
  v.literal("orb_accepted"),
  v.literal("orb_lost"),
  v.literal("connected_asi_interaction_resolved"),
);

const publicActivityEvent = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  createdAt: v.string(),
  character: publicCharacterSnapshot,
  eventKind: publicActivityEventKind,
  gameText: v.optional(v.string()),
  playerInput: v.optional(v.string()),
  choice: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
  narratorResponse: v.optional(v.string()),
  sceneTitle: v.optional(v.string()),
  playtest: v.optional(publicActivityPlaytestMetadata),
});

const publicLiveGameSummary = v.object({
  dailyGameId: v.string(),
  eventStartsAtIso: v.string(),
  eventStartsAtLabel: v.string(),
  playerCount: v.number(),
  activityCount: v.number(),
  lastActivityAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const publicLivePlayerSummary = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  name: v.string(),
  age: v.string(),
  location: v.string(),
  occupation: v.string(),
  bio: v.string(),
  choice: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
  turnCount: v.number(),
  lastActivityAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const publicLivePlayer = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  characterInfo: v.optional(characterInfo),
  firstDecision: v.optional(firstDecision),
  firstRevealTextResponses: v.optional(v.array(firstRevealTextResponse)),
  firstPostChoiceAction: v.optional(firstPostChoiceAction),
  firstPostChoiceTurns: v.optional(v.array(firstPostChoiceTurn)),
  firstConnectedPath: v.optional(firstConnectedPath),
  firstMoveReveal: v.optional(firstMoveReveal),
  openingSceneContext: v.optional(openingSceneContext),
  openingResponse: v.optional(v.string()),
  openingResponseSubmittedAt: v.optional(v.string()),
  publicGameplayAgreementAcceptedAt: v.optional(v.string()),
  turnImages: v.optional(v.array(publicPlayerTurnImage)),
  createdAt: v.string(),
  updatedAt: v.string(),
});

const player = v.object({
  id: v.string(),
  clerkUserId: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  characterInfo: v.optional(characterInfo),
  firstDecision: v.optional(firstDecision),
  firstRevealTextResponses: v.optional(v.array(firstRevealTextResponse)),
  firstPostChoiceAction: v.optional(firstPostChoiceAction),
  firstPostChoiceTurns: v.optional(v.array(firstPostChoiceTurn)),
  firstConnectedPath: v.optional(firstConnectedPath),
  firstMoveReveal: v.optional(firstMoveReveal),
  openingSceneContext: v.optional(openingSceneContext),
  openingResponse: v.optional(v.string()),
  openingResponseSubmittedAt: v.optional(v.string()),
  publicGameplayAgreementAcceptedAt: v.optional(v.string()),
  turnImages: v.optional(v.array(playerTurnImage)),
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

export const getDailyGameStats = queryGeneric({
  args: {
    backendSecret: v.string(),
    dailyGameId: v.string(),
  },
  returns: v.object({
    playerCount: v.number(),
    totalMessages: v.number(),
  }),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const players = await ctx.db
      .query("players")
      .withIndex("by_dailyGameId", (q) => q.eq("dailyGameId", args.dailyGameId))
      .collect();
    const gameplayEvents = await ctx.db
      .query("gameplayEvents")
      .withIndex("by_dailyGameId", (q) => q.eq("dailyGameId", args.dailyGameId))
      .collect();

    return {
      playerCount: players.length,
      totalMessages: new Set(
        gameplayEvents.map((event) => event.sourceTurnId),
      ).size,
    };
  },
});

export const getPublicActivityEvents = queryGeneric({
  args: {
    dailyGameId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(publicActivityEvent),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 80, 1), 200);
    const events = args.dailyGameId
      ? await ctx.db
          .query("publicActivityEvents")
          .withIndex("by_dailyGameId_and_createdAt", (q) =>
            q.eq("dailyGameId", args.dailyGameId),
          )
          .order("desc")
          .take(limit)
      : await ctx.db
          .query("publicActivityEvents")
          .withIndex("by_createdAt")
          .order("desc")
          .take(limit);

    return events.map(toPublicActivityEvent);
  },
});

export const getPublicLiveGameSummaries = queryGeneric({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(publicLiveGameSummary),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const games = await ctx.db.query("dailyGames").collect();
    const summaries = await Promise.all(
      games.map(async (game) => {
        const players = await ctx.db
          .query("players")
          .withIndex("by_dailyGameId", (q) =>
            q.eq("dailyGameId", game.dailyGameId),
          )
          .collect();
        const activity = await ctx.db
          .query("publicActivityEvents")
          .withIndex("by_dailyGameId_and_createdAt", (q) =>
            q.eq("dailyGameId", game.dailyGameId),
          )
          .order("desc")
          .collect();

        return {
          dailyGameId: game.dailyGameId,
          eventStartsAtIso: game.eventStartsAtIso,
          eventStartsAtLabel: game.eventStartsAtLabel,
          playerCount: players.length,
          activityCount: activity.length,
          ...(activity[0]?.createdAt
            ? { lastActivityAt: activity[0].createdAt }
            : {}),
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
        };
      }),
    );

    return summaries
      .sort((a, b) =>
        (b.lastActivityAt ?? b.eventStartsAtIso).localeCompare(
          a.lastActivityAt ?? a.eventStartsAtIso,
        ),
      )
      .slice(0, limit);
  },
});

export const getPublicLivePlayersForGame = queryGeneric({
  args: {
    dailyGameId: v.string(),
  },
  returns: v.array(publicLivePlayerSummary),
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_dailyGameId", (q) => q.eq("dailyGameId", args.dailyGameId))
      .collect();

    return players
      .map((source) => toPublicLivePlayerSummary(source))
      .sort((a, b) =>
        (b.lastActivityAt ?? b.updatedAt).localeCompare(
          a.lastActivityAt ?? a.updatedAt,
        ),
      );
  },
});

export const getPublicLivePlayer = queryGeneric({
  args: {
    dailyGameId: v.string(),
    playerId: v.string(),
  },
  returns: v.union(publicLivePlayer, v.null()),
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_dailyGameId", (q) => q.eq("dailyGameId", args.dailyGameId))
      .collect();
    const selectedPlayer = players.find(
      (candidate) => candidate.id === args.playerId,
    );

    if (!selectedPlayer) {
      return null;
    }

    const turnImages = await ctx.db
      .query("playerTurnImages")
      .withIndex("by_playerId", (q) => q.eq("playerId", selectedPlayer.id))
      .collect();

    return toPublicLivePlayer({ ...selectedPlayer, turnImages });
  },
});

export const getAiUsageEventsForAdmin = queryGeneric({
  args: {
    backendSecret: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(aiUsageEvent),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const events = await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_createdAt")
      .order("desc")
      .take(Math.min(Math.max(args.limit ?? 200, 1), 2000));

    return events.map(toAiUsageEvent);
  },
});

export const getPlayerTurnImagesForUserGame = queryGeneric({
  args: authenticatedArgs,
  returns: v.array(playerTurnImage),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );

    return await ctx.db
      .query("playerTurnImages")
      .withIndex("by_playerId", (q) => q.eq("playerId", existingPlayer.id))
      .collect();
  },
});

export const getPlayerTurnImageForUserGame = queryGeneric({
  args: {
    ...authenticatedArgs,
    sourceTurnId: v.string(),
  },
  returns: v.union(playerTurnImage, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );
    const image = await findPlayerTurnImage(ctx, args.sourceTurnId);

    if (!image || image.playerId !== existingPlayer.id) {
      return null;
    }

    return image;
  },
});

export const getPublicPlayerTurnImage = queryGeneric({
  args: {
    sourceTurnId: v.string(),
  },
  returns: v.union(publicPlayerTurnImage, v.null()),
  handler: async (ctx, args) => {
    const image = await findPlayerTurnImage(ctx, args.sourceTurnId);

    if (!image || image.status !== "ready") {
      return null;
    }

    return toPublicPlayerTurnImage(image, { includeStorage: true });
  },
});

export const claimPlayerTurnImageGeneration = mutationGeneric({
  args: {
    ...authenticatedArgs,
    sourceTurnId: v.string(),
  },
  returns: v.union(playerTurnImage, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );
    const image = await findPlayerTurnImage(ctx, args.sourceTurnId);

    if (!image || image.playerId !== existingPlayer.id) {
      return null;
    }

    if (image.status === "ready" || image.status === "generating") {
      return image;
    }

    const now = new Date().toISOString();
    const nextImage = {
      ...image,
      status: "generating" as const,
      errorMessage: undefined,
      updatedAt: now,
    };

    await ctx.db.patch(image._id, {
      status: nextImage.status,
      errorMessage: undefined,
      updatedAt: now,
    });

    return nextImage;
  },
});

export const completePlayerTurnImageGeneration = mutationGeneric({
  args: {
    backendSecret: v.string(),
    sourceTurnId: v.string(),
    prompt: v.string(),
    promptModel: v.string(),
    imageModel: v.string(),
    bucket: v.string(),
    objectKey: v.string(),
    contentType: v.string(),
  },
  returns: v.union(playerTurnImage, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const image = await findPlayerTurnImage(ctx, args.sourceTurnId);

    if (!image) {
      return null;
    }

    const now = new Date().toISOString();
    const nextImage = {
      ...image,
      status: "ready" as const,
      prompt: args.prompt,
      promptModel: args.promptModel,
      imageModel: args.imageModel,
      quality: "low" as const,
      size: "1024x1024" as const,
      bucket: args.bucket,
      objectKey: args.objectKey,
      contentType: args.contentType,
      errorMessage: undefined,
      updatedAt: now,
      generatedAt: now,
    };

    await ctx.db.patch(image._id, {
      status: nextImage.status,
      prompt: args.prompt,
      promptModel: args.promptModel,
      imageModel: args.imageModel,
      quality: nextImage.quality,
      size: nextImage.size,
      bucket: args.bucket,
      objectKey: args.objectKey,
      contentType: args.contentType,
      errorMessage: undefined,
      updatedAt: now,
      generatedAt: now,
    });

    return nextImage;
  },
});

export const failPlayerTurnImageGeneration = mutationGeneric({
  args: {
    backendSecret: v.string(),
    sourceTurnId: v.string(),
    errorMessage: v.string(),
  },
  returns: v.union(playerTurnImage, v.null()),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const image = await findPlayerTurnImage(ctx, args.sourceTurnId);

    if (!image) {
      return null;
    }

    const now = new Date().toISOString();
    const nextImage = {
      ...image,
      status: "error" as const,
      errorMessage: args.errorMessage,
      updatedAt: now,
    };

    await ctx.db.patch(image._id, {
      status: nextImage.status,
      errorMessage: args.errorMessage,
      updatedAt: now,
    });

    return nextImage;
  },
});

export const recordAiUsageEvent = mutationGeneric({
  args: {
    backendSecret: v.string(),
    event: aiUsageEvent,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    await ctx.db.insert("aiUsageEvents", args.event);

    return null;
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
    const characterInfoRecord = createInitialCharacterInfo(args.draft, now);
    const newPlayer = {
      ...args.draft,
      id: `${args.dailyGameId}:${args.clerkUserId}`,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      characterInfo: characterInfoRecord,
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
    await insertPublicActivityEvent(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "opening_response_submitted",
      gameText: "Where are you and what are you doing?",
      id: `${args.dailyGameId}:${existingPlayer.id}:public:opening-response`,
      player: existingPlayer,
      playerInput: args.openingResponse,
      createdAt: now,
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
    await insertPublicActivityEvent(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "opening_context_answered",
      gameText: existingPlayer.openingSceneContext.promptText,
      id: `${args.dailyGameId}:${existingPlayer.id}:public:opening-context-answer`,
      player: existingPlayer,
      playerInput: args.answerText,
      createdAt: now,
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
    await insertPublicActivityEvent(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "first_reveal_presented",
      gameText: "Are you in?",
      id: `${args.dailyGameId}:${existingPlayer.id}:public:first-reveal`,
      narratorResponse: [
        ...args.reveal.sceneIntro,
        args.reveal.revealCopy.availability,
        args.reveal.revealCopy.promise,
        args.reveal.revealCopy.question,
      ].join("\n\n"),
      player: existingPlayer,
      sceneTitle: "First reveal",
      createdAt: args.reveal.generatedAt,
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
    await insertPublicActivityEvent(ctx, {
      choice: args.choice,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "first_choice_submitted",
      gameText: "Are you in?",
      id: `${args.dailyGameId}:${existingPlayer.id}:public:first-choice`,
      narratorResponse: firstDecisionRecord.consequenceBody,
      player: existingPlayer,
      sceneTitle: firstDecisionRecord.consequenceTitle || "Choice recorded",
      createdAt: now,
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
      await insertPublicActivityEvent(ctx, {
        clerkUserId: args.clerkUserId,
        dailyGameId: args.dailyGameId,
        eventKind: "first_reveal_text_response_submitted",
        gameText: "Please respond yes or no.",
        id: `${responseRecord.id}:public`,
        narratorResponse:
          args.interruptionText ?? args.dayEndText ?? undefined,
        player: existingPlayer,
        playerInput: args.responseText,
        createdAt: now,
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
    await insertPublicActivityEvent(ctx, {
      choice: args.classification,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "first_reveal_text_response_submitted",
      gameText: "Please respond yes or no.",
      id: `${responseRecord.id}:public`,
      narratorResponse: firstDecisionRecord.consequenceBody,
      player: existingPlayer,
      playerInput: args.responseText,
      sceneTitle: firstDecisionRecord.consequenceTitle || "Choice recorded",
      createdAt: now,
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
    sceneTitle: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
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

    if (existingPlayer.firstDecision.choice !== "NO") {
      throw new ConvexError("Post-choice investigation is only available after NO.");
    }

    const legacyFirstTurn =
      existingPlayer.firstPostChoiceAction?.responseText &&
      !existingPlayer.firstPostChoiceTurns
        ? [
            {
              ...existingPlayer.firstPostChoiceAction,
              turnNumber: 1,
              responseText: existingPlayer.firstPostChoiceAction.responseText,
              sceneTitle:
                existingPlayer.firstPostChoiceAction.sceneTitle ??
                "The World Answers",
              responseModel:
                existingPlayer.firstPostChoiceAction.responseModel ?? "unknown",
              responseSource:
                existingPlayer.firstPostChoiceAction.responseSource ?? "ai",
              actionKind:
                existingPlayer.firstPostChoiceAction.actionKind ??
                "open_world_action",
              playerVisibleFacts:
                existingPlayer.firstPostChoiceAction.playerVisibleFacts ?? [],
              storylineContextSourceVersion:
                existingPlayer.firstPostChoiceAction
                  .storylineContextSourceVersion ?? "unknown",
              resolvedAt:
                existingPlayer.firstPostChoiceAction.resolvedAt ??
                existingPlayer.firstPostChoiceAction.submittedAt,
            },
          ]
        : [];
    const existingTurns =
      existingPlayer.firstPostChoiceTurns ?? legacyFirstTurn;
    const turnNumber = existingTurns.length + 1;

    const now = new Date().toISOString();
    const firstPostChoiceActionRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-post-choice-action:${turnNumber}`,
      turnNumber,
      actionText: args.actionText,
      submittedAt: now,
      responseText: args.responseText,
      sceneTitle: args.sceneTitle,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      ...(args.characterInfoUpdates
        ? { characterInfoUpdates: args.characterInfoUpdates }
        : {}),
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      resolvedAt: now,
    };
    const firstPostChoiceTurns = [
      ...existingTurns,
      firstPostChoiceActionRecord,
    ];
    const firstPostChoiceActionSnapshot = {
      id: firstPostChoiceActionRecord.id,
      actionText: firstPostChoiceActionRecord.actionText,
      submittedAt: firstPostChoiceActionRecord.submittedAt,
      responseText: firstPostChoiceActionRecord.responseText,
      sceneTitle: firstPostChoiceActionRecord.sceneTitle,
      responseModel: firstPostChoiceActionRecord.responseModel,
      responseSource: firstPostChoiceActionRecord.responseSource,
      actionKind: firstPostChoiceActionRecord.actionKind,
      playerVisibleFacts: firstPostChoiceActionRecord.playerVisibleFacts,
      ...(firstPostChoiceActionRecord.characterInfoUpdates
        ? {
            characterInfoUpdates:
              firstPostChoiceActionRecord.characterInfoUpdates,
          }
        : {}),
      storylineContextSourceVersion:
        firstPostChoiceActionRecord.storylineContextSourceVersion,
      resolvedAt: firstPostChoiceActionRecord.resolvedAt,
    };
    const firstPostChoiceAction =
      existingPlayer.firstPostChoiceAction ?? firstPostChoiceActionSnapshot;
    const characterInfoRecord = mergeCharacterInfoUpdates({
      characterInfo: existingPlayer.characterInfo,
      updates: args.characterInfoUpdates,
      now,
      sourceTurnId: firstPostChoiceActionRecord.id,
    });
    const eventRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:post-choice-turn-resolved:${turnNumber}`,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      eventType: "post_choice_turn_resolved" as const,
      sourceTurnId: firstPostChoiceActionRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      sceneTitle: args.sceneTitle,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      model: args.responseModel,
      source: args.responseSource,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      createdAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstPostChoiceAction,
      firstPostChoiceTurns,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
    await insertPendingPlayerTurnImage(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      sourceTurnId: firstPostChoiceActionRecord.id,
      sourceTurnKind: "post_choice_turn",
      now,
    });
    await ctx.db.insert("gameplayEvents", eventRecord);
    await insertPublicActivityEvent(ctx, {
      choice: existingPlayer.firstDecision.choice,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "post_choice_turn_resolved",
      gameText: "What do you do next?",
      id: `${firstPostChoiceActionRecord.id}:public`,
      narratorResponse: args.responseText,
      player: existingPlayer,
      playerInput: args.actionText,
      sceneTitle: args.sceneTitle,
      createdAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      firstPostChoiceAction,
      firstPostChoiceTurns,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
  },
});

export const submitFirstConnectedPathTurnForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    sceneTitle: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
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
      sceneTitle: args.sceneTitle,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      ...(args.characterInfoUpdates
        ? { characterInfoUpdates: args.characterInfoUpdates }
        : {}),
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
    const characterInfoRecord = mergeCharacterInfoUpdates({
      characterInfo: existingPlayer.characterInfo,
      updates: args.characterInfoUpdates,
      now,
      sourceTurnId: turnRecord.id,
    });
    const baseEvent = {
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      sourceTurnId: turnRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      sceneTitle: args.sceneTitle,
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
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
    await insertPendingPlayerTurnImage(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      sourceTurnId: turnRecord.id,
      sourceTurnKind: "connected_path_turn",
      now,
    });
    await ctx.db.insert("gameplayEvents", {
      ...baseEvent,
      id: `${turnRecord.id}:connected-path-turn-resolved`,
      eventType:
        args.expectedTurnNumber === 1
          ? ("connected_path_started" as const)
          : ("connected_path_turn_resolved" as const),
    });
    await insertPublicActivityEvent(ctx, {
      choice: existingPlayer.firstDecision.choice,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "connected_path_turn_resolved",
      gameText: "What do you do next?",
      id: `${turnRecord.id}:public:connected-path-turn-resolved`,
      narratorResponse: args.responseText,
      player: existingPlayer,
      playerInput: args.actionText,
      sceneTitle: args.sceneTitle,
      createdAt: now,
    });

    if (!wasDelivered && args.deliveryStatus === "delivered") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:package-received`,
        eventType: "package_received" as const,
      });
      await insertPublicActivityEvent(ctx, {
        choice: existingPlayer.firstDecision.choice,
        clerkUserId: args.clerkUserId,
        dailyGameId: args.dailyGameId,
        eventKind: "package_received",
        id: `${turnRecord.id}:public:package-received`,
        narratorResponse: args.responseText,
        player: existingPlayer,
        playerInput: args.actionText,
        sceneTitle: args.sceneTitle || "Package received",
        createdAt: now,
      });
    }

    if (!wasOrbRevealed && args.orbStatus === "revealed") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-revealed`,
        eventType: "orb_revealed" as const,
      });
      await insertPublicActivityEvent(ctx, {
        choice: existingPlayer.firstDecision.choice,
        clerkUserId: args.clerkUserId,
        dailyGameId: args.dailyGameId,
        eventKind: "orb_revealed",
        id: `${turnRecord.id}:public:orb-revealed`,
        narratorResponse: args.responseText,
        player: existingPlayer,
        playerInput: args.actionText,
        sceneTitle: args.sceneTitle || "Orb revealed",
        createdAt: now,
      });
    }

    return toDailyPlayer({
      ...existingPlayer,
      firstConnectedPath: firstConnectedPathRecord,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
  },
});

export const submitFirstOrbDecisionTurnForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    sceneTitle: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
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
      sceneTitle: args.sceneTitle,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      ...(args.characterInfoUpdates
        ? { characterInfoUpdates: args.characterInfoUpdates }
        : {}),
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
    const characterInfoRecord = mergeCharacterInfoUpdates({
      characterInfo: existingPlayer.characterInfo,
      updates: args.characterInfoUpdates,
      now,
      sourceTurnId: turnRecord.id,
    });
    const baseEvent = {
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      sourceTurnId: turnRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      sceneTitle: args.sceneTitle,
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
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
    await insertPendingPlayerTurnImage(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      sourceTurnId: turnRecord.id,
      sourceTurnKind: "orb_decision_turn",
      now,
    });
    await ctx.db.insert("gameplayEvents", {
      ...baseEvent,
      id: `${turnRecord.id}:orb-action-resolved`,
      eventType: "orb_action_resolved" as const,
    });
    await insertPublicActivityEvent(ctx, {
      choice: existingPlayer.firstDecision.choice,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "orb_action_resolved",
      gameText: "What do you do next?",
      id: `${turnRecord.id}:public:orb-action-resolved`,
      narratorResponse: args.responseText,
      player: existingPlayer,
      playerInput: args.actionText,
      sceneTitle: args.sceneTitle,
      createdAt: now,
    });

    if (args.orbLifecycle === "orb_accepted") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-accepted`,
        eventType: "orb_accepted" as const,
      });
      await insertPublicActivityEvent(ctx, {
        choice: existingPlayer.firstDecision.choice,
        clerkUserId: args.clerkUserId,
        dailyGameId: args.dailyGameId,
        eventKind: "orb_accepted",
        id: `${turnRecord.id}:public:orb-accepted`,
        narratorResponse: args.responseText,
        player: existingPlayer,
        playerInput: args.actionText,
        sceneTitle: args.sceneTitle || "Orb accepted",
        createdAt: now,
      });
    }

    if (args.orbLifecycle === "orb_lost") {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:orb-lost`,
        eventType: "orb_lost" as const,
      });
      await insertPublicActivityEvent(ctx, {
        choice: existingPlayer.firstDecision.choice,
        clerkUserId: args.clerkUserId,
        dailyGameId: args.dailyGameId,
        eventKind: "orb_lost",
        id: `${turnRecord.id}:public:orb-lost`,
        narratorResponse: args.responseText,
        player: existingPlayer,
        playerInput: args.actionText,
        sceneTitle: args.sceneTitle || "Orb lost",
        createdAt: now,
      });
    }

    return toDailyPlayer({
      ...existingPlayer,
      firstConnectedPath: firstConnectedPathRecord,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
  },
});

export const submitFirstConnectedAsiTurnForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    actionText: v.string(),
    responseText: v.string(),
    sceneTitle: v.string(),
    responseModel: v.string(),
    responseSource: v.literal("ai"),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    characterInfoUpdates: v.optional(v.array(characterInfoUpdate)),
    storylineContextSourceVersion: v.string(),
    expectedTurnNumber: v.number(),
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
      throw new ConvexError("Connected ASI interaction is only available after YES.");
    }

    const existingPath = existingPlayer.firstConnectedPath;

    if (!existingPath || existingPath.orbLifecycle !== "orb_accepted") {
      throw new ConvexError("The connected ASI interface is not available yet.");
    }

    const existingConnectedAsiTurns = existingPath.connectedAsiTurns ?? [];

    if (existingConnectedAsiTurns.length > 0) {
      return toDailyPlayer(existingPlayer);
    }

    if (existingConnectedAsiTurns.length >= args.expectedTurnNumber) {
      return toDailyPlayer(existingPlayer);
    }

    if (existingConnectedAsiTurns.length !== args.expectedTurnNumber - 1) {
      throw new ConvexError("Connected ASI turn is out of order.");
    }

    const now = new Date().toISOString();
    const turnRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-connected-asi-turn:${args.expectedTurnNumber}`,
      turnNumber: args.expectedTurnNumber,
      actionText: args.actionText,
      responseText: args.responseText,
      sceneTitle: args.sceneTitle,
      responseModel: args.responseModel,
      responseSource: args.responseSource,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      ...(args.characterInfoUpdates
        ? { characterInfoUpdates: args.characterInfoUpdates }
        : {}),
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      resolvedAt: now,
    };
    const firstConnectedPathRecord = {
      ...existingPath,
      connectedAsiTurns: [...existingConnectedAsiTurns, turnRecord],
      connectedAsiStartedAt: existingPath.connectedAsiStartedAt ?? now,
      updatedAt: now,
    };
    const characterInfoRecord = mergeCharacterInfoUpdates({
      characterInfo: existingPlayer.characterInfo,
      updates: args.characterInfoUpdates,
      now,
      sourceTurnId: turnRecord.id,
    });
    const baseEvent = {
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      clerkUserId: args.clerkUserId,
      sourceTurnId: turnRecord.id,
      selectedChoice: existingPlayer.firstDecision.choice,
      playerActionText: args.actionText,
      narrativeResponseText: args.responseText,
      sceneTitle: args.sceneTitle,
      actionKind: args.actionKind,
      playerVisibleFacts: args.playerVisibleFacts,
      connectedDeliveryStatus: existingPath.deliveryStatus,
      connectedPackageStatus: existingPath.packageStatus,
      connectedOrbStatus: existingPath.orbStatus,
      connectedOrbLifecycle: existingPath.orbLifecycle,
      model: args.responseModel,
      source: args.responseSource,
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      createdAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstConnectedPath: firstConnectedPathRecord,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
      updatedAt: now,
    });
    await insertPendingPlayerTurnImage(ctx, {
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      playerId: existingPlayer.id,
      sourceTurnId: turnRecord.id,
      sourceTurnKind: "connected_asi_turn",
      now,
    });
    await ctx.db.insert("gameplayEvents", {
      ...baseEvent,
      id: `${turnRecord.id}:connected-asi-interaction-resolved`,
      eventType: "connected_asi_interaction_resolved" as const,
    });
    await insertPublicActivityEvent(ctx, {
      choice: existingPlayer.firstDecision.choice,
      clerkUserId: args.clerkUserId,
      dailyGameId: args.dailyGameId,
      eventKind: "connected_asi_interaction_resolved",
      gameText: "What do you do next?",
      id: `${turnRecord.id}:public:connected-asi-interaction-resolved`,
      narratorResponse: args.responseText,
      player: existingPlayer,
      playerInput: args.actionText,
      sceneTitle: args.sceneTitle,
      createdAt: now,
    });

    if (args.expectedTurnNumber === 1) {
      await ctx.db.insert("gameplayEvents", {
        ...baseEvent,
        id: `${turnRecord.id}:connected-asi-interface-started`,
        eventType: "connected_asi_interface_started" as const,
      });
    }

    return toDailyPlayer({
      ...existingPlayer,
      firstConnectedPath: firstConnectedPathRecord,
      ...(characterInfoRecord ? { characterInfo: characterInfoRecord } : {}),
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
      characterInfo: createInitialCharacterInfo(existingPlayer, now),
      updatedAt: now,
    });

    return true;
  },
});

export const correctCharacterInfoForUserGame = mutationGeneric({
  args: {
    ...authenticatedArgs,
    correction: v.object({
      section: characterInfoSectionKey,
      itemId: v.optional(v.string()),
      text: v.string(),
    }),
  },
  returns: player,
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const existingPlayer = await findPlayerOrThrow(
      ctx,
      args.clerkUserId,
      args.dailyGameId,
    );
    const now = new Date().toISOString();
    const characterInfoRecord = applyCharacterInfoCorrection({
      characterInfo: existingPlayer.characterInfo,
      correction: args.correction,
      now,
    });

    await ctx.db.patch(existingPlayer._id, {
      characterInfo: characterInfoRecord,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      characterInfo: characterInfoRecord,
      updatedAt: now,
    });
  },
});

const CHARACTER_INFO_SECTIONS = [
  "currentSituation",
  "relationships",
  "resources",
  "constraints",
  "goals",
  "knowledge",
  "openThreads",
  "recentChanges",
] as const;
const MAX_CHARACTER_INFO_ITEMS = 8;
const MAX_CHARACTER_INFO_CORRECTIONS = 20;
const MAX_CHARACTER_INFO_TEXT = 180;
const HIDDEN_CHARACTER_INFO_LABELS =
  /\b(pre_delivery|package_available|orb_revealed|not_arrived|orb_delivered|orb_accepted|orb_lost|connected_asi_started|connectedDeliveryStatus|connectedPackageStatus|connectedOrbStatus|orbLifecycle)\b/i;

function createInitialCharacterInfo(
  draft: {
    bio: string;
  },
  now: string,
) {
  const bio = sanitizeCharacterInfoText(draft.bio);

  return normalizeCharacterInfo({
    sections: {
      ...(bio
        ? {
            currentSituation: [
              {
                id: "draft-bio",
                text: bio,
                updatedAt: now,
                source: "draft",
              },
            ],
          }
        : {}),
    },
    updatedAt: now,
  });
}

function mergeCharacterInfoUpdates({
  characterInfo,
  updates,
  now,
  sourceTurnId,
}: {
  characterInfo: any;
  updates: any;
  now: string;
  sourceTurnId: string;
}) {
  const normalizedUpdates = normalizeCharacterInfoUpdates(updates);

  if (normalizedUpdates.length === 0) {
    return characterInfo ? normalizeCharacterInfo(characterInfo) : undefined;
  }

  const next = normalizeCharacterInfo(characterInfo ?? { sections: {}, updatedAt: now });

  for (const update of normalizedUpdates) {
    const items = [...(next.sections[update.section] ?? [])];

    if (update.operation === "add") {
      const updateText = update.text;

      if (!updateText || items.some((item: any) => sameText(item.text, updateText))) {
        next.sections[update.section] = items;
        continue;
      }
      items.push({
        id: createCharacterInfoItemId(update.section, sourceTurnId, items.length),
        text: updateText,
        updatedAt: now,
        source: "ai",
        sourceTurnId,
      });
      next.sections[update.section] = items.slice(-MAX_CHARACTER_INFO_ITEMS);
      continue;
    }

    const targetIndex = findCharacterInfoTargetIndex(items, update);

    if (targetIndex === -1) {
      next.sections[update.section] = items;
      continue;
    }

    if (update.operation === "remove") {
      items.splice(targetIndex, 1);
    } else if (update.text) {
      items[targetIndex] = {
        ...items[targetIndex],
        text: update.text,
        updatedAt: now,
        source: "ai",
        sourceTurnId,
      };
    }

    next.sections[update.section] = items;
  }

  next.updatedAt = now;
  return next;
}

function applyCharacterInfoCorrection({
  characterInfo,
  correction,
  now,
}: {
  characterInfo: any;
  correction: { section: string; itemId?: string; text: string };
  now: string;
}) {
  const section = isCharacterInfoSection(correction.section)
    ? correction.section
    : null;
  const text = sanitizeCharacterInfoText(correction.text);

  if (!section || !text) {
    throw new ConvexError("Character correction is invalid.");
  }

  const next = normalizeCharacterInfo(characterInfo ?? { sections: {}, updatedAt: now });
  const items = [...(next.sections[section] ?? [])];
  const existingIndex = correction.itemId
    ? items.findIndex((item: any) => item.id === correction.itemId)
    : -1;
  const previousItem = existingIndex >= 0 ? items[existingIndex] : undefined;
  const itemId =
    previousItem?.id ??
    createCharacterInfoItemId(section, `correction-${now}`, items.length);

  if (previousItem) {
    items[existingIndex] = {
      ...previousItem,
      text,
      updatedAt: now,
      source: "player_correction",
    };
  } else {
    items.push({
      id: itemId,
      text,
      updatedAt: now,
      source: "player_correction",
    });
  }

  next.sections[section] = items.slice(-MAX_CHARACTER_INFO_ITEMS);
  next.corrections = [
    ...(next.corrections ?? []),
    {
      id: `correction:${now}:${itemId}`,
      section,
      itemId,
      ...(previousItem ? { previousText: previousItem.text } : {}),
      text,
      updatedAt: now,
    },
  ].slice(-MAX_CHARACTER_INFO_CORRECTIONS);
  next.updatedAt = now;

  return next;
}

function normalizeCharacterInfo(value: any) {
  const sectionsSource =
    value?.sections && typeof value.sections === "object" ? value.sections : {};
  const sections: Record<string, any[]> = {};

  for (const section of CHARACTER_INFO_SECTIONS) {
    const items = Array.isArray(sectionsSource[section])
      ? sectionsSource[section]
      : [];
    const normalizedItems = items
      .map((item: any, index: number) =>
        normalizeCharacterInfoItem(item, section, index),
      )
      .filter(Boolean)
      .slice(0, MAX_CHARACTER_INFO_ITEMS);

    if (normalizedItems.length > 0) {
      sections[section] = normalizedItems;
    }
  }

  const corrections = Array.isArray(value?.corrections)
    ? value.corrections
        .map(normalizeCharacterInfoCorrection)
        .filter(Boolean)
        .slice(-MAX_CHARACTER_INFO_CORRECTIONS)
    : undefined;

  return {
    sections,
    ...(corrections?.length ? { corrections } : {}),
    updatedAt:
      typeof value?.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
}

function normalizeCharacterInfoItem(item: any, section: string, index: number) {
  const text = sanitizeCharacterInfoText(item?.text);

  if (!text) {
    return null;
  }

  return {
    id: typeof item?.id === "string" ? item.id.slice(0, 120) : `${section}-${index}`,
    text,
    updatedAt:
      typeof item?.updatedAt === "string"
        ? item.updatedAt
        : new Date().toISOString(),
    source:
      item?.source === "draft" || item?.source === "player_correction"
        ? item.source
        : "ai",
    ...(typeof item?.sourceTurnId === "string"
      ? { sourceTurnId: item.sourceTurnId.slice(0, 160) }
      : {}),
  };
}

function normalizeCharacterInfoCorrection(correction: any) {
  const section = isCharacterInfoSection(correction?.section)
    ? correction.section
    : null;
  const itemId =
    typeof correction?.itemId === "string" ? correction.itemId.slice(0, 120) : "";
  const text = sanitizeCharacterInfoText(correction?.text);

  if (!section || !itemId || !text) {
    return null;
  }

  const previousText = sanitizeCharacterInfoText(correction?.previousText);

  return {
    id:
      typeof correction?.id === "string"
        ? correction.id.slice(0, 160)
        : `correction:${itemId}`,
    section,
    itemId,
    ...(previousText ? { previousText } : {}),
    text,
    updatedAt:
      typeof correction?.updatedAt === "string"
        ? correction.updatedAt
        : new Date().toISOString(),
  };
}

function normalizeCharacterInfoUpdates(updates: any) {
  if (!Array.isArray(updates)) {
    return [];
  }

  return updates
    .map((update) => {
      const section = isCharacterInfoSection(update?.section)
        ? update.section
        : null;
      const operation =
        update?.operation === "add" ||
        update?.operation === "replace" ||
        update?.operation === "remove"
          ? update.operation
          : null;
      const text = sanitizeCharacterInfoText(update?.text);
      const targetText = sanitizeCharacterInfoText(update?.targetText);
      const itemId =
        typeof update?.itemId === "string" ? update.itemId.slice(0, 120) : "";

      if (!section || !operation) {
        return null;
      }

      if ((operation === "add" || operation === "replace") && !text) {
        return null;
      }

      return {
        section,
        operation,
        ...(itemId ? { itemId } : {}),
        ...(targetText ? { targetText } : {}),
        ...(text ? { text } : {}),
      };
    })
    .filter((update): update is NonNullable<typeof update> => Boolean(update))
    .slice(0, 12);
}

function sanitizeCharacterInfoText(value: any): string {
  if (typeof value !== "string") {
    return "";
  }

  const text = value.replace(/\s+/g, " ").trim().slice(0, MAX_CHARACTER_INFO_TEXT);

  if (!text || HIDDEN_CHARACTER_INFO_LABELS.test(text)) {
    return "";
  }

  return text;
}

function findCharacterInfoTargetIndex(items: any[], update: any): number {
  if (update.itemId) {
    const byId = items.findIndex((item) => item.id === update.itemId);

    if (byId >= 0) {
      return byId;
    }
  }

  if (update.targetText) {
    return items.findIndex((item) => sameText(item.text, update.targetText));
  }

  return items.length - 1;
}

function createCharacterInfoItemId(
  section: string,
  sourceTurnId: string,
  index: number,
): string {
  return `${section}:${sourceTurnId}:${index}`
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, "-")
    .slice(0, 140);
}

function isCharacterInfoSection(value: any): value is (typeof CHARACTER_INFO_SECTIONS)[number] {
  return CHARACTER_INFO_SECTIONS.includes(value);
}

function sameText(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export const deleteDailyGameForAdmin = mutationGeneric({
  args: {
    backendSecret: v.string(),
    dailyGameId: v.string(),
  },
  returns: v.object({
    deletedGames: v.number(),
    deletedPlayers: v.number(),
    deletedGameplayEvents: v.number(),
    deletedPublicActivityEvents: v.number(),
    deletedAiUsageEvents: v.number(),
    deletedPlayerTurnImages: v.number(),
    deletedStorylineContexts: v.number(),
    deletedArtifactObjects: v.number(),
  }),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    return await deleteDailyGameRecords(ctx, args.dailyGameId);
  },
});

export const deleteAllDailyGamesForAdmin = mutationGeneric({
  args: {
    backendSecret: v.string(),
  },
  returns: v.object({
    deletedGames: v.number(),
    deletedPlayers: v.number(),
    deletedGameplayEvents: v.number(),
    deletedPublicActivityEvents: v.number(),
    deletedAiUsageEvents: v.number(),
    deletedPlayerTurnImages: v.number(),
    deletedStorylineContexts: v.number(),
    deletedArtifactObjects: v.number(),
  }),
  handler: async (ctx, args) => {
    requireBackendSecret(args.backendSecret);

    const games = await ctx.db.query("dailyGames").collect();
    const totals = createDeleteDailyGameTotals();

    for (const game of games) {
      addDeleteDailyGameTotals(
        totals,
        await deleteDailyGameRecords(ctx, game.dailyGameId),
      );
    }

    return totals;
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

async function deleteDailyGameRecords(ctx: any, dailyGameId: string) {
  const totals = createDeleteDailyGameTotals();
  const games = await ctx.db
    .query("dailyGames")
    .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
    .collect();

  totals.deletedGames += await deleteDocuments(ctx, games);
  totals.deletedPlayers += await deleteDocuments(
    ctx,
    await ctx.db
      .query("players")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );
  totals.deletedGameplayEvents += await deleteDocuments(
    ctx,
    await ctx.db
      .query("gameplayEvents")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );
  totals.deletedPublicActivityEvents += await deleteDocuments(
    ctx,
    await ctx.db
      .query("publicActivityEvents")
      .withIndex("by_dailyGameId_and_createdAt", (q: any) =>
        q.eq("dailyGameId", dailyGameId),
      )
      .collect(),
  );
  totals.deletedAiUsageEvents += await deleteDocuments(
    ctx,
    await ctx.db
      .query("aiUsageEvents")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );
  totals.deletedPlayerTurnImages += await deleteDocuments(
    ctx,
    await ctx.db
      .query("playerTurnImages")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );
  totals.deletedStorylineContexts += await deleteDocuments(
    ctx,
    await ctx.db
      .query("day1StorylineContexts")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );
  totals.deletedArtifactObjects += await deleteDocuments(
    ctx,
    await ctx.db
      .query("artifactObjects")
      .withIndex("by_dailyGameId", (q: any) => q.eq("dailyGameId", dailyGameId))
      .collect(),
  );

  return totals;
}

async function deleteDocuments(ctx: any, documents: { _id: string }[]) {
  for (const document of documents) {
    await ctx.db.delete(document._id);
  }

  return documents.length;
}

function createDeleteDailyGameTotals() {
  return {
    deletedGames: 0,
    deletedPlayers: 0,
    deletedGameplayEvents: 0,
    deletedPublicActivityEvents: 0,
    deletedAiUsageEvents: 0,
    deletedPlayerTurnImages: 0,
    deletedStorylineContexts: 0,
    deletedArtifactObjects: 0,
  };
}

function addDeleteDailyGameTotals(
  totals: ReturnType<typeof createDeleteDailyGameTotals>,
  next: ReturnType<typeof createDeleteDailyGameTotals>,
) {
  totals.deletedGames += next.deletedGames;
  totals.deletedPlayers += next.deletedPlayers;
  totals.deletedGameplayEvents += next.deletedGameplayEvents;
  totals.deletedPublicActivityEvents += next.deletedPublicActivityEvents;
  totals.deletedAiUsageEvents += next.deletedAiUsageEvents;
  totals.deletedPlayerTurnImages += next.deletedPlayerTurnImages;
  totals.deletedStorylineContexts += next.deletedStorylineContexts;
  totals.deletedArtifactObjects += next.deletedArtifactObjects;
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

async function findPlayerTurnImage(ctx: any, sourceTurnId: string) {
  return await ctx.db
    .query("playerTurnImages")
    .withIndex("by_sourceTurnId", (q: any) =>
      q.eq("sourceTurnId", sourceTurnId),
    )
    .first();
}

async function insertPendingPlayerTurnImage(
  ctx: any,
  {
    clerkUserId,
    dailyGameId,
    now,
    playerId,
    sourceTurnId,
    sourceTurnKind,
  }: {
    clerkUserId: string;
    dailyGameId: string;
    now: string;
    playerId: string;
    sourceTurnId: string;
    sourceTurnKind:
      | "post_choice_turn"
      | "connected_path_turn"
      | "orb_decision_turn"
      | "connected_asi_turn";
  },
) {
  const existingImage = await findPlayerTurnImage(ctx, sourceTurnId);

  if (existingImage) {
    return;
  }

  await ctx.db.insert("playerTurnImages", {
    id: `${sourceTurnId}:image`,
    dailyGameId,
    playerId,
    clerkUserId,
    sourceTurnId,
    sourceTurnKind,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
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
    ...(source.characterInfo
      ? { characterInfo: normalizeCharacterInfo(source.characterInfo) }
      : {}),
    ...(source.firstDecision
      ? { firstDecision: source.firstDecision }
      : {}),
    ...(source.firstRevealTextResponses
      ? { firstRevealTextResponses: source.firstRevealTextResponses }
      : {}),
    ...(source.firstPostChoiceAction
      ? { firstPostChoiceAction: source.firstPostChoiceAction }
      : {}),
    ...(source.firstPostChoiceTurns
      ? { firstPostChoiceTurns: source.firstPostChoiceTurns }
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
    ...(source.turnImages ? { turnImages: source.turnImages } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toAiUsageEvent(source: any) {
  return {
    id: source.id,
    provider: source.provider,
    model: source.model,
    operation: source.operation,
    ...(source.dailyGameId !== undefined
      ? { dailyGameId: source.dailyGameId }
      : {}),
    ...(source.playerId !== undefined ? { playerId: source.playerId } : {}),
    ...(source.clerkUserId !== undefined
      ? { clerkUserId: source.clerkUserId }
      : {}),
    inputTokens: source.inputTokens,
    cachedInputTokens: source.cachedInputTokens,
    outputTokens: source.outputTokens,
    reasoningTokens: source.reasoningTokens,
    totalTokens: source.totalTokens,
    estimatedCostUsd: source.estimatedCostUsd,
    pricingSourceUrl: source.pricingSourceUrl,
    pricingEffectiveDate: source.pricingEffectiveDate,
    status: source.status,
    ...(source.errorType !== undefined ? { errorType: source.errorType } : {}),
    createdAt: source.createdAt,
  };
}

async function insertPublicActivityEvent(
  ctx: any,
  event: {
    id: string;
    dailyGameId: string;
    createdAt: string;
    clerkUserId: string;
    player: {
      name: string;
      age: string;
      location: string;
      occupation: string;
      bio: string;
    };
    eventKind:
      | "opening_response_submitted"
      | "opening_context_answered"
      | "first_reveal_presented"
      | "first_choice_submitted"
      | "first_reveal_text_response_submitted"
      | "post_choice_turn_resolved"
      | "connected_path_turn_resolved"
      | "package_received"
      | "orb_revealed"
      | "orb_action_resolved"
      | "orb_accepted"
      | "orb_lost"
      | "connected_asi_interaction_resolved";
    gameText?: string;
    playerInput?: string;
    choice?: "YES" | "NO";
    narratorResponse?: string;
    sceneTitle?: string;
  },
) {
  const playtest = getPlaytestMetadata(event.clerkUserId);

  await ctx.db.insert("publicActivityEvents", {
    id: event.id,
    dailyGameId: event.dailyGameId,
    createdAt: event.createdAt,
    character: toPublicCharacterSnapshot(event.player),
    eventKind: event.eventKind,
    ...(event.gameText ? { gameText: event.gameText } : {}),
    ...(event.playerInput ? { playerInput: event.playerInput } : {}),
    ...(event.choice ? { choice: event.choice } : {}),
    ...(event.narratorResponse
      ? { narratorResponse: event.narratorResponse }
      : {}),
    ...(event.sceneTitle ? { sceneTitle: event.sceneTitle } : {}),
    ...(playtest ? { playtest } : {}),
  });
}

function toPublicActivityEvent(source: any) {
  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    createdAt: source.createdAt,
    character: toPublicCharacterSnapshot(source.character),
    eventKind: source.eventKind,
    ...(source.gameText ? { gameText: source.gameText } : {}),
    ...(source.playerInput ? { playerInput: source.playerInput } : {}),
    ...(source.choice ? { choice: source.choice } : {}),
    ...(source.narratorResponse
      ? { narratorResponse: source.narratorResponse }
      : {}),
    ...(source.sceneTitle ? { sceneTitle: source.sceneTitle } : {}),
    ...(source.playtest ? { playtest: source.playtest } : {}),
  };
}

function toPublicPlayerTurnImage(
  source: any,
  { includeStorage = false }: { includeStorage?: boolean } = {},
) {
  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    playerId: source.playerId,
    sourceTurnId: source.sourceTurnId,
    sourceTurnKind: source.sourceTurnKind,
    status: source.status,
    ...(includeStorage && source.prompt ? { prompt: source.prompt } : {}),
    ...(includeStorage && source.promptModel
      ? { promptModel: source.promptModel }
      : {}),
    ...(source.imageModel ? { imageModel: source.imageModel } : {}),
    ...(source.quality ? { quality: source.quality } : {}),
    ...(source.size ? { size: source.size } : {}),
    ...(includeStorage && source.bucket ? { bucket: source.bucket } : {}),
    ...(includeStorage && source.objectKey ? { objectKey: source.objectKey } : {}),
    ...(source.contentType ? { contentType: source.contentType } : {}),
    ...(source.errorMessage ? { errorMessage: source.errorMessage } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    ...(source.generatedAt ? { generatedAt: source.generatedAt } : {}),
  };
}

function toPublicLivePlayerSummary(source: any) {
  const gameplayTurns = [
    ...(source.firstPostChoiceTurns ?? []),
    ...(source.firstConnectedPath?.turns ?? []),
    ...(source.firstConnectedPath?.orbDecisionTurns ?? []),
    ...(source.firstConnectedPath?.connectedAsiTurns ?? []),
  ];
  const timedMilestones = [
    source.openingResponseSubmittedAt,
    source.openingSceneContext?.answeredAt,
    source.firstMoveReveal?.generatedAt,
    source.firstDecision?.submittedAt,
    ...(source.firstRevealTextResponses ?? []).map(
      (response: any) => response.submittedAt,
    ),
    ...gameplayTurns.map((turn: any) => turn.resolvedAt ?? turn.submittedAt),
  ].filter(Boolean);
  const lastActivityAt = timedMilestones.sort().at(-1);

  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    ...(source.firstDecision?.choice
      ? { choice: source.firstDecision.choice }
      : {}),
    turnCount:
      (source.openingResponse ? 1 : 0) +
      (source.openingSceneContext?.answerText ? 1 : 0) +
      (source.firstMoveReveal ? 1 : 0) +
      (source.firstDecision ? 1 : 0) +
      (source.firstRevealTextResponses?.length ?? 0) +
      gameplayTurns.length,
    ...(lastActivityAt ? { lastActivityAt } : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toPublicLivePlayer(source: any) {
  return {
    id: source.id,
    dailyGameId: source.dailyGameId,
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
    timeZone: source.timeZone,
    ...(source.characterInfo
      ? { characterInfo: normalizeCharacterInfo(source.characterInfo) }
      : {}),
    ...(source.firstDecision ? { firstDecision: source.firstDecision } : {}),
    ...(source.firstRevealTextResponses
      ? { firstRevealTextResponses: source.firstRevealTextResponses }
      : {}),
    ...(source.firstPostChoiceAction
      ? { firstPostChoiceAction: source.firstPostChoiceAction }
      : {}),
    ...(source.firstPostChoiceTurns
      ? { firstPostChoiceTurns: source.firstPostChoiceTurns }
      : {}),
    ...(source.firstConnectedPath
      ? { firstConnectedPath: source.firstConnectedPath }
      : {}),
    ...(source.firstMoveReveal ? { firstMoveReveal: source.firstMoveReveal } : {}),
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
    ...(source.turnImages
      ? { turnImages: source.turnImages.map(toPublicPlayerTurnImage) }
      : {}),
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function toPublicCharacterSnapshot(source: {
  name: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
}) {
  return {
    name: source.name,
    age: source.age,
    location: source.location,
    occupation: source.occupation,
    bio: source.bio,
  };
}

function getPlaytestMetadata(clerkUserId: string) {
  if (!clerkUserId.startsWith("playtest:")) {
    return null;
  }

  const [, build, persona, scenario, run] = clerkUserId.split(":");

  return {
    synthetic: true as const,
    ...(build ? { build } : {}),
    ...(persona ? { persona } : {}),
    ...(scenario ? { scenario } : {}),
    ...(run ? { run } : {}),
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
