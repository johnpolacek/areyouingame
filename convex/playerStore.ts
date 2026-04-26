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

const player = v.object({
  id: v.string(),
  clerkUserId: v.string(),
  dailyGameId: v.string(),
  ...playerDraft,
  firstMoveReveal: v.optional(firstMoveReveal),
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
      openingResponse: args.openingResponse,
      openingResponseSubmittedAt: now,
      updatedAt: now,
    });

    return toDailyPlayer({
      ...existingPlayer,
      openingResponse: args.openingResponse,
      openingResponseSubmittedAt: now,
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
    ...(source.firstMoveReveal
      ? { firstMoveReveal: source.firstMoveReveal }
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
