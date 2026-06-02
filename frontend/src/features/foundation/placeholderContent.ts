import { BookOpen, Settings } from "lucide-react";

import { placeholderModuleKeys } from "./types";
import type { PlaceholderModule, PlaceholderModuleKey } from "./types";

const sharedReadinessItems = [
  "ใช้ AppShell เดียวกับทุกหน้าหลัก",
  "พร้อมแทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา",
  "คุมระยะ สี และ typography ด้วย design tokens"
] as const;

export const placeholderModules = {
  courses: {
    description:
      "พื้นที่สำหรับจัดคอร์ส บทเรียน และความคืบหน้าของผู้เรียนตามโครง AI Tutor",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Courses module",
    href: "/courses",
    icon: BookOpen,
    key: "courses",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "คอร์สเรียน"
  },
  settings: {
    description:
      "พื้นที่สำหรับจัดการโปรไฟล์ การแจ้งเตือน บัญชี และตัวเลือกของแพลตฟอร์ม",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Settings module",
    href: "/settings",
    icon: Settings,
    key: "settings",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "การตั้งค่า"
  }
} satisfies Record<PlaceholderModuleKey, PlaceholderModule>;

export { placeholderModuleKeys };

export const getPlaceholderModule = (key: PlaceholderModuleKey) => placeholderModules[key];
