import type { AuthSession } from "../auth/types";
import { studentDashboardMock } from "./mockData";
import type { StudentDashboardResponse } from "./studentDashboardContract";
import type { StudentDashboardViewModel } from "./types";

type StudentDashboardViewModelInput = {
  response: StudentDashboardResponse;
  session: AuthSession;
  timestamp?: Date;
};

export const toStudentDashboardViewModel = ({
  response,
  session,
  timestamp = new Date()
}: StudentDashboardViewModelInput): StudentDashboardViewModel => {
  const learnerName = session.user.displayName?.trim() || session.user.email;

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
    assistantPrompts: studentDashboardMock.assistantPrompts,
    continueLearning: studentDashboardMock.continueLearning,
    generatedAtLabel: formatGeneratedAt(timestamp),
    learnerName,
    nextMilestone: buildNextMilestone(response),
    roleLabel: "ผู้เรียน"
  };
};

export const isStudentDashboardResponseEmpty = (response: StudentDashboardResponse) => {
  return (
    response.average_score === 0 &&
    response.completed_quizzes === 0 &&
    response.read_documents_count === 0 &&
    response.recent_scores.length === 0 &&
    response.score_trend.length === 0 &&
    response.streak_days === 0
  );
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

const buildNextMilestone = (response: StudentDashboardResponse) => {
  if (isStudentDashboardResponseEmpty(response)) {
    return "เริ่มเรียนจากเอกสารแรกของคุณ";
  }

  return "ทบทวนคะแนนล่าสุดและเรียนต่อจากเนื้อหาที่ AI แนะนำ";
};
