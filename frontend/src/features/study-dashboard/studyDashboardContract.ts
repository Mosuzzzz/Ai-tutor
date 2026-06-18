import { z } from "zod";

export const STUDY_DASHBOARD_API_PATH = "/api/analytics/dashboard";

const recentScoreSchema = z.object({
  exam_id: z.string(),
  filename: z.string(),
  id: z.string(),
  score: z.number(),
  submitted_at: z.string()
});

const scoreTrendPointSchema = z.object({
  average_score: z.number(),
  date: z.string()
});

export const studyDashboardResponseSchema = z.object({
  average_score: z.number(),
  completed_quizzes: z.number(),
  read_documents_count: z.number(),
  recent_scores: z.array(recentScoreSchema),
  score_trend: z.array(scoreTrendPointSchema),
  streak_days: z.number()
});

export type StudyDashboardResponse = z.infer<typeof studyDashboardResponseSchema>;
