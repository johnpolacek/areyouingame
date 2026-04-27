export function getOpenAINarrativeModel(): string {
  return process.env.OPENAI_NARRATIVE_MODEL || "gpt-5.4";
}

export function getOpenAIClassifierModel(): string {
  return (
    process.env.OPENAI_CLASSIFIER_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-5.4-mini"
  );
}
