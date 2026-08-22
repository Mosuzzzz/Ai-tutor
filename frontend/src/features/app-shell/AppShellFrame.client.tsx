"use client";

import type { ReactNode } from "react";

import type { AuthSession } from "../auth/types";
import { ProductLanguageProvider } from "../product-navigation/ProductLanguageContext.client";
import { ProductNavigation } from "../product-navigation/ProductNavigation";
import { useProductPreferences } from "../product-navigation/useProductPreferences";

type AppShellFrameProps = {
  children: ReactNode;
  session: AuthSession;
};

export const AppShellFrame = ({ children, session }: AppShellFrameProps) => {
  const { language, theme, toggleLanguage, toggleTheme } = useProductPreferences();

  return (
    <ProductLanguageProvider language={language}>
      <div className="product-frame overflow-x-clip" data-product-theme={theme} lang={language}>
      <a
        className="sr-only z-[100] rounded bg-primary px-4 py-3 text-label-md font-bold text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-2"
        href="#main-content"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <ProductNavigation
        language={language}
        logoutRedirect="/login"
        mode="product"
        onLanguageToggle={toggleLanguage}
        onThemeToggle={toggleTheme}
        session={session}
        theme={theme}
      />
      <main
        aria-label="พื้นที่เนื้อหาหลัก"
        className="min-h-[calc(100vh-4.75rem)] bg-foundation-canvas text-foundation-ink outline-none"
        id="main-content"
        tabIndex={-1}
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 py-6 md:px-8 md:py-9 lg:px-10 xl:px-12">
          {children}
        </div>
      </main>
      </div>
    </ProductLanguageProvider>
  );
};
