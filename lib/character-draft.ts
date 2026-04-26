export const pendingDraftStorageKey = "areYouIn.pendingCharacterDraft";

const usStateTimeZones: Record<string, string> = {
  al: "America/Chicago",
  alabama: "America/Chicago",
  ak: "America/Anchorage",
  alaska: "America/Anchorage",
  ar: "America/Chicago",
  arkansas: "America/Chicago",
  az: "America/Phoenix",
  arizona: "America/Phoenix",
  ca: "America/Los_Angeles",
  california: "America/Los_Angeles",
  co: "America/Denver",
  colorado: "America/Denver",
  ct: "America/New_York",
  connecticut: "America/New_York",
  dc: "America/New_York",
  de: "America/New_York",
  delaware: "America/New_York",
  fl: "America/New_York",
  florida: "America/New_York",
  ga: "America/New_York",
  georgia: "America/New_York",
  hi: "Pacific/Honolulu",
  hawaii: "Pacific/Honolulu",
  ia: "America/Chicago",
  iowa: "America/Chicago",
  id: "America/Boise",
  idaho: "America/Boise",
  il: "America/Chicago",
  illinois: "America/Chicago",
  in: "America/Indiana/Indianapolis",
  indiana: "America/Indiana/Indianapolis",
  ks: "America/Chicago",
  kansas: "America/Chicago",
  ky: "America/New_York",
  kentucky: "America/New_York",
  la: "America/Chicago",
  louisiana: "America/Chicago",
  ma: "America/New_York",
  massachusetts: "America/New_York",
  md: "America/New_York",
  maryland: "America/New_York",
  me: "America/New_York",
  maine: "America/New_York",
  mi: "America/Detroit",
  michigan: "America/Detroit",
  mn: "America/Chicago",
  minnesota: "America/Chicago",
  mo: "America/Chicago",
  missouri: "America/Chicago",
  ms: "America/Chicago",
  mississippi: "America/Chicago",
  mt: "America/Denver",
  montana: "America/Denver",
  nc: "America/New_York",
  northcarolina: "America/New_York",
  nd: "America/Chicago",
  northdakota: "America/Chicago",
  ne: "America/Chicago",
  nebraska: "America/Chicago",
  nh: "America/New_York",
  newhampshire: "America/New_York",
  nj: "America/New_York",
  newjersey: "America/New_York",
  nm: "America/Denver",
  newmexico: "America/Denver",
  nv: "America/Los_Angeles",
  nevada: "America/Los_Angeles",
  ny: "America/New_York",
  newyork: "America/New_York",
  oh: "America/New_York",
  ohio: "America/New_York",
  ok: "America/Chicago",
  oklahoma: "America/Chicago",
  or: "America/Los_Angeles",
  oregon: "America/Los_Angeles",
  pa: "America/New_York",
  pennsylvania: "America/New_York",
  ri: "America/New_York",
  rhodeisland: "America/New_York",
  sc: "America/New_York",
  southcarolina: "America/New_York",
  sd: "America/Chicago",
  southdakota: "America/Chicago",
  tn: "America/Chicago",
  tennessee: "America/Chicago",
  tx: "America/Chicago",
  texas: "America/Chicago",
  ut: "America/Denver",
  utah: "America/Denver",
  va: "America/New_York",
  virginia: "America/New_York",
  vt: "America/New_York",
  vermont: "America/New_York",
  wa: "America/Los_Angeles",
  washington: "America/Los_Angeles",
  wi: "America/Chicago",
  wisconsin: "America/Chicago",
  wv: "America/New_York",
  westvirginia: "America/New_York",
  wy: "America/Denver",
  wyoming: "America/Denver",
};

const countryTimeZones: Record<string, string> = {
  argentina: "America/Argentina/Buenos_Aires",
  belgium: "Europe/Brussels",
  brazil: "America/Sao_Paulo",
  chile: "America/Santiago",
  china: "Asia/Shanghai",
  colombia: "America/Bogota",
  denmark: "Europe/Copenhagen",
  france: "Europe/Paris",
  germany: "Europe/Berlin",
  india: "Asia/Kolkata",
  ireland: "Europe/Dublin",
  italy: "Europe/Rome",
  japan: "Asia/Tokyo",
  mexico: "America/Mexico_City",
  netherlands: "Europe/Amsterdam",
  norway: "Europe/Oslo",
  poland: "Europe/Warsaw",
  portugal: "Europe/Lisbon",
  singapore: "Asia/Singapore",
  spain: "Europe/Madrid",
  sweden: "Europe/Stockholm",
  switzerland: "Europe/Zurich",
  uk: "Europe/London",
  unitedkingdom: "Europe/London",
};

const cityTimeZones: Record<string, string> = {
  amsterdam: "Europe/Amsterdam",
  berlin: "Europe/Berlin",
  chicago: "America/Chicago",
  darienil: "America/Chicago",
  dublin: "Europe/Dublin",
  frankfurt: "Europe/Berlin",
  hamburg: "Europe/Berlin",
  london: "Europe/London",
  madrid: "Europe/Madrid",
  munich: "Europe/Berlin",
  paris: "Europe/Paris",
  rome: "Europe/Rome",
  stockholm: "Europe/Stockholm",
  tokyo: "Asia/Tokyo",
  zurich: "Europe/Zurich",
};

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function deriveTimeZoneFromLocation(
  location: string,
  fallbackTimeZone = "UTC",
): string {
  const normalized = normalizeLocation(location);
  const compact = normalized.replaceAll(" ", "");

  if (!normalized) {
    return fallbackTimeZone;
  }

  for (const [city, timeZone] of Object.entries(cityTimeZones)) {
    if (compact.includes(city)) {
      return timeZone;
    }
  }

  for (const [country, timeZone] of Object.entries(countryTimeZones)) {
    if (hasLocationToken(normalized, compact, country)) {
      return timeZone;
    }
  }

  for (const [state, timeZone] of Object.entries(usStateTimeZones)) {
    if (hasLocationToken(normalized, compact, state)) {
      return timeZone;
    }
  }

  return fallbackTimeZone;
}

export function getDraftTimeZone(location: string): string {
  const browserTimeZone = getBrowserTimeZone();

  return deriveTimeZoneFromLocation(location, browserTimeZone);
}

function normalizeLocation(location: string): string {
  return location
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasLocationToken(
  location: string,
  compactLocation: string,
  value: string,
): boolean {
  if (value.length > 2) {
    return compactLocation.includes(value);
  }

  return new RegExp(`(^| )${value}( |$)`).test(location);
}
