import type { AuthSession } from "../auth/types";
import type {
  AdminAuditLogsResponse,
  AdminUsageResponse,
  LearnerAnalyticsResponse,
  TrainerAnalyticsResponse,
  TrainerStudentsResponse
} from "./learningAnalyticsContract";
import type {
  LearningActivity,
  LearningActivityType,
  LearningAnalyticsApiResponse,
  LearningAnalyticsViewModel,
  LearningSkillGap
} from "./types";

type LearningAnalyticsViewModelInput = {
  auditLogs?: AdminAuditLogsResponse;
  learner?: LearnerAnalyticsResponse;
  session: AuthSession;
  students?: TrainerStudentsResponse;
  timestamp?: Date;
  trainer?: TrainerAnalyticsResponse;
  usage?: AdminUsageResponse;
};

type LearningAnalyticsResponseGroup = Pick<
  LearningAnalyticsViewModelInput,
  "auditLogs" | "learner" | "students" | "trainer" | "usage"
>;

export const toLearningAnalyticsViewModel = ({
  auditLogs,
  learner,
  session,
  students = [],
  timestamp = new Date(),
  trainer,
  usage
}: LearningAnalyticsViewModelInput): LearningAnalyticsViewModel => {
  const actorName = getSessionDisplayName(session);

  if (usage) {
    return {
      activities: buildAuditActivities(auditLogs ?? []),
      apiResponse: buildAdminApiResponse(usage, auditLogs ?? []),
      generatedAtLabel: formatGeneratedAt(timestamp),
      learnerAnalyticsEndpoint: "/api/analytics/dashboard",
      trainerAnalyticsEndpoint: "/api/analytics/trainer",
      workspaceName: actorName
    };
  }

  if (trainer) {
    return {
      activities: [
        ...buildAuditActivities(auditLogs ?? []),
        ...students.map(toTrainerStudentActivity)
      ],
      apiResponse: {
        average_tenant_score: trainer.average_tenant_score,
        department_stats: trainer.department_stats,
        score_trend: trainer.score_trend,
        skill_gaps: trainer.skill_gaps,
        total_employees: trainer.total_employees,
        total_quizzes_taken: trainer.total_quizzes_taken
      },
      generatedAtLabel: formatGeneratedAt(timestamp),
      learnerAnalyticsEndpoint: "/api/analytics/dashboard",
      trainerAnalyticsEndpoint: "/api/analytics/trainer",
      workspaceName: actorName
    };
  }

  const learnerResponse = learner ?? createEmptyLearnerAnalyticsResponse();

  return {
    activities: learnerResponse.recent_activity.map((activity, index) =>
      toLearnerActivity(activity, index, actorName)
    ),
    apiResponse: toLearnerApiResponse(learnerResponse),
    generatedAtLabel: formatGeneratedAt(timestamp),
    learnerAnalyticsEndpoint: "/api/analytics/dashboard",
    trainerAnalyticsEndpoint: "/api/analytics/trainer",
    workspaceName: actorName
  };
};

export const isLearningAnalyticsResponseEmpty = ({
  auditLogs,
  learner,
  students,
  trainer,
  usage
}: LearningAnalyticsResponseGroup) => {
  if (usage) {
    return usage.total_logins === 0 && usage.total_uploads === 0 && (auditLogs?.length ?? 0) === 0;
  }

  if (trainer) {
    return (
      trainer.average_tenant_score === 0 &&
      trainer.department_stats.length === 0 &&
      trainer.score_trend.length === 0 &&
      trainer.skill_gaps.length === 0 &&
      trainer.total_employees === 0 &&
      trainer.total_quizzes_taken === 0 &&
      (students?.length ?? 0) === 0 &&
      (auditLogs?.length ?? 0) === 0
    );
  }

  if (learner) {
    return (
      learner.average_score === 0 &&
      learner.completed_quizzes === 0 &&
      learner.read_documents_count === 0 &&
      learner.recent_activity.length === 0 &&
      learner.recent_scores.length === 0 &&
      learner.score_trend.length === 0 &&
      learner.skill_breakdown.length === 0 &&
      learner.streak_days === 0
    );
  }

  return true;
};

const toLearnerApiResponse = (learner: LearnerAnalyticsResponse): LearningAnalyticsApiResponse => {
  return {
    average_tenant_score: learner.average_score,
    department_stats: [
      {
        label: "completed_quizzes",
        value: learner.completed_quizzes
      },
      {
        label: "read_documents_count",
        value: learner.read_documents_count
      },
      {
        label: "streak_days",
        value: learner.streak_days
      }
    ],
    score_trend: learner.score_trend,
    skill_gaps: learner.skill_breakdown.map(toLearnerSkillGap),
    total_employees: 1,
    total_quizzes_taken: learner.completed_quizzes
  };
};

const toLearnerSkillGap = (skill: LearnerAnalyticsResponse["skill_breakdown"][number]): LearningSkillGap => {
  const errorRate = normalizePercent(100 - skill.average_score);
  const incorrectCount =
    skill.attempts > 0 && errorRate > 0 ? Math.max(1, Math.round((skill.attempts * errorRate) / 100)) : 0;

  return {
    description: `Average quiz score ${normalizePercent(skill.average_score)}% across ${skill.attempts} attempts.`,
    error_rate: errorRate,
    incorrect_count: incorrectCount,
    topic: skill.filename,
    total_attempts: skill.attempts
  };
};

const toLearnerActivity = (
  activity: LearnerAnalyticsResponse["recent_activity"][number],
  index: number,
  actorName: string
): LearningActivity => {
  return {
    actorLabel: actorName,
    description: activity.details_summary?.trim() || "Learning activity from Backend",
    id: `learner-activity-${index}`,
    occurredAtLabel: formatEventDate(activity.created_at),
    title: formatActionLabel(activity.action),
    type: inferActivityType(activity.action)
  };
};

const toTrainerStudentActivity = (
  student: TrainerStudentsResponse[number],
  index: number
): LearningActivity => {
  const learnerName = student.full_name?.trim() || student.email;

  return {
    actorLabel: learnerName,
    description: `${student.completed_quizzes} completed quizzes`,
    id: `trainer-student-${index}`,
    occurredAtLabel: student.last_active_at ? formatEventDate(student.last_active_at) : "No activity yet",
    scorePercent: student.average_score,
    title: "Learner progress update",
    type: "quiz"
  };
};

const buildAuditActivities = (auditLogs: AdminAuditLogsResponse): LearningActivity[] => {
  return auditLogs.map((log, index) => ({
    actorLabel: log.email?.trim() || "System",
    description: log.details?.trim() || "Administrative event recorded",
    id: `audit-${index}`,
    occurredAtLabel: formatEventDate(log.created_at),
    title: formatActionLabel(log.action),
    type: inferActivityType(log.action)
  }));
};

const buildAdminApiResponse = (
  usage: AdminUsageResponse,
  auditLogs: AdminAuditLogsResponse
): LearningAnalyticsApiResponse => {
  return {
    average_tenant_score: 0,
    department_stats: [
      {
        label: "usage_days",
        value: usage.days
      },
      {
        label: "audit_events",
        value: auditLogs.length
      }
    ],
    score_trend: [],
    skill_gaps: [],
    total_employees: usage.total_logins,
    total_quizzes_taken: usage.total_uploads
  };
};

const createEmptyLearnerAnalyticsResponse = (): LearnerAnalyticsResponse => ({
  average_score: 0,
  completed_quizzes: 0,
  read_documents_count: 0,
  recent_activity: [],
  recent_scores: [],
  score_trend: [],
  skill_breakdown: [],
  streak_days: 0
});

const getSessionDisplayName = (session: AuthSession) => {
  return session.user.displayName?.trim() || session.user.email;
};

const normalizePercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
};

const inferActivityType = (action: string): LearningActivityType => {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("chat") || normalizedAction.includes("message")) {
    return "chat";
  }

  if (
    normalizedAction.includes("document") ||
    normalizedAction.includes("file") ||
    normalizedAction.includes("upload") ||
    normalizedAction.includes("recap")
  ) {
    return "document";
  }

  return "quiz";
};

const formatActionLabel = (action: string) => {
  return action
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};

const formatEventDate = (dateValue: string) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(date);
};
