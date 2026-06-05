import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Sparkles
} from "lucide-react";

import { filterNavigationItemsForRole } from "../auth/authRoutePolicy";
import type { AuthRouteRole } from "../auth/types";
import type { NavigationItem, ShellAction } from "./types";

const ALL_AUTH_ROLES = ["student", "teacher", "tenant_admin", "global_admin"] as const;
const TEACHER_ROLES = ["teacher", "tenant_admin"] as const;

export const primaryNavigation = [
  { allowedRoles: ["student"], href: "/", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { allowedRoles: TEACHER_ROLES, href: "/teacher", icon: GraduationCap, label: "แดชบอร์ดครู" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/courses", icon: BookOpen, label: "คอร์สเรียน" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/documents", icon: FileText, label: "สรุปเอกสาร" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/chat", icon: MessageSquareText, label: "แชท AI" },
  { allowedRoles: TEACHER_ROLES, href: "/quiz", icon: Bot, label: "สร้างควิซ" },
  { allowedRoles: ALL_AUTH_ROLES, href: "/analytics", icon: BarChart3, label: "สถิติการเรียน" }
] satisfies NavigationItem[];

export const secondaryNavigation = [
  { allowedRoles: ALL_AUTH_ROLES, href: "/settings", icon: Settings, label: "การตั้งค่า" }
] satisfies NavigationItem[];

export const aiAction = {
  icon: Sparkles,
  label: "เริ่มเรียนเลย"
} satisfies ShellAction;

export const getPrimaryNavigationForRole = (role: AuthRouteRole) => {
  return filterNavigationItemsForRole(primaryNavigation, role);
};

export const getSecondaryNavigationForRole = (role: AuthRouteRole) => {
  return filterNavigationItemsForRole(secondaryNavigation, role);
};
