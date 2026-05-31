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
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", icon: LayoutDashboard, label: "แดชบอร์ด" },
  { href: "/teacher", icon: GraduationCap, label: "แดชบอร์ดครู" },
  { href: "/courses", icon: BookOpen, label: "คอร์สเรียน" },
  { href: "/documents", icon: FileText, label: "สรุปเอกสาร" },
  { href: "/chat", icon: MessageSquareText, label: "แชท AI" },
  { href: "/quiz", icon: Bot, label: "สร้างควิซ" },
  { href: "/analytics", icon: BarChart3, label: "สถิติการเรียน" }
];

export const secondaryNavigation: NavigationItem[] = [
  { href: "/settings", icon: Settings, label: "การตั้งค่า" }
];

export const aiAction = {
  icon: Sparkles,
  label: "เริ่มเรียนเลย"
};
