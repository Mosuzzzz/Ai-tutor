import { describe, expect, it, vi } from "vitest";

import {
  HOME_LANGUAGE_STORAGE_KEY,
  HOME_THEME_STORAGE_KEY,
  applyHomeTheme,
  persistHomeLanguage,
  persistHomeTheme,
  readStoredLanguage,
  readStoredTheme,
  resolveInitialLanguage,
  resolveInitialTheme
} from "./homePreferences";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const storageWith = (key: string, value: string) => {
  const storage = new MemoryStorage();
  storage.setItem(key, value);
  return storage;
};

describe("Home preferences", () => {
  it("uses versioned Home storage keys", () => {
    expect(HOME_LANGUAGE_STORAGE_KEY).toBe("ai-tutor.home.language.v1");
    expect(HOME_THEME_STORAGE_KEY).toBe("ai-tutor.home.theme.v1");
  });

  it("defaults language to English and accepts only a stored supported language", () => {
    const emptyStorage = new MemoryStorage();

    expect(resolveInitialLanguage(emptyStorage)).toBe("en");
    expect(resolveInitialLanguage(storageWith("ai-tutor.home.language.v1", "th"))).toBe("th");
    expect(resolveInitialLanguage(storageWith("ai-tutor.home.language.v1", "xx"))).toBe("en");
    expect(readStoredLanguage(storageWith("ai-tutor.home.language.v1", "en"))).toBe("en");
    expect(readStoredLanguage(storageWith("ai-tutor.home.language.v1", "xx"))).toBeNull();
  });

  it("resolves theme from storage before the explicit system preference", () => {
    const emptyStorage = new MemoryStorage();

    expect(resolveInitialTheme(emptyStorage, true)).toBe("dark");
    expect(resolveInitialTheme(emptyStorage, false)).toBe("light");
    expect(resolveInitialTheme(storageWith("ai-tutor.home.theme.v1", "light"), true)).toBe("light");
    expect(readStoredTheme(storageWith("ai-tutor.home.theme.v1", "dark"))).toBe("dark");
    expect(readStoredTheme(storageWith("ai-tutor.home.theme.v1", "system"))).toBeNull();
  });

  it("persists valid explicit preferences", () => {
    const storage = new MemoryStorage();

    persistHomeLanguage(storage, "th");
    persistHomeTheme(storage, "dark");

    expect(storage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("th");
    expect(storage.getItem(HOME_THEME_STORAGE_KEY)).toBe("dark");
  });

  it("absorbs unavailable storage failures while persisting preferences", () => {
    const storage = { setItem: vi.fn(() => { throw new Error("blocked"); }) } as unknown as Storage;

    expect(() => persistHomeLanguage(storage, "en")).not.toThrow();
    expect(() => persistHomeTheme(storage, "light")).not.toThrow();
  });

  it("applies the selected theme to the supplied element", () => {
    const element = document.createElement("main");

    applyHomeTheme(element, "dark");

    expect(element.getAttribute("data-home-theme")).toBe("dark");
  });
});
