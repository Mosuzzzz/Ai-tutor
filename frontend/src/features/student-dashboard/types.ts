export type LearnerDashboardApiResponse = {
  completed_quizzes: number;
  average_score: number;
  streak_days: number;
  read_documents_count: number;
  recent_scores: RecentScore[];
  score_trend: ScoreTrendPoint[];
};

export type RecentScore = {
  id: string;
  exam_id: string;
  filename: string;
  score: number;
  submitted_at: string;
};

export type ScoreTrendPoint = {
  id: string;
  date: string;
  average_score: number;
};

export type ContinueLearningItem = {
  id: string;
  title: string;
  source: string;
  progressPercent: number;
  minutesRemaining: number;
  href: string;
  type: "lesson" | "document" | "quiz";
};

export type AssistantPrompt = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type StudentDashboardViewModel = {
  learnerName: string;
  roleLabel: string;
  generatedAtLabel: string;
  nextMilestone: string;
  apiResponse: LearnerDashboardApiResponse;
  continueLearning: ContinueLearningItem[];
  assistantPrompts: AssistantPrompt[];
};

export type StudentDashboardStatus = "ready" | "loading" | "error";
