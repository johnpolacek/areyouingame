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

const characterImage = v.object({
  url: v.string(),
  bucket: v.string(),
  objectKey: v.string(),
  contentType: v.union(
    v.literal("image/webp"),
    v.literal("image/png"),
    v.literal("image/jpeg"),
  ),
  sizeBytes: v.number(),
  uploadedAt: v.string(),
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

const moderationDecision = v.union(
  v.literal("allow"),
  v.literal("review"),
  v.literal("block"),
);

const moderationSource = v.union(
  v.literal("character_draft"),
  v.literal("character_image_upload"),
  v.literal("opening_response"),
  v.literal("yes_no_text_response"),
  v.literal("post_choice_action"),
  v.literal("connected_path_action"),
  v.literal("orb_decision_action"),
  v.literal("connected_asi_action"),
  v.literal("character_info_correction"),
);

const moderationEvent = v.object({
  id: v.string(),
  source: moderationSource,
  decision: moderationDecision,
  model: v.string(),
  inputType: v.union(v.literal("text"), v.literal("image")),
  textHash: v.optional(v.string()),
  dailyGameId: v.optional(v.string()),
  playerId: v.optional(v.string()),
  clerkUserId: v.optional(v.string()),
  flagged: v.boolean(),
  categories: v.array(
    v.object({
      category: v.string(),
      flagged: v.boolean(),
      score: v.number(),
    }),
  ),
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
    appearance: v.optional(v.string()),
    bio: v.string(),
    timeZone: v.string(),
    characterImage: v.optional(characterImage),
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

  day1StorylineContexts: defineTable(day1StorylineContext).index(
    "by_dailyGameId",
    ["dailyGameId"],
  ),

  gameplayEvents: defineTable({
    id: v.string(),
    dailyGameId: v.string(),
    playerId: v.string(),
    clerkUserId: v.string(),
    eventType: v.union(
      v.literal("post_choice_turn_resolved"),
      v.literal("connected_path_started"),
      v.literal("connected_path_turn_resolved"),
      v.literal("package_received"),
      v.literal("orb_revealed"),
      v.literal("orb_action_resolved"),
      v.literal("orb_accepted"),
      v.literal("orb_lost"),
      v.literal("connected_asi_interface_started"),
      v.literal("connected_asi_interaction_resolved"),
    ),
    sourceTurnId: v.string(),
    selectedChoice: v.union(v.literal("YES"), v.literal("NO")),
    playerActionText: v.string(),
    narrativeResponseText: v.string(),
    sceneTitle: v.optional(v.string()),
    actionKind: v.string(),
    playerVisibleFacts: v.array(v.string()),
    connectedDeliveryStatus: v.optional(connectedDeliveryStatus),
    connectedPackageStatus: v.optional(connectedPackageStatus),
    connectedOrbStatus: v.optional(connectedOrbStatus),
    connectedOrbLifecycle: v.optional(connectedOrbLifecycle),
    model: v.string(),
    source: v.literal("ai"),
    storylineContextSourceVersion: v.string(),
    createdAt: v.string(),
  })
    .index("by_dailyGameId", ["dailyGameId"])
    .index("by_playerId", ["playerId"])
    .index("by_clerkUserId", ["clerkUserId"]),

  publicActivityEvents: defineTable(publicActivityEvent)
    .index("by_dailyGameId_and_createdAt", ["dailyGameId", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  aiUsageEvents: defineTable(aiUsageEvent)
    .index("by_createdAt", ["createdAt"])
    .index("by_model", ["model"])
    .index("by_operation", ["operation"])
    .index("by_dailyGameId", ["dailyGameId"])
    .index("by_clerkUserId", ["clerkUserId"]),

  moderationEvents: defineTable(moderationEvent)
    .index("by_createdAt", ["createdAt"])
    .index("by_decision", ["decision"])
    .index("by_dailyGameId", ["dailyGameId"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_source", ["source"])
    .index("by_textHash", ["textHash"]),

  playerTurnImages: defineTable(playerTurnImage)
    .index("by_sourceTurnId", ["sourceTurnId"])
    .index("by_playerId", ["playerId"])
    .index("by_dailyGameId", ["dailyGameId"])
    .index("by_status", ["status"]),
});
