import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { isLocalAdminHost } from "./admin-access";

export const playtestAuthHeader = "x-areyouin-playtest";
export const playtestUserHeader = "x-areyouin-playtest-user";
export const playtestAuthEnvVar = "AREYOUIN_PLAYTEST_AUTH";

export async function getAuthenticatedUserId(): Promise<string> {
  const playtestUserId = await getPlaytestUserIdForRequest();

  if (playtestUserId) {
    return playtestUserId;
  }

  const { userId } = await auth.protect();

  return userId;
}

export async function getOptionalAuthenticatedUserId(): Promise<string | null> {
  const playtestUserId = await getPlaytestUserIdForRequest();

  if (playtestUserId) {
    return playtestUserId;
  }

  const { userId } = await auth();

  return userId;
}

export async function getPlaytestUserIdForRequest(): Promise<string | null> {
  const headerStore = await headers();

  return getPlaytestUserIdFromHeaders({
    enabled: process.env[playtestAuthEnvVar],
    host: headerStore.get("host"),
    mode: process.env.NODE_ENV,
    playtestHeader: headerStore.get(playtestAuthHeader),
    userHeader: headerStore.get(playtestUserHeader),
  });
}

export function getPlaytestUserIdFromHeaders({
  enabled,
  host,
  mode,
  playtestHeader,
  userHeader,
}: {
  enabled: string | undefined;
  host: string | null;
  mode: string | undefined;
  playtestHeader: string | null;
  userHeader: string | null;
}): string | null {
  if (
    enabled !== "1" ||
    mode === "production" ||
    playtestHeader !== "1" ||
    !isLocalAdminHost(host) ||
    !userHeader
  ) {
    return null;
  }

  const normalizedUserId = userHeader.trim().toLowerCase();

  return /^playtest:[a-z0-9._:-]{8,180}$/.test(normalizedUserId)
    ? normalizedUserId
    : null;
}
