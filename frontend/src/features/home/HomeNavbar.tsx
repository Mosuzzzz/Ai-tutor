"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Languages, LogIn, Menu, Moon, Sun } from "lucide-react";

import type { AuthSession } from "../auth/types";
import { HOME_CONTENT, HOME_NAVIGATION } from "./homeContent";
import { HomeBrand } from "./HomeBrand";
import { HomeAccountMenu } from "./HomeAccountMenu";
import type { HomeLanguage, HomeTheme } from "./types";

type HomeNavbarProps = {
  language: HomeLanguage;
  onLanguageToggle: () => void;
  onMobileMenuOpen: () => void;
  onThemeToggle: () => void;
  mobileMenuTriggerRef?: RefObject<HTMLButtonElement | null>;
  session?: AuthSession | null;
  theme: HomeTheme;
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
  const themeStateLabel = isLight ? content.navbar.themeLightLabel : content.navbar.themeDarkLabel;
  const themeIconLabel = isLight ? content.navbar.themeLightIconLabel : content.navbar.themeDarkIconLabel;

  return (
    <header className="home-navbar">
      <div className="home-navbar-inner">
        <HomeBrand />
        <nav aria-label="Primary navigation" className="home-desktop-navigation">
          {HOME_NAVIGATION.map(({ href, key }) => {
            const label = content.navigation[key];
            return (
              <Link className="home-nav-link" href={href} key={href}>
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
          <button aria-label={`${content.navbar.themeLabel}: ${themeStateLabel}`} aria-pressed={!isLight} className="home-control-button home-theme-control" onClick={onThemeToggle} type="button">
            {isLight ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
            <span className="sr-only">{themeIconLabel}</span>
          </button>
          {session ? <><Link className="home-workspace-link" href="/dashboard">{content.navigation.myWorkspace}</Link><HomeAccountMenu language={language} session={session} /></> : <><Link aria-label={content.navbar.loginLabel} className="home-login-link home-login-secondary" href="/login">
              <LogIn aria-hidden="true" className="home-login-icon" size={17} />
              <span className="home-login-label">{content.navbar.loginLabel}</span>
            </Link><Link className="home-workspace-link" href="/register">{content.navigation.startStudying}</Link></>}
          <button aria-label={content.navbar.menuLabel} className="home-menu-button" onClick={onMobileMenuOpen} ref={mobileMenuTriggerRef} type="button">
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
