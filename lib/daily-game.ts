import { cookies } from "next/headers";
import { playerTimeZoneCookieName } from "./character-draft";
import { getPlayerForUserGame } from "./player-store";

export type DailyGame = {
  id: string;
  eventStartsAtIso: string;
  eventStartsAtLabel: string;
};

export type TodayGameDestination = {
  href: "/player/new" | "/game/today";
  reason: "needs-player" | "has-player";
};

const EVENT_MINUTE_BUCKETS = 24 * 4;
const devGameTimeCookieName = "areyouin-dev-game-time";

export function getTodayGame(now = new Date(), timeZone = "UTC"): DailyGame {
  const dateId = getDateIdForTimeZone(now, timeZone);
  const eventStartsAt = getEventStartsAt(dateId);

  return createDailyGame(dateId, eventStartsAt);
}

export async function getTodayGameForRequest(
  now = new Date(),
  timeZone?: string,
): Promise<DailyGame> {
  const requestTimeZone = timeZone ?? (await getRequestTimeZone()) ?? "UTC";
  const todayGame = getTodayGame(now, requestTimeZone);

  if (process.env.NODE_ENV !== "development") {
    return todayGame;
  }

  const cookieStore = await cookies();
  const devEventStartsAt = readDevGameTimeCookie(
    cookieStore.get(devGameTimeCookieName)?.value,
    todayGame.id,
  );

  return devEventStartsAt
    ? createDailyGame(todayGame.id, devEventStartsAt)
    : todayGame;
}

export async function rerollTodayGameForRequest(
  now = new Date(),
): Promise<DailyGame> {
  const requestTimeZone = (await getRequestTimeZone()) ?? "UTC";
  const todayGame = getTodayGame(now, requestTimeZone);
  const cookieStore = await cookies();
  const currentEventStartsAt =
    readDevGameTimeCookie(
      cookieStore.get(devGameTimeCookieName)?.value,
      todayGame.id,
    ) ?? new Date(todayGame.eventStartsAtIso);
  const eventStartsAt = rerollEventStartsAt(todayGame.id, currentEventStartsAt);
  const rerolledGame = createDailyGame(todayGame.id, eventStartsAt);

  cookieStore.set(
    devGameTimeCookieName,
    `${rerolledGame.id}|${rerolledGame.eventStartsAtIso}`,
    {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    },
  );

  return rerolledGame;
}

export async function clearDevTodayGameReroll() {
  const cookieStore = await cookies();

  cookieStore.delete(devGameTimeCookieName);
}

function createDailyGame(dateId: string, eventStartsAt: Date): DailyGame {
  return {
    id: dateId,
    eventStartsAtIso: eventStartsAt.toISOString(),
    eventStartsAtLabel: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(eventStartsAt),
  };
}

export function formatGameStartForTimeZone(
  eventStartsAtIso: string,
  timeZone: string,
): string {
  const eventStartsAt = new Date(eventStartsAtIso);

  try {
    return formatLocalGameStart(eventStartsAt, timeZone);
  } catch {
    return formatLocalGameStart(eventStartsAt, "UTC");
  }
}

export function formatPlayerGameStartForTimeZone({
  createdAt,
  publicGameplayAgreementAcceptedAt,
  timeZone,
}: {
  createdAt: string;
  publicGameplayAgreementAcceptedAt?: string;
  timeZone: string;
}): string {
  const gameStartedAt = new Date(publicGameplayAgreementAcceptedAt ?? createdAt);

  try {
    return formatLocalGameStart(gameStartedAt, timeZone);
  } catch {
    return formatLocalGameStart(gameStartedAt, "UTC");
  }
}

export async function getTodayGameDestination(
  clerkUserId: string,
  dailyGameId: string,
): Promise<TodayGameDestination> {
  const existingPlayer = await getPlayerForUserGame(clerkUserId, dailyGameId);

  if (existingPlayer) {
    return {
      href: "/game/today",
      reason: "has-player",
    };
  }

  return {
    href: "/player/new",
    reason: "needs-player",
  };
}

async function getRequestTimeZone(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieTimeZone = cookieStore.get(playerTimeZoneCookieName)?.value;
  const decodedTimeZone = decodeCookieValue(cookieTimeZone);

  return isValidTimeZone(decodedTimeZone) ? decodedTimeZone : null;
}

function getDateIdForTimeZone(date: Date, timeZone: string): string {
  if (timeZone === "UTC") {
    return date.toISOString().slice(0, 10);
  }

  try {
    const parts = new Intl.DateTimeFormat("en", {
      day: "2-digit",
      month: "2-digit",
      timeZone,
      year: "numeric",
    }).formatToParts(date);
    const year = getDatePart(parts, "year");
    const month = getDatePart(parts, "month");
    const day = getDatePart(parts, "day");

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Fall back to the UTC date if the browser timezone is malformed.
  }

  return date.toISOString().slice(0, 10);
}

function isValidTimeZone(timeZone: string | undefined): timeZone is string {
  if (!timeZone) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function decodeCookieValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getEventStartsAt(dateId: string): Date {
  const hash = Array.from(dateId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const minutesAfterMidnight = (hash % EVENT_MINUTE_BUCKETS) * 15;
  const eventStartsAt = new Date(`${dateId}T00:00:00.000Z`);
  eventStartsAt.setUTCMinutes(minutesAfterMidnight);

  return eventStartsAt;
}

function rerollEventStartsAt(dateId: string, currentEventStartsAt: Date): Date {
  const currentBucket =
    currentEventStartsAt.getUTCHours() * 4 +
    Math.floor(currentEventStartsAt.getUTCMinutes() / 15);
  let nextBucket = Math.floor(Math.random() * EVENT_MINUTE_BUCKETS);

  if (nextBucket === currentBucket) {
    nextBucket = (nextBucket + 1) % EVENT_MINUTE_BUCKETS;
  }

  const eventStartsAt = new Date(`${dateId}T00:00:00.000Z`);
  eventStartsAt.setUTCMinutes(nextBucket * 15);

  return eventStartsAt;
}

function readDevGameTimeCookie(
  cookieValue: string | undefined,
  expectedDateId: string,
): Date | null {
  if (!cookieValue) {
    return null;
  }

  const [dateId, isoDate] = cookieValue.split("|");

  if (dateId !== expectedDateId || !isoDate) {
    return null;
  }

  const eventStartsAt = new Date(isoDate);

  return Number.isNaN(eventStartsAt.getTime()) ? null : eventStartsAt;
}

function formatLocalGameStart(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
    weekday: "long",
  }).formatToParts(date);
  const weekday = getDatePart(parts, "weekday");
  const hour = Number(getDatePart(parts, "hour"));
  const minute = getDatePart(parts, "minute");
  const daypart = getDaypart(hour);
  const meridiem = hour < 12 ? "am" : "pm";
  const displayHour = hour % 12 || 12;
  const displayTime =
    minute === "00"
      ? `${displayHour}${meridiem}`
      : `${displayHour}:${minute}${meridiem}`;

  return `${displayTime} on ${weekday} ${daypart}`;
}

function getDatePart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function getDaypart(
  hour: number,
): "early morning" | "morning" | "afternoon" | "night" {
  if (hour < 5) {
    return "early morning";
  }

  if (hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  return "night";
}
