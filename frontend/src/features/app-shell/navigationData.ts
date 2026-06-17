import {
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Sparkles
} from "lucide-react";

import { filterNavigationItemsForRole } from "../auth/authRoutePolicy";
import type { AuthRouteRole } from "../auth/types";
import type { NavigationItem, ShellAction } from "./types";

const ALL_AUTH_ROLES = ["user", "admin"] as const;
export const primaryNavigation = [
  { allowedRoles: ALL_AUTH_ROLES, href: "/", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/documents", icon: FileText, label: "เอกสารของฉัน" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/chat", icon: MessageSquareText, label: "แชทกับเอกสาร" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/quiz", icon: Bot, label: "ควิซทบทวน" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/analytics", icon: BarChart3, label: "สถิติการทบทวน" }
] satisfies NavigationItem[];

export const secondaryNavigation = [
  { allowedRoles: ALL_AUTH_ROLES, href: "/settings", icon: Settings, label: "การตั้งค่า" }
] satisfies NavigationItem[];

export const aiAction = {
  href: "/documents",
  icon: Sparkles,
  label: "เริ่มจากเอกสาร"
} satisfies ShellAction;

export const getPrimaryNavigationForRole = (role: AuthRouteRole) => {
  return filterNavigationItemsForRole(primaryNavigation, role);
};

export const getSecondaryNavigationForRole = (role: AuthRouteRole) => {
  return filterNavigationItemsForRole(secondaryNavigation, role);
};
