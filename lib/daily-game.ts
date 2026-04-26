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

export function getTodayGame(now = new Date()): DailyGame {
  const dateId = getGlobalDateId(now);
  const eventStartsAt = getEventStartsAt(dateId);

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

function getGlobalDateId(date: Date): string {
  return date.toISOString().slice(0, 10);
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

function getDaypart(hour: number): "morning" | "afternoon" | "night" {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  return "night";
}
