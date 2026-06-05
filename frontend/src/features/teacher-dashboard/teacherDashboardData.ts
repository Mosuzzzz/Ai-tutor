import type { TeacherDashboardViewModel } from "./types";

export const teacherDashboardMock = {
  teacherName: "ครูเมย์",
  generatedAtLabel: "วันนี้ 18:00",
  apiResponse: {
    total_students: 156,
    generated_quizzes: 24,
    reviewed_documents: 18,
    completion_rate: 0.82,
    classes: [
      {
        id: "class-data-science",
        title: "วิทยาศาสตร์ข้อมูล ม.5",
        subject: "Data Science",
        studentCount: 36,
        completionRate: 0.76,
        averageScore: 84,
        status: "active"
      },
      {
        id: "class-ai-foundation",
        title: "พื้นฐาน AI ม.4",
        subject: "AI Foundation",
        studentCount: 42,
        completionRate: 0.68,
        averageScore: 79,
        status: "active"
      },
      {
        id: "class-robotics",
        title: "หุ่นยนต์เบื้องต้น",
        subject: "Robotics",
        studentCount: 28,
        completionRate: 0.2,
        averageScore: 72,
        status: "upcoming"
      }
    ],
    quizzes: [
      {
        id: "quiz-vector",
        title: "ควิซเวกเตอร์แคลคูลัส",
        source: "สรุปเวกเตอร์แคลคูลัส.pdf",
        status: "published",
        submissionCount: 31,
        averageScore: 86
      },
      {
        id: "quiz-robotics",
        title: "ควิซข้อต่อหุ่นยนต์",
        source: "การประกอบข้อต่อหุ่นยนต์.pdf",
        status: "draft",
        submissionCount: 0,
        averageScore: 0
      },
      {
        id: "quiz-ai-safety",
        title: "ควิซความปลอดภัย AI",
        source: "โน้ตพื้นฐาน AI.pdf",
        status: "review",
        submissionCount: 18,
        averageScore: 81
      }
    ],
    activities: [
      {
        id: "activity-quiz",
        type: "quiz",
        title: "นักเรียนส่งควิซล่าสุด",
        description: "31 คนส่งควิซเวกเตอร์แคลคูลัสแล้ว",
        occurredAt: "12 นาทีที่แล้ว",
        count: 31
      },
      {
        id: "activity-document",
        type: "document",
        title: "เอกสารใหม่พร้อมสรุป",
        description: "AI สรุปเอกสารหุ่นยนต์เบื้องต้นเสร็จแล้ว",
        occurredAt: "35 นาทีที่แล้ว",
        count: 3
      },
      {
        id: "activity-student",
        type: "student",
        title: "ผู้เรียนต้องการความช่วยเหลือ",
        description: "มี 6 คนคะแนนต่ำกว่าเกณฑ์ในหัวข้อเวกเตอร์",
        occurredAt: "1 ชั่วโมงที่แล้ว",
        count: 6
      }
    ]
  }
} satisfies TeacherDashboardViewModel;
