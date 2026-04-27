export const playerFacingNarrativeVoiceRules = [
  "Write player-facing game narration in second-person close POV.",
  "Use present tense and keep the camera inside the player character's immediate perception.",
  "Make the tone concise, cinematic, intriguing, and quietly dreadful.",
  "Ground tension in ordinary details turning strange.",
  "Prefer concrete sensory motion over explanation.",
  "Use only details that are explicitly present in provided player or world state.",
];

export const playerFacingNarrativeProhibitions = [
  "Do not invent cities, public places, nearby people, devices, jobs, names, or biographical details.",
  "Do not address the player by name.",
  "Do not mention public, city-wide, worldwide, every-screen, global, synchronized, or mass displays unless canonical state explicitly supports it.",
  "Do not say there is only one possible answer.",
  "Do not include or paraphrase fixed UI/reveal copy unless explicitly instructed.",
];

export const narrativeOutputShapePresets = {
  twoCinematicSentences: [
    "Return exactly two short cinematic sentences.",
    "Separate the two sentences with a blank line.",
    "Each sentence must be no more than 22 words.",
  ],
} as const;

export function createPlayerFacingNarrativePrompt(rules: string[] = []): string {
  return [
    ...playerFacingNarrativeVoiceRules,
    ...playerFacingNarrativeProhibitions,
    ...rules,
  ].join(" ");
}
