export type Theme = "dark" | "light";

export const themeCookieKey = "are-you-in-theme";
export const themeStorageKey = "are-you-in-theme";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}
