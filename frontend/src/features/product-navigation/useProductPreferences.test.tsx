import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HOME_LANGUAGE_STORAGE_KEY, HOME_THEME_STORAGE_KEY } from "../home/homePreferences";
import { useProductPreferences } from "./useProductPreferences";

const mediaQuery = (matches: boolean) => ({ matches });

describe("useProductPreferences", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("restores the same persisted language and theme used by Home", async () => {
    localStorage.setItem(HOME_LANGUAGE_STORAGE_KEY, "th");
    localStorage.setItem(HOME_THEME_STORAGE_KEY, "dark");
    vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery(false)));

    const { result } = renderHook(() => useProductPreferences());

    await waitFor(() => expect(result.current.language).toBe("th"));
    expect(result.current.theme).toBe("dark");
  });

  it("persists preference toggles for the next Home or App route", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery(false)));
    const { result } = renderHook(() => useProductPreferences());

    act(() => {
      result.current.toggleLanguage();
      result.current.toggleTheme();
    });

    expect(localStorage.getItem(HOME_LANGUAGE_STORAGE_KEY)).toBe("th");
    expect(localStorage.getItem(HOME_THEME_STORAGE_KEY)).toBe("dark");
  });

  it("uses the system dark preference only when no explicit theme is stored", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery(true)));
    const { result } = renderHook(() => useProductPreferences());

    await waitFor(() => expect(result.current.theme).toBe("dark"));
  });
});
