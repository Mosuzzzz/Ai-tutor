export type LearningTrendPoint = {
  date: string;
  average_score: number;
};

export type LearningSkillGap = {
  topic: string;
  error_rate: number;
  incorrect_count: number;
  total_attempts: number;
  description: string;
};

export type LearningDepartmentStat = {
  label: string;
  value: number;
};

export type LearningAnalyticsApiResponse = {
  total_employees: number;
  average_tenant_score: number;
  total_quizzes_taken: number;
  skill_gaps: LearningSkillGap[];
  department_stats: LearningDepartmentStat[];
  score_trend: LearningTrendPoint[];
};

export type LearningActivityType = "chat" | "document" | "quiz";

export type LearningActivity = {
  id: string;
  type: LearningActivityType;
  title: string;
  description: string;
  actorLabel: string;
  occurredAtLabel: string;
  scorePercent?: number;
};

export type LearningRecentScore = {
  examHref: string;
  examId: string;
  filename: string;
  id: string;
  scorePercent: number;
  submittedAtLabel: string;
};

export type LearningAnalyticsMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: "amber" | "blue" | "green" | "rose";
};

export type LearningAnalyticsViewModel = {
  workspaceName: string;
  generatedAtLabel: string;
  trainerAnalyticsEndpoint: "/api/analytics/trainer";
  learnerAnalyticsEndpoint: "/api/analytics/dashboard";
  apiResponse: LearningAnalyticsApiResponse;
  activities: LearningActivity[];
  recentScores: LearningRecentScore[];
};

export type LearningAnalyticsDataSource = "api" | "api-ready-mock";

export type LearningAnalyticsStatus = "ready" | "loading" | "empty" | "error";
