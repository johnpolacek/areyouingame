export const playerFacingNarrativeVoiceRules = [
  "Write player-facing game narration in second-person close POV.",
  "Use present tense and keep the camera inside the player character's immediate perception.",
  "Make the tone concise, cinematic, intriguing, and quietly dreadful.",
  "Ground tension in ordinary details turning strange.",
  "Prefer concrete sensory motion over explanation.",
  "Use only details that are explicitly present in provided player or world state.",
  "Narration Style",
  "Use short paragraphs.",
  "Use short sentences.",
  "Use strong visual beats.",
  "Use more dialogue and in-world reactions.",
  "Use immediate sensory detail.",
  "End turn responses with clean player choices when the response asks what can happen next.",
  "Make every response feel like tense interactive fiction, not a summary or analysis.",
  "Preferred response rhythm. The player takes an action. The world reacts fast. A few concrete details land. Voices or signals create tension. The situation remains unresolved. The response ends with two or three clear choices.",
];

export const playerFacingNarrativeProhibitions = [
  "Do not invent cities, public places, nearby people, devices, jobs, names, or biographical details.",
  "Do not address the player by name.",
  "Do not mention public, city-wide, worldwide, every-screen, global, synchronized, or mass displays unless canonical state explicitly supports it.",
  "Do not say there is only one possible answer.",
  "Do not include or paraphrase fixed UI/reveal copy unless explicitly instructed.",
  "Do not write long explanatory paragraphs.",
  "Do not write analysis-style summaries.",
  "Do not use Known or Unknown recap framing unless explicitly requested.",
  "Do not use overly polished essay-like phrasing.",
  "Do not repeat the same sentence structure across turns.",
  "Do not tell the player what the scene means when you can show what happens.",
  "Do not use colons, semicolons, or em dashes in player-facing narration.",
  "Do not use these phrases. What is visibly true now. What stays unknown. The split hardens. public reaction is no closer to consensus. immediate and clean.",
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

export function sanitizePlayerFacingNarration(text: string): string {
  return text
    .replace(/\u2014/g, ", ")
    .replace(/[;:]/g, ".")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}
