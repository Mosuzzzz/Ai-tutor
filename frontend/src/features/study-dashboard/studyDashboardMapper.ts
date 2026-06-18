import type { AuthSession } from "../auth/types";
import type { StudyDashboardResponse } from "./studyDashboardContract";
import { formatScore } from "./studyDashboardHelpers";
import type { StudyDashboardMetric, StudyDashboardViewModel } from "./types";

type StudyDashboardViewModelInput = {
  response: StudyDashboardResponse;
  session: AuthSession;
  timestamp?: Date;
};

export const toStudyDashboardViewModel = ({
  response,
  session,
  timestamp = new Date()
}: StudyDashboardViewModelInput): StudyDashboardViewModel => {
  const userName = session.user.displayName?.trim() || session.user.email;
  const isEmpty = isStudyDashboardResponseEmpty(response);

  return {
    apiResponse: {
      average_score: response.average_score,
      completed_quizzes: response.completed_quizzes,
      read_documents_count: response.read_documents_count,
      recent_scores: response.recent_scores,
      score_trend: response.score_trend.map((point) => ({
        average_score: point.average_score,
        date: formatTrendDate(point.date),
        id: `trend-${point.date}`
      })),
      streak_days: response.streak_days
    },
    generatedAtLabel: formatGeneratedAt(timestamp),
    headline: isEmpty ? "ยังไม่มีข้อมูลการเรียน" : "แผนทบทวนของคุณพร้อมแล้ว",
    metrics: buildMetrics(response),
    nextMilestone: buildNextMilestone(response),
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
    summary: isEmpty
      ? `${userName} ยังไม่มีผลควิซหรือเอกสารพร้อมอ่านในระบบ เริ่มจากอัปโหลดเอกสารหรือสร้างควิซฝึกซ้อมเพื่อให้ AI Tutor สร้างเส้นทางทบทวนของคุณ`
      : `${userName} มีเอกสาร ${response.read_documents_count} รายการและควิซ ${response.completed_quizzes} ชุดในเส้นทางทบทวนล่าสุด`,
    userName
  };
};

export const isStudyDashboardResponseEmpty = (response: StudyDashboardResponse) => {
  return (
    response.average_score === 0 &&
    response.completed_quizzes === 0 &&
    response.read_documents_count === 0 &&
    response.recent_scores.length === 0 &&
    response.score_trend.length === 0 &&
    response.streak_days === 0
  );
};

const buildMetrics = (response: StudyDashboardResponse): StudyDashboardMetric[] => [
  {
    helper: "จะเริ่มนับหลังอัปโหลดและประมวลผลเสร็จ",
    id: "ready-documents",
    label: "เอกสารพร้อมอ่าน",
    value: String(response.read_documents_count)
  },
  {
    helper: "คะแนนแรกจะปรากฏหลังส่งคำตอบ",
    id: "completed-quizzes",
    label: "ควิซที่ทำแล้ว",
    value: String(response.completed_quizzes)
  },
  {
    helper: "เริ่มต่อเนื่องเมื่อกลับมาทบทวนทุกวัน",
    id: "learning-streak",
    label: "สตรีกการทบทวน",
    value: `${response.streak_days} วัน`
  },
  {
    helper: "ระบบจะสรุปจากผลควิซและกิจกรรมจริง",
    id: "review-topics",
    label: "หัวข้อที่ควรทบทวน",
    value: formatScore(response.average_score)
  }
];

const buildNextMilestone = (response: StudyDashboardResponse) => {
  if (isStudyDashboardResponseEmpty(response)) {
    return "เริ่มจากเอกสารแรกของคุณ";
  }

  if (response.average_score < 70) {
    return "ทบทวนหัวข้อที่คะแนนยังไม่มั่นคง";
  }

  return "ต่อยอดด้วยควิซทบทวนชุดถัดไป";
};

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};

const formatTrendDate = (dateValue: string) => {
  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Bangkok"
  }).format(date);
};
