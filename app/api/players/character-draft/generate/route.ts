import { getOptionalAuthenticatedUserId } from "@/lib/playtest-auth";
import {
  generateCharacterDraftSuggestion,
  mergeGeneratedCharacterDraft,
  fieldLimits,
  type CharacterDraftFields,
} from "@/lib/character-draft-generation";
import { reserveCharacterDraftGeneration } from "@/lib/character-draft-quota";

export const runtime = "nodejs";
const maxBodyBytes = 16_384;

export async function POST(request: Request) {
  const userId = await getOptionalAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Sign in to generate a character." }, { status: 401 });
  }

  let draft: CharacterDraftFields;
  try {
    draft = await readDraft(request);
  } catch {
    return Response.json({ error: "Invalid character draft or request too large." }, { status: 400 });
  }

  try {
    const quota = await reserveCharacterDraftGeneration(userId);
    if (!quota.allowed) {
      return Response.json({ error: "Character generation limit reached. Try again later." }, {
        status: 429,
        headers: { "Retry-After": String(quota.retryAfter) },
      });
    }
  } catch {
    // Fail closed: never incur provider costs without a durable reservation.
    return Response.json({ error: "Character generation is temporarily unavailable." }, { status: 503 });
  }

  try {
    const suggestion = await generateCharacterDraftSuggestion({ clerkUserId: userId, draft });
    return Response.json({ draft: mergeGeneratedCharacterDraft(draft, suggestion) });
  } catch {
    return Response.json({ error: "Unable to generate character." }, { status: 502 });
  }
}

async function readDraft(request: Request): Promise<CharacterDraftFields> {
  if (!request.body) throw new Error("Missing body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBodyBytes) {
        await reader.cancel();
        throw new Error("Request too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body.");
  const input = (body as Record<string, unknown>).draft;
  if (input === undefined) return {};
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid draft.");
  const source = input as Record<string, unknown>;
  const draft: CharacterDraftFields = {};
  for (const field of Object.keys(fieldLimits) as (keyof CharacterDraftFields)[]) {
    const value = source[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > fieldLimits[field]) {
      throw new Error("Invalid field.");
    }
    draft[field] = value.trim();
  }
  return draft;
}
