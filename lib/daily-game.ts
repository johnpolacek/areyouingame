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

export async function getTodayGameDestination(
  _clerkUserId: string,
  _dailyGameId: string,
): Promise<TodayGameDestination> {
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
