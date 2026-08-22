export type HomeLanguage = "en" | "th";
export type HomeTheme = "light" | "dark";
export type HomeNavigationKey = "howItWorks" | "studyKit" | "progress" | "faq";
export type HomeNavigationItem = { href: `#${string}`; key: HomeNavigationKey };

export type HomeNavbarContent = {
  languageLabel: string; themeLabel: string; themeLightLabel: string; themeDarkLabel: string;
  themeLightIconLabel: string; themeDarkIconLabel: string; menuLabel: string; loginLabel: string;
  accountGreeting: string; logoutLabel: string; logoutError: string;
};
export type HomeNavigationContent = Record<HomeNavigationKey, string> & { startStudying: string };
export type HomeHeroContent = {
  eyebrow: string; heading: string; body: string; guestCta: string; authenticatedCta: string;
  guestSecondaryCta: string; authenticatedSecondaryCta: string; supportingLine: string;
};
export type HomeStudySceneContent = {
  ariaLabel: string; documentLabel: string; documentMeta: string; summaryLabel: string; summaryText: string;
  questionLabel: string; questionText: string; answerLabel: string; answerText: string; sourceLabel: string;
  quizLabel: string; quizQuestion: string; quizChoice: string; resultLabel: string; pauseLabel: string; playLabel: string;
};
export type HomeFeatureContent = { title: string; description: string };
export type HomeSectionContent = { eyebrow: string; title: string; body: string };
export type HomeWalkthroughItem = { label: string; title: string; description: string; detail: string };
export type HomeFaqItem = { question: string; answer: string };

export type HomeContent = {
  navbar: HomeNavbarContent;
  navigation: HomeNavigationContent;
  hero: HomeHeroContent;
  studyScene: HomeStudySceneContent;
  promise: HomeSectionContent;
  features: [HomeFeatureContent, HomeFeatureContent, HomeFeatureContent, HomeFeatureContent];
  studyKit: HomeSectionContent & { steps: [HomeFeatureContent, HomeFeatureContent, HomeFeatureContent, HomeFeatureContent] };
  walkthrough: HomeSectionContent & { items: [HomeWalkthroughItem, HomeWalkthroughItem, HomeWalkthroughItem] };
  languageMaterial: HomeSectionContent & { formats: [string, string, string, string]; note: string };
  quiz: HomeSectionContent & { exampleLabel: string; question: string; choices: [string, string, string]; explanation: string; source: string };
  progress: HomeSectionContent & { exampleLabel: string; scoreLabel: string; reviewLabel: string; reviewTopic: string };
  trust: HomeSectionContent & { items: [HomeFeatureContent, HomeFeatureContent, HomeFeatureContent] };
  access: HomeSectionContent & { guestTitle: string; guestBody: string; guestCta: string; memberTitle: string; memberBody: string };
  faq: HomeSectionContent & { items: HomeFaqItem[] };
  finalCta: { title: string; body: string; guestCta: string; authenticatedCta: string };
  footer: { description: string; productLabel: string; accountLabel: string; rights: string };
};
