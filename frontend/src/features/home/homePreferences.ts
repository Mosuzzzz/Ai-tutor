import type { HomeLanguage, HomeTheme } from "./types";

export const HOME_LANGUAGE_STORAGE_KEY = "ai-tutor.home.language.v1";
export const HOME_THEME_STORAGE_KEY = "ai-tutor.home.theme.v1";

const isHomeLanguage = (value: string | null): value is HomeLanguage => value === "en" || value === "th";
const isHomeTheme = (value: string | null): value is HomeTheme => value === "light" || value === "dark";

export const readStoredLanguage = (storage: Storage | null | undefined): HomeLanguage | null => {
  try {
    const language = storage?.getItem(HOME_LANGUAGE_STORAGE_KEY) ?? null;
    return isHomeLanguage(language) ? language : null;
  } catch {
    return null;
  }
};

export const readStoredTheme = (storage: Storage | null | undefined): HomeTheme | null => {
  try {
    const theme = storage?.getItem(HOME_THEME_STORAGE_KEY) ?? null;
    return isHomeTheme(theme) ? theme : null;
  } catch {
    return null;
  }
};

export const resolveInitialLanguage = (storage: Storage | null | undefined): HomeLanguage => {
  return readStoredLanguage(storage) ?? "en";
};

export const resolveInitialTheme = (
  storage: Storage | null | undefined,
  systemPrefersDark: boolean
): HomeTheme => {
  return readStoredTheme(storage) ?? (systemPrefersDark ? "dark" : "light");
};

export const persistHomeLanguage = (storage: Storage | null | undefined, language: HomeLanguage): void => {
  try {
    storage?.setItem(HOME_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Browsers may deny storage access in private or restricted contexts.
  }
};

export const persistHomeTheme = (storage: Storage | null | undefined, theme: HomeTheme): void => {
  try {
    storage?.setItem(HOME_THEME_STORAGE_KEY, theme);
  } catch {
    // Browsers may deny storage access in private or restricted contexts.
  }
};

export const applyHomeTheme = (element: Element, theme: HomeTheme): void => {
  element.setAttribute("data-home-theme", theme);
};
