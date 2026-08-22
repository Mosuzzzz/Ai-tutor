"use client";

import { useEffect, useState } from "react";

import { persistHomeLanguage, persistHomeTheme, resolveInitialLanguage, resolveInitialTheme } from "../home/homePreferences";
import type { HomeLanguage, HomeTheme } from "../home/types";

export const useProductPreferences = () => {
  const [language, setLanguage] = useState<HomeLanguage>("en");
  const [theme, setTheme] = useState<HomeTheme>("light");
  useEffect(() => {
    let current = true;
    const storage = typeof window === "undefined" ? null : window.localStorage;
    const dark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    queueMicrotask(() => { if (current) { setLanguage(resolveInitialLanguage(storage)); setTheme(resolveInitialTheme(storage, Boolean(dark))); } });
    return () => { current = false; };
  }, []);
  const toggleLanguage = () => setLanguage((value) => { const next = value === "en" ? "th" : "en"; persistHomeLanguage(window.localStorage, next); return next; });
  const toggleTheme = () => setTheme((value) => { const next = value === "light" ? "dark" : "light"; persistHomeTheme(window.localStorage, next); return next; });
  return { language, theme, toggleLanguage, toggleTheme };
};
