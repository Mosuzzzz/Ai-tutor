import {
  BarChart3,
  BookOpen,
  Bot,
  FileText,
  MessageSquareText,
  Settings
} from "lucide-react";

import { placeholderModuleKeys } from "./types";
import type { PlaceholderModule, PlaceholderModuleKey } from "./types";

const sharedReadinessItems = [
  "ใช้ AppShell เดียวกับ Dashboard",
  "พร้อมต่อ API และ state จริง",
  "คุมระยะและสีด้วย design tokens"
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
  documents: {
    description:
      "ฐานหน้าสำหรับอัปโหลดเอกสาร สร้างสรุป และแยกประเด็นสำคัญจากไฟล์เรียน",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Document Summary",
    href: "/documents",
    icon: FileText,
    key: "documents",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "สรุปเอกสาร"
  },
  chat: {
    description:
      "พื้นที่สำหรับแชทกับ AI Tutor ถามตอบเนื้อหา และต่อยอดเป็น session การเรียน",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา AI Chat",
    href: "/chat",
    icon: MessageSquareText,
    key: "chat",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "แชท AI"
  },
  quiz: {
    description:
      "ฐานหน้าสำหรับสร้างแบบทดสอบจากบทเรียน เอกสาร หรือหัวข้อที่ผู้เรียนกำลังทบทวน",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Quiz Generator",
    href: "/quiz",
    icon: Bot,
    key: "quiz",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "สร้างควิซ"
  },
  analytics: {
    description:
      "พื้นที่สำหรับดูสถิติการเรียน คะแนน ความถี่ในการทบทวน และ insight เพื่อปรับแผนเรียน",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Learning Analytics",
    href: "/analytics",
    icon: BarChart3,
    key: "analytics",
    readinessItems: sharedReadinessItems,
    statusLabel: "Foundation ready",
    title: "สถิติการเรียน"
  },
  settings: {
    description:
      "ฐานหน้าสำหรับจัดการโปรไฟล์ การแจ้งเตือน บัญชี และตัวเลือกของแพลตฟอร์ม",
    handoffNote: "พร้อมให้แทนที่ด้วย feature จริงเมื่อเริ่มพัฒนา Settings",
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
