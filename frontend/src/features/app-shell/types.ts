import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { AuthRouteRole, AuthSession } from "../auth/types";

export type AppShellProps = {
  children: ReactNode;
  session: AuthSession;
};

export type NavigationItem = {
  allowedRoles: readonly AuthRouteRole[];
  href: string;
  icon: LucideIcon;
  label: string;
};

export type ShellAction = {
  icon: LucideIcon;
  label: string;
};
