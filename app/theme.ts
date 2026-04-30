export type Theme = "dark" | "light";

export const themeStorageKey = "are-you-in-theme";

export function themeInitializationScript() {
  return `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("${themeStorageKey}");
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.theme = "dark";
  }
})();
`;
}
