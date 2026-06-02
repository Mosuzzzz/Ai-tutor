import type { LearningAnalyticsViewModel } from "./types";

export const learningAnalyticsMock: LearningAnalyticsViewModel = {
  activities: [
    {
      actorLabel: "ศิวกร",
      description: "ทำควิซความปลอดภัยห้องปฏิบัติการและได้คะแนนสูงขึ้นจากครั้งก่อน",
      id: "activity-lab-quiz",
      occurredAtLabel: "วันนี้ 09:20",
      scorePercent: 88,
      title: "ส่งควิซความปลอดภัยห้องปฏิบัติการ",
      type: "quiz"
    },
    {
      actorLabel: "อาจารย์มาวี",
      description: "เพิ่มสรุปเอกสารใหม่สำหรับบทเรียนเวกเตอร์และแรง",
      id: "activity-vector-doc",
      occurredAtLabel: "เมื่อวาน 15:40",
      title: "อัปเดตเอกสารเวกเตอร์และแรง",
      type: "document"
    },
    {
      actorLabel: "AI Tutor",
      description: "ตอบคำถามพร้อม citation เรื่องการอ่านหลักฐานจากเอกสาร",
      id: "activity-citation-chat",
      occurredAtLabel: "31 พ.ค. 2026",
      title: "แชทช่วยทบทวน citation",
      type: "chat"
    }
  ],
  apiResponse: {
    average_tenant_score: 84.2,
    department_stats: [
      {
        label: "ready_documents",
        value: 18
      },
      {
        label: "processing_documents",
        value: 3
      },
      {
        label: "pending_documents",
        value: 2
      },
      {
        label: "error_documents",
        value: 1
      }
    ],
    score_trend: [
      {
        average_score: 72,
        date: "2026-05-26"
      },
      {
        average_score: 75,
        date: "2026-05-27"
      },
      {
        average_score: 78,
        date: "2026-05-28"
      },
      {
        average_score: 77,
        date: "2026-05-29"
      },
      {
        average_score: 81,
        date: "2026-05-30"
      },
      {
        average_score: 83,
        date: "2026-05-31"
      },
      {
        average_score: 84,
        date: "2026-06-01"
      }
    ],
    skill_gaps: [
      {
        description: "ผู้เรียนตอบผิดบ่อยในโจทย์ที่ต้องเชื่อมแรงลัพธ์กับทิศทางของเวกเตอร์",
        error_rate: 44.8,
        incorrect_count: 11,
        topic: "เวกเตอร์และแรง",
        total_attempts: 25
      },
      {
        description: "ยังมีบางกลุ่มลืมตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง",
        error_rate: 28.4,
        incorrect_count: 7,
        topic: "ความปลอดภัยห้องปฏิบัติการ",
        total_attempts: 25
      },
      {
        description: "ต้องฝึกอ่าน citation แล้วอธิบายหลักฐานด้วยคำของตัวเอง",
        error_rate: 12.2,
        incorrect_count: 3,
        topic: "การอ่าน citation",
        total_attempts: 25
      }
    ],
    total_employees: 156,
    total_quizzes_taken: 248
  },
  generatedAtLabel: "อัปเดตล่าสุด 2 มิ.ย. 2026",
  learnerAnalyticsEndpoint: "/api/analytics/dashboard",
  trainerAnalyticsEndpoint: "/api/analytics/trainer",
  workspaceName: "Learning Analytics Workspace"
};
