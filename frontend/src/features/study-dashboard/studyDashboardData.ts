import type { StudyDashboardViewModel } from "./types";

export const studyDashboardMock = {
  apiResponse: {
    average_score: 0,
    completed_quizzes: 0,
    read_documents_count: 0,
    recent_scores: [],
    score_trend: [],
    streak_days: 0
  },
  generatedAtLabel: "พร้อมเริ่มต้น",
  headline: "ยังไม่มีข้อมูลการเรียน",
  metrics: [
    {
      helper: "จะเริ่มนับหลังอัปโหลดและประมวลผลเสร็จ",
      id: "ready-documents",
      label: "เอกสารพร้อมอ่าน",
      value: "0"
    },
    {
      helper: "คะแนนแรกจะปรากฏหลังส่งคำตอบ",
      id: "completed-quizzes",
      label: "ควิซที่ทำแล้ว",
      value: "0"
    },
    {
      helper: "เริ่มต่อเนื่องเมื่อกลับมาทบทวนทุกวัน",
      id: "learning-streak",
      label: "สตรีกการทบทวน",
      value: "0 วัน"
    },
    {
      helper: "ระบบจะสรุปจากผลควิซและกิจกรรมจริง",
      id: "review-topics",
      label: "หัวข้อที่ควรทบทวน",
      value: "0%"
    }
  ],
  nextMilestone: "เริ่มจากเอกสารแรกของคุณ",
  onboardingSteps: [
    {
      description: "อัปโหลดไฟล์ที่ต้องการสรุปหรือใช้สร้างควิซ",
      id: "upload",
      title: "เพิ่มเอกสารเรียน"
    },
    {
      description: "ให้ AI Tutor เปลี่ยนเนื้อหาเป็นคำถามฝึกซ้อม",
      id: "quiz",
      title: "ทบทวนด้วยควิซ"
    },
    {
      description: "ติดตามคะแนน จุดแข็ง และหัวข้อที่ควรทบทวน",
      id: "analytics",
      title: "ดูสถิติส่วนตัว"
    }
  ],
  primaryAction: {
    description: "ให้ระบบสรุปและเตรียมเนื้อหา",
    href: "/documents",
    id: "upload-document",
    title: "อัปโหลดเอกสารแรก",
    tone: "primary"
  },
  secondaryActions: [
    {
      description: "ฝึกจากเอกสารที่พร้อมใช้งาน",
      href: "/quiz",
      id: "practice-quiz",
      title: "สร้างควิซทบทวน",
      tone: "secondary"
    },
    {
      description: "คะแนนและจุดที่ควรทบทวนจะอยู่ที่นี่",
      href: "/analytics",
      id: "review-analytics",
      title: "ดูสถิติการทบทวน",
      tone: "secondary"
    }
  ],
  summary:
    "เริ่มจากอัปโหลดเอกสารหรือสร้างควิซฝึกซ้อม เพื่อให้ AI Tutor สร้างเส้นทางทบทวนของคุณ",
  userName: "ผู้ใช้ AI Tutor"
} satisfies StudyDashboardViewModel;
