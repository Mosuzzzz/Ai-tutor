export type HomeLanguage = "en" | "th";

export type HomeTheme = "light" | "dark";

export type HomeNavigationIcon = "dashboard" | "documents" | "chat" | "quiz" | "analytics";

export type HomeNavigationItem = {
  href: string;
  icon: HomeNavigationIcon;
};

export type HomeNavbarContent = {
  languageLabel: string;
  themeLabel: string;
  themeLightLabel: string;
  themeDarkLabel: string;
  themeLightIconLabel: string;
  themeDarkIconLabel: string;
  menuLabel: string;
  loginLabel: string;
  accountGreeting: string;
  logoutLabel: string;
  logoutError: string;
};

export type HomeNavigationContent = Record<HomeNavigationIcon, string>;

export type HomeHeroContent = {
  eyebrow: string;
  heading: string;
  body: string;
  guestCta: string;
  authenticatedCta: string;
  supportingLine: string;
};

export type HomeFeatureContent = {
  title: string;
  description: string;
};

export type HomeContent = {
  navbar: HomeNavbarContent;
  navigation: HomeNavigationContent;
  hero: HomeHeroContent;
  features: [HomeFeatureContent, HomeFeatureContent, HomeFeatureContent];
};
