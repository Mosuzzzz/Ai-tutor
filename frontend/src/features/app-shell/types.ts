import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AppShellProps = {
  children: ReactNode;
};

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export type ShellAction = {
  icon: LucideIcon;
  label: string;
};
