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

const player = v.object({
  id: v.string(),
  clerkUserId: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  firstDecision: v.optional(firstDecision),
  firstRevealTextResponses: v.optional(v.array(firstRevealTextResponse)),
  firstPostChoiceAction: v.optional(firstPostChoiceAction),
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
      dailyGameId: args.dailyGameId,
      firstMoveReveal: existingPlayer.firstMoveReveal,
      openingResponse: existingPlayer.openingResponse,
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
      dailyGameId: args.dailyGameId,
      firstMoveReveal: existingPlayer.firstMoveReveal,
      openingResponse: existingPlayer.openingResponse,
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
      throw new ConvexError("First post-choice action has already been submitted.");
    }

    const now = new Date().toISOString();
    const firstPostChoiceActionRecord = {
      id: `${args.dailyGameId}:${existingPlayer.id}:first-post-choice-action`,
      actionText: args.actionText,
      submittedAt: now,
    };

    await ctx.db.patch(existingPlayer._id, {
      firstPostChoiceAction: firstPostChoiceActionRecord,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      firstPostChoiceAction: firstPostChoiceActionRecord,
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
  dailyGameId,
  firstMoveReveal,
  openingResponse,
  playerId,
  submittedAt,
}: {
  choice: "YES" | "NO";
  dailyGameId: string;
  firstMoveReveal: {
    id: string;
    generatedAt: string;
    model: string;
    source: "ai" | "fallback";
  };
  openingResponse?: string;
  playerId: string;
  submittedAt: string;
}) {
  const consequence =
    choice === "YES"
      ? {
          consequenceTitle: "The invitation accepts you.",
          consequenceBody:
            "A private channel opens for today's game. The next move is now waiting on the other side of your answer.",
        }
      : {
          consequenceTitle: "",
          consequenceBody: createNoConsequenceBody(openingResponse),
        };

  return {
    id: `${dailyGameId}:${playerId}:first-decision`,
    choice,
    status: "first_choice_submitted" as const,
    ...consequence,
    consequenceModel: "deterministic-stage-05",
    consequenceSource: "fallback" as const,
    revealId: firstMoveReveal.id,
    revealGeneratedAt: firstMoveReveal.generatedAt,
    revealModel: firstMoveReveal.model,
    revealSource: firstMoveReveal.source,
    submittedAt,
  };
}

function createNoConsequenceBody(openingResponse?: string) {
  const openingMoment = summarizeOpeningMoment(openingResponse);

  if (!openingMoment) {
    return "The message disappears. Everything returns to normal, and the day resumes around whatever you were doing before it arrived.";
  }

  return `The message disappears. Everything returns to normal: ${openingMoment}. The interruption is gone, and the day resumes from there.`;
}

function summarizeOpeningMoment(openingResponse?: string) {
  const normalized = openingResponse?.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  const withoutTrailingPunctuation = normalized.replace(/[.!?]+$/, "");
  const maxLength = 180;

  if (withoutTrailingPunctuation.length <= maxLength) {
    return withoutTrailingPunctuation;
  }

  return `${withoutTrailingPunctuation.slice(0, maxLength - 3).trimEnd()}...`;
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
