export const pendingDraftStorageKey = "areYouIn.pendingCharacterDraft";
export const playerTimeZoneCookieName = "areyouin-player-time-zone";

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getDraftTimeZone(): string {
  return getBrowserTimeZone();
}

export function persistBrowserTimeZoneCookie() {
  if (typeof document === "undefined") {
    return;
  }

  const timeZone = getBrowserTimeZone();
  const maxAge = 60 * 60 * 24 * 365;

  document.cookie = [
    `${playerTimeZoneCookieName}=${encodeURIComponent(timeZone)}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
}
