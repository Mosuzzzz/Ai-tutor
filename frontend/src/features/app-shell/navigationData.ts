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

import type { NavigationItem, ShellAction } from "./types";

export const primaryNavigation = [
  { href: "/", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { href: "/teacher", icon: GraduationCap, label: "แดชบอร์ดครู" },
  { href: "/courses", icon: BookOpen, label: "คอร์สเรียน" },
  { href: "/documents", icon: FileText, label: "สรุปเอกสาร" },
  { href: "/chat", icon: MessageSquareText, label: "แชท AI" },
  { href: "/quiz", icon: Bot, label: "สร้างควิซ" },
  { href: "/analytics", icon: BarChart3, label: "สถิติการเรียน" }
] satisfies NavigationItem[];

export const secondaryNavigation = [
  { href: "/settings", icon: Settings, label: "การตั้งค่า" }
] satisfies NavigationItem[];

export const aiAction = {
  icon: Sparkles,
  label: "เริ่มเรียนเลย"
} satisfies ShellAction;
