import type { LucideIcon } from "lucide-react";

export const placeholderModuleKeys = [
  "courses",
  "documents",
  "chat",
  "quiz",
  "analytics",
  "settings"
] as const;

export type PlaceholderModuleKey = (typeof placeholderModuleKeys)[number];

export type PlaceholderModule = {
  description: string;
  handoffNote: string;
  href: `/${string}`;
  icon: LucideIcon;
  key: PlaceholderModuleKey;
  readinessItems: readonly [string, string, string];
  statusLabel: "Foundation ready";
  title: string;
};
