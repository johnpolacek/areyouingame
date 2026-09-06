import { fetchMutation } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";

const reserveRef = makeFunctionReference<
  "mutation",
  { backendSecret: string; clerkUserId: string },
  { allowed: boolean; retryAfter: number }
>("characterDraftQuota:reserve");

export async function reserveCharacterDraftGeneration(clerkUserId: string) {
  const backendSecret = process.env.AREYOUIN_BACKEND_SECRET;
  if (!backendSecret) throw new Error("Generation quota unavailable.");
  return fetchMutation(reserveRef, { backendSecret, clerkUserId });
}
