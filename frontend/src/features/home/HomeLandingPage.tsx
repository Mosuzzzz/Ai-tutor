"use client";

import { useEffect, useRef, useState } from "react";

import type { AuthSession } from "../auth/types";
import { HomeAccess } from "./HomeAccess";
import { HomeFaq } from "./HomeFaq";
import { HomeFeatureGrid } from "./HomeFeatureGrid";
import { HomeFinalCta } from "./HomeFinalCta";
import { HomeFooter } from "./HomeFooter";
import { HomeHero } from "./HomeHero";
import { HomeLanguageMaterial } from "./HomeLanguageMaterial";
import { HomeMobileMenu } from "./HomeMobileMenu";
import { HomeNavbar } from "./HomeNavbar";
import { HomeProgress } from "./HomeProgress";
import { HomeQuizReview } from "./HomeQuizReview";
import { HomeStudyKit } from "./HomeStudyKit";
import { HomeTrust } from "./HomeTrust";
import { HomeWalkthrough } from "./HomeWalkthrough.client";
import { applyHomeTheme, persistHomeLanguage, persistHomeTheme, resolveInitialLanguage, resolveInitialTheme } from "./homePreferences";
import type { HomeLanguage, HomeTheme } from "./types";
import { useHomeSectionReveal } from "./useHomeSectionReveal";

export const HomeLandingPage = ({ initialSession }: { initialSession: AuthSession | null }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const [language, setLanguage] = useState<HomeLanguage>("en");
  const [theme, setTheme] = useState<HomeTheme>("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useHomeSectionReveal(rootRef);

  useEffect(() => {
    let isCurrent = true;
    const storage = typeof window === "undefined" ? null : window.localStorage;
    const prefersDark = typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
    queueMicrotask(() => {
      if (!isCurrent) return;
      setLanguage(resolveInitialLanguage(storage));
      setTheme(resolveInitialTheme(storage, prefersDark));
    });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (rootRef.current) applyHomeTheme(rootRef.current, theme);
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage((current) => {
      const next = current === "en" ? "th" : "en";
      persistHomeLanguage(typeof window === "undefined" ? null : window.localStorage, next);
      return next;
    });
  };
  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      persistHomeTheme(typeof window === "undefined" ? null : window.localStorage, next);
      return next;
    });
  };

  return (
    <div className="home-page" lang={language} ref={rootRef}>
      <HomeNavbar language={language} mobileMenuTriggerRef={mobileTriggerRef} onLanguageToggle={toggleLanguage} onMobileMenuOpen={() => setIsMobileMenuOpen(true)} onThemeToggle={toggleTheme} session={initialSession} theme={theme} />
      <main>
        <HomeHero language={language} session={initialSession} />
        <HomeFeatureGrid language={language} />
        <HomeStudyKit language={language} />
        <HomeWalkthrough language={language} />
        <HomeLanguageMaterial language={language} />
        <HomeQuizReview language={language} />
        <HomeProgress language={language} />
        <HomeTrust language={language} />
        <HomeAccess language={language} session={initialSession} />
        <HomeFaq language={language} />
        <HomeFinalCta language={language} session={initialSession} />
      </main>
      <HomeFooter language={language} session={initialSession} />
      <HomeMobileMenu isOpen={isMobileMenuOpen} language={language} onClose={() => setIsMobileMenuOpen(false)} session={initialSession} triggerRef={mobileTriggerRef} />
    </div>
  );
};
