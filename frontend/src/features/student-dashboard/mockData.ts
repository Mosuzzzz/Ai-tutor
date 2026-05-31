import type { StudentDashboardViewModel } from "./types";

export const STUDENT_DASHBOARD_API_PATH = "/api/analytics/dashboard";

export const studentDashboardMock = {
  learnerName: "ศิวกร",
  roleLabel: "ผู้เรียน",
  generatedAtLabel: "วันนี้ 17:00",
  nextMilestone: "รักษาสตรีก 7 วัน และทบทวนเวกเตอร์แคลคูลัสให้จบในวันนี้",
  apiResponse: {
    completed_quizzes: 24,
    average_score: 85,
    streak_days: 7,
    read_documents_count: 12,
    recent_scores: [
      {
        id: "score-vector-recap",
        exam_id: "exam-vector-recap",
        filename: "สรุปเวกเตอร์แคลคูลัส.pdf",
        score: 92,
        submitted_at: "2026-05-31T10:00:00.000Z"
      },
      {
        id: "score-robotics",
        exam_id: "exam-robotics-joint",
        filename: "การประกอบข้อต่อหุ่นยนต์.pdf",
        score: 84,
        submitted_at: "2026-05-30T10:00:00.000Z"
      },
      {
        id: "score-ai-foundation",
        exam_id: "exam-ai-foundation",
        filename: "โน้ตพื้นฐาน AI.pdf",
        score: 79,
        submitted_at: "2026-05-29T10:00:00.000Z"
      }
    ],
    score_trend: [
      { id: "trend-mon", date: "จ", average_score: 72 },
      { id: "trend-tue", date: "อ", average_score: 78 },
      { id: "trend-wed", date: "พ", average_score: 75 },
      { id: "trend-thu", date: "พฤ", average_score: 82 },
      { id: "trend-fri", date: "ศ", average_score: 85 },
      { id: "trend-sat", date: "ส", average_score: 88 },
      { id: "trend-sun", date: "อา", average_score: 85 }
    ]
  },
  continueLearning: [
    {
      id: "continue-vector-calculus",
      title: "ทบทวนเวกเตอร์แคลคูลัส",
      source: "บทเรียนที่ AI สร้างให้",
      progressPercent: 68,
      minutesRemaining: 18,
      href: "/courses",
      type: "lesson"
    },
    {
      id: "continue-robotics-joint",
      title: "การประกอบข้อต่อหุ่นยนต์",
      source: "สรุปจากเอกสาร",
      progressPercent: 44,
      minutesRemaining: 12,
      href: "/documents",
      type: "document"
    },
    {
      id: "continue-ai-quiz",
      title: "ควิซพื้นฐาน AI",
      source: "ชุดฝึกทำแบบทดสอบ",
      progressPercent: 30,
      minutesRemaining: 9,
      href: "/quiz",
      type: "quiz"
    }
  ],
  assistantPrompts: [
    {
      id: "prompt-explain",
      title: "อธิบายหัวข้อที่ยังอ่อน",
      description: "ให้ AI Tutor เชื่อมจุดที่พลาดจากควิซล่าสุดกับแผนทบทวนแบบสั้น",
      href: "/chat"
    },
    {
      id: "prompt-quiz",
      title: "สร้างควิซเฉพาะจุด",
      description: "สร้างคำถามจากโน้ตที่อัปโหลด และเน้นแนวคิดที่คะแนนยังต่ำ",
      href: "/quiz"
    }
  ]
} satisfies StudentDashboardViewModel;

export const fetchStudentDashboard = async () => {
  return studentDashboardMock;
};
