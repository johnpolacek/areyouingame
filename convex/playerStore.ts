import { mutationGeneric, queryGeneric } from "convex/server";
import { ConvexError, v } from "convex/values";
import {
  toPublicLivePlayerProjection,
  toPublicLivePlayerSummaryProjection,
} from "../lib/public-live-transcript";

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
  sceneTitle: v.optional(v.string()),
  responseModel: v.optional(v.string()),
  responseSource: v.optional(v.literal("ai")),
  actionKind: v.optional(v.string()),
  playerVisibleFacts: v.optional(v.array(v.string())),
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
  playerId: v.optional(v.string()),
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

const publicLiveTranscriptEntry = v.object({
  id: v.string(),
  at: v.string(),
  label: v.string(),
  title: v.string(),
  playerText: v.optional(v.string()),
  gameText: v.optional(v.string()),
  narratorText: v.optional(v.string()),
});

const publicLivePlayer = v.object({
  id: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  choice: v.optional(v.union(v.literal("YES"), v.literal("NO"))),
  transcript: v.array(publicLiveTranscriptEntry),
  turnCount: v.number(),
  lastActivityAt: v.optional(v.string()),
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
  firstPostChoiceTurns: v.optional(v.array(firstPostChoiceTurn)),
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
        const publicPlayerSummaries = players
          .map((source) => toPublicLivePlayerSummaryProjection(source))
          .filter((player) => player.turnCount > 0);
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
          playerCount: publicPlayerSummaries.length,
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
      .filter((summary) => summary.playerCount > 0 || summary.activityCount > 0)
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
      .map((source) => toPublicLivePlayerSummaryProjection(source))
      .filter((player) => player.turnCount > 0)
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

    return selectedPlayer ? toPublicLivePlayerProjection(selectedPlayer) : null;
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
      storylineContextSourceVersion:
        firstPostChoiceActionRecord.storylineContextSourceVersion,
      resolvedAt: firstPostChoiceActionRecord.resolvedAt,
    };
    const firstPostChoiceAction =
      existingPlayer.firstPostChoiceAction ?? firstPostChoiceActionSnapshot;
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
      updatedAt: now,
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
      updatedAt: now,
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
      storylineContextSourceVersion: args.storylineContextSourceVersion,
      resolvedAt: now,
    };
    const firstConnectedPathRecord = {
      ...existingPath,
      connectedAsiTurns: [...existingConnectedAsiTurns, turnRecord],
      connectedAsiStartedAt: existingPath.connectedAsiStartedAt ?? now,
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
      updatedAt: now,
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
      id?: string;
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
    ...(event.player.id ? { playerId: event.player.id } : {}),
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
    ...(source.playerId ? { playerId: source.playerId } : {}),
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
