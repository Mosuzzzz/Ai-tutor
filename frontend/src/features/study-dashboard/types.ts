export type StudyDashboardApiResponse = {
  average_score: number;
  completed_quizzes: number;
  read_documents_count: number;
  recent_scores: RecentScore[];
  score_trend: ScoreTrendPoint[];
  streak_days: number;
};

export type RecentScore = {
  exam_id: string;
  filename: string;
  id: string;
  score: number;
  submitted_at: string;
};

export type ScoreTrendPoint = {
  average_score: number;
  date: string;
  id: string;
};

export type StudyDashboardAction = {
  description: string;
  href: string;
  id: string;
  title: string;
  tone: "primary" | "secondary";
};

export type StudyDashboardMetric = {
  helper: string;
  id: string;
  label: string;
  value: string;
};

export type StudyDashboardStep = {
  description: string;
  id: string;
  title: string;
};

export type StudyDashboardViewModel = {
  apiResponse: StudyDashboardApiResponse;
  generatedAtLabel: string;
  headline: string;
  metrics: StudyDashboardMetric[];
  nextMilestone: string;
  onboardingSteps: StudyDashboardStep[];
  primaryAction: StudyDashboardAction;
  secondaryActions: StudyDashboardAction[];
  summary: string;
  userName: string;
};

export type StudyDashboardDataSource = "api" | "api-ready-mock";

export type StudyDashboardStatus = "empty" | "ready" | "loading" | "error";
