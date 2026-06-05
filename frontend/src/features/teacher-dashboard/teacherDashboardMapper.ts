import type { AuthSession } from "../auth/types";
import type { TeacherDashboardResponse, TeacherStudentsResponse } from "./teacherDashboardContract";
import type {
  TeacherActivity,
  TeacherClassSummary,
  TeacherDashboardViewModel,
  TeacherQuizSummary
} from "./types";

type TeacherDashboardViewModelInput = {
  dashboard: TeacherDashboardResponse;
  session: AuthSession;
  students: TeacherStudentsResponse;
  timestamp?: Date;
};

type EmptyTeacherDashboardInput = {
  dashboard: TeacherDashboardResponse;
  students: TeacherStudentsResponse;
};

export const toTeacherDashboardViewModel = ({
  dashboard,
  session,
  students,
  timestamp = new Date()
}: TeacherDashboardViewModelInput): TeacherDashboardViewModel => {
  const teacherName = session.user.displayName?.trim() || session.user.email;
  const reviewedDocuments = getDepartmentStatValue(dashboard, "ready_documents");

  return {
    apiResponse: {
      activities: buildTeacherActivities(dashboard, reviewedDocuments),
      classes: students.map(toTeacherClassSummary),
      completion_rate: dashboard.average_tenant_score / 100,
      generated_quizzes: dashboard.total_quizzes_taken,
      quizzes: dashboard.skill_gaps.map(toTeacherQuizSummary),
      reviewed_documents: reviewedDocuments,
      total_students: dashboard.total_employees
    },
    generatedAtLabel: formatGeneratedAt(timestamp),
    teacherName
  };
};

export const isTeacherDashboardResponseEmpty = ({ dashboard, students }: EmptyTeacherDashboardInput) => {
  return (
    dashboard.average_tenant_score === 0 &&
    dashboard.department_stats.length === 0 &&
    dashboard.score_trend.length === 0 &&
    dashboard.skill_gaps.length === 0 &&
    dashboard.total_employees === 0 &&
    dashboard.total_quizzes_taken === 0 &&
    students.length === 0
  );
};

const toTeacherClassSummary = (student: TeacherStudentsResponse[number]): TeacherClassSummary => {
  const title = student.full_name?.trim() || student.email;

  return {
    averageScore: student.average_score,
    completionRate: student.average_score / 100,
    id: student.user_id,
    status: student.completed_quizzes > 0 ? "active" : "upcoming",
    studentCount: student.completed_quizzes,
    subject: student.email,
    title
  };
};

const toTeacherQuizSummary = (gap: TeacherDashboardResponse["skill_gaps"][number]): TeacherQuizSummary => {
  return {
    averageScore: Math.max(0, Math.round(100 - gap.error_rate)),
    id: `skill-gap-${gap.topic}`,
    source: gap.description,
    status: "review",
    submissionCount: gap.total_attempts,
    title: gap.topic
  };
};

const buildTeacherActivities = (dashboard: TeacherDashboardResponse, reviewedDocuments: number): TeacherActivity[] => {
  return [
    {
      count: dashboard.total_quizzes_taken,
      description: `${dashboard.total_quizzes_taken} ควิซที่ถูกส่งใน tenant นี้`,
      id: "activity-quiz-submissions",
      occurredAt: "อัปเดตจาก Backend",
      title: "ควิซที่ส่งแล้ว",
      type: "quiz"
    },
    {
      count: reviewedDocuments,
      description: `${reviewedDocuments} เอกสารพร้อมใช้สำหรับการสอน`,
      id: "activity-ready-documents",
      occurredAt: "อัปเดตจาก Backend",
      title: "เอกสารพร้อมสอน",
      type: "document"
    },
    {
      count: dashboard.skill_gaps.length,
      description: buildSkillGapSummary(dashboard),
      id: "activity-skill-gaps",
      occurredAt: "อัปเดตจาก Backend",
      title: "หัวข้อที่ควรช่วยเพิ่ม",
      type: "student"
    }
  ];
};

const getDepartmentStatValue = (dashboard: TeacherDashboardResponse, label: string) => {
  return dashboard.department_stats.find((stat) => stat.label === label)?.value ?? 0;
};

const buildSkillGapSummary = (dashboard: TeacherDashboardResponse) => {
  if (dashboard.skill_gaps.length === 0) {
    return "ยังไม่มีหัวข้อที่ต้องช่วยเป็นพิเศษ";
  }

  return dashboard.skill_gaps
    .slice(0, 2)
    .map((gap) => gap.topic)
    .join(", ");
};

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
