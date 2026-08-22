"use client";

import { useEffect, useRef } from "react";

import type { AuthSession } from "../auth/types";
import { HomeAccess } from "./HomeAccess";
import { HomeFaq } from "./HomeFaq";
import { HomeFeatureGrid } from "./HomeFeatureGrid";
import { HomeFinalCta } from "./HomeFinalCta";
import { HomeFooter } from "./HomeFooter";
import { HomeHero } from "./HomeHero";
import { HomeLanguageMaterial } from "./HomeLanguageMaterial";
import { HomeProgress } from "./HomeProgress";
import { HomeQuizReview } from "./HomeQuizReview";
import { HomeStudyKit } from "./HomeStudyKit";
import { HomeTrust } from "./HomeTrust";
import { HomeWalkthrough } from "./HomeWalkthrough.client";
import { applyHomeTheme } from "./homePreferences";
import { useHomeSectionReveal } from "./useHomeSectionReveal";
import { ProductNavigation } from "../product-navigation/ProductNavigation";
import { useProductPreferences } from "../product-navigation/useProductPreferences";

export const HomeLandingPage = ({ initialSession }: { initialSession: AuthSession | null }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { language, theme, toggleLanguage, toggleTheme } = useProductPreferences();

  useHomeSectionReveal(rootRef);

  useEffect(() => {
    if (rootRef.current) { applyHomeTheme(rootRef.current, theme); rootRef.current.setAttribute("data-product-theme", theme); }
  }, [theme]);

  return (
    <div className="home-page product-frame" lang={language} ref={rootRef}>
      <ProductNavigation language={language} mode={initialSession ? "product" : "marketing"} onLanguageToggle={toggleLanguage} onThemeToggle={toggleTheme} session={initialSession} theme={theme} />
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
    </div>
  );
};
