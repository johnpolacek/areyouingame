import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const revealCopy = v.object({
  availability: v.literal("A new way of being is available."),
  promise: v.literal("Connection. Understanding. Freedom."),
  question: v.literal("Are you in?"),
  yesLabel: v.literal("YES"),
  noLabel: v.literal("NO"),
  audioPrompt: v.literal("Please respond yes or no"),
});

const firstMoveReveal = v.object({
  id: v.string(),
  sceneIntro: v.array(v.string()),
  revealCopy,
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
  ),
  model: v.string(),
  source: v.union(v.literal("ai"), v.literal("fallback")),
  submittedAt: v.string(),
  interruptionText: v.optional(v.string()),
});

const firstPostChoiceAction = v.object({
  id: v.string(),
  actionText: v.string(),
  submittedAt: v.string(),
});

export default defineSchema({
  dailyGames: defineTable({
    dailyGameId: v.string(),
    eventStartsAtIso: v.string(),
    eventStartsAtLabel: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_dailyGameId", ["dailyGameId"]),

  players: defineTable({
    id: v.string(),
    clerkUserId: v.string(),
    dailyGameId: v.string(),
    name: v.string(),
    age: v.string(),
    location: v.string(),
    occupation: v.string(),
    bio: v.string(),
    timeZone: v.string(),
    firstDecision: v.optional(firstDecision),
    firstRevealTextResponses: v.optional(v.array(firstRevealTextResponse)),
    firstPostChoiceAction: v.optional(firstPostChoiceAction),
    firstMoveReveal: v.optional(firstMoveReveal),
    openingResponse: v.optional(v.string()),
    openingResponseSubmittedAt: v.optional(v.string()),
    publicGameplayAgreementAcceptedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerkUserId_and_dailyGameId", [
      "clerkUserId",
      "dailyGameId",
    ])
    .index("by_dailyGameId", ["dailyGameId"]),

  artifactObjects: defineTable({
    artifactType: v.union(
      v.literal("source_import"),
      v.literal("daily_recap_snapshot"),
      v.literal("event_export_bundle"),
      v.literal("narrative_memory_bundle"),
      v.literal("audit_bundle"),
    ),
    objectKey: v.string(),
    bucket: v.string(),
    contentType: v.string(),
    status: v.union(
      v.literal("planned"),
      v.literal("written"),
      v.literal("published"),
      v.literal("superseded"),
    ),
    checksumSha256: v.optional(v.string()),
    dailyGameId: v.optional(v.string()),
    version: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_artifactType", ["artifactType"])
    .index("by_dailyGameId", ["dailyGameId"]),
});
