"use client";

import Link from "next/link";
import type { RefObject } from "react";
import {
  BarChart3,
  Bot,
  FileText,
  Languages,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquareText,
  Moon,
  Sun
} from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";
import { HomeBrand } from "./HomeBrand";
import { HomeAccountMenu } from "./HomeAccountMenu";
import type { HomeLanguage, HomeNavigationIcon, HomeTheme } from "./types";

type HomeNavbarProps = {
  language: HomeLanguage;
  onLanguageToggle: () => void;
  onMobileMenuOpen: () => void;
  onThemeToggle: () => void;
  mobileMenuTriggerRef?: RefObject<HTMLButtonElement | null>;
  session?: AuthSession | null;
  theme: HomeTheme;
};

const navigationIcons: Record<HomeNavigationIcon, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  documents: FileText,
  chat: MessageSquareText,
  quiz: Bot,
  analytics: BarChart3
};

export const HomeNavbar = ({
  language,
  onLanguageToggle,
  onMobileMenuOpen,
  onThemeToggle,
  mobileMenuTriggerRef,
  session = null,
  theme
}: HomeNavbarProps) => {
  const content = HOME_CONTENT[language];
  const languageValue = language.toUpperCase();
  const isLight = theme === "light";

  return (
    <header className="home-navbar">
      <div className="home-navbar-inner">
        <HomeBrand />
        <nav aria-label="Primary navigation" className="home-desktop-navigation">
          {HOME_NAVIGATION.map(({ href, icon }) => {
            const Icon = navigationIcons[icon];
            const label = content.navigation[icon];
            return (
              <Link className="home-nav-link" href={href} key={href}>
                <Icon aria-hidden="true" size={16} strokeWidth={1.9} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="home-navbar-controls">
          <button aria-label={`${content.navbar.languageLabel}: ${languageValue}`} className="home-control-button home-language-control" onClick={onLanguageToggle} type="button">
            <Languages aria-hidden="true" size={17} />
            <span>{languageValue}</span>
          </button>
          <button aria-label={`${content.navbar.themeLabel}: ${isLight ? "Light" : "Dark"}`} aria-pressed={!isLight} className="home-control-button home-theme-control" onClick={onThemeToggle} type="button">
            {isLight ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
            <span className="sr-only">{isLight ? "Sun" : "Moon"}</span>
          </button>
          {session ? <HomeAccountMenu language={language} session={session} /> : <Link aria-label={content.navbar.loginLabel} className="home-login-link" href="/login">
              <LogIn aria-hidden="true" className="home-login-icon" size={17} />
              <span className="home-login-label">{content.navbar.loginLabel}</span>
            </Link>}
          <button aria-label={content.navbar.menuLabel} className="home-menu-button" onClick={onMobileMenuOpen} ref={mobileMenuTriggerRef} type="button">
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
