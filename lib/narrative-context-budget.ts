// Bound serialized context even for legacy players whose history is still embedded.
// Apply after stage-specific context construction; this never adds story facts.
export function stringifyNarrativeContext(value: unknown): string {
  let remaining = 24_000;
  function visit(input: unknown, depth = 0): unknown {
    if (remaining <= 0) return null;
    if (typeof input === "string") {
      const text = input.slice(0, Math.min(3_000, remaining));
      remaining -= text.length;
      return text;
    }
    if (depth > 12) return null;
    if (Array.isArray(input)) return input.slice(-8).map(item => visit(item, depth + 1));
    if (input && typeof input === "object") {
      return Object.fromEntries(Object.entries(input).slice(0, 50)
        .map(([key, item]) => [key, visit(item, depth + 1)]));
    }
    return input;
  }
  return JSON.stringify(visit(value), null, 2);
}
