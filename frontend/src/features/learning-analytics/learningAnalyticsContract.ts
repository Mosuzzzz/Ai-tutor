import { z } from "zod";

export const LEARNER_ANALYTICS_API_PATH = "/api/analytics/dashboard";
export const TRAINER_ANALYTICS_API_PATH = "/api/analytics/trainer";
export const TRAINER_STUDENTS_API_PATH = "/api/analytics/trainer/students";
export const ADMIN_USAGE_API_PATH = "/api/analytics/usage";
export const ADMIN_AUDIT_LOGS_API_PATH = "/api/analytics/audit-logs";

export const adminUsageApiPath = (days = 30) => {
  const normalizedDays = Math.max(1, Math.trunc(days));
  const params = new URLSearchParams({
    days: String(normalizedDays)
  });

  return `${ADMIN_USAGE_API_PATH}?${params.toString()}`;
};

const scoreTrendPointSchema = z.object({
  average_score: z.number(),
  date: z.string()
});

const recentScoreSchema = z.object({
  exam_id: z.string(),
  filename: z.string(),
  id: z.string(),
  score: z.number(),
  submitted_at: z.string()
});

const learnerActivitySchema = z.object({
  action: z.string(),
  created_at: z.string(),
  details_summary: z.string().nullable().optional()
});

const skillScoreSchema = z.object({
  attempts: z.number(),
  average_score: z.number(),
  file_id: z.string(),
  filename: z.string()
});

const skillGapSchema = z.object({
  description: z.string(),
  error_rate: z.number(),
  incorrect_count: z.number(),
  topic: z.string(),
  total_attempts: z.number()
});

const departmentStatSchema = z.object({
  label: z.string(),
  value: z.number()
});

const trainerStudentSchema = z.object({
  average_score: z.number(),
  completed_quizzes: z.number(),
  email: z.email(),
  full_name: z.string().nullable().optional(),
  last_active_at: z.string().nullable().optional(),
  user_id: z.string()
});

const auditLogSchema = z.object({
  action: z.string(),
  created_at: z.string(),
  details: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
  id: z.string(),
  ip_address: z.string().nullable().optional(),
  user_id: z.string().nullable().optional()
});

export const learnerAnalyticsResponseSchema = z.object({
  average_score: z.number(),
  completed_quizzes: z.number(),
  read_documents_count: z.number(),
  recent_activity: z.array(learnerActivitySchema),
  recent_scores: z.array(recentScoreSchema),
  score_trend: z.array(scoreTrendPointSchema),
  skill_breakdown: z.array(skillScoreSchema),
  streak_days: z.number()
});

export const trainerAnalyticsResponseSchema = z.object({
  average_tenant_score: z.number(),
  department_stats: z.array(departmentStatSchema),
  score_trend: z.array(scoreTrendPointSchema),
  skill_gaps: z.array(skillGapSchema),
  total_employees: z.number(),
  total_quizzes_taken: z.number()
});

export const trainerStudentsResponseSchema = z.array(trainerStudentSchema);

export const adminUsageResponseSchema = z.object({
  days: z.number(),
  total_logins: z.number(),
  total_uploads: z.number()
});

export const adminAuditLogsResponseSchema = z.array(auditLogSchema);

export type LearnerAnalyticsResponse = z.infer<typeof learnerAnalyticsResponseSchema>;
export type TrainerAnalyticsResponse = z.infer<typeof trainerAnalyticsResponseSchema>;
export type TrainerStudentsResponse = z.infer<typeof trainerStudentsResponseSchema>;
export type AdminUsageResponse = z.infer<typeof adminUsageResponseSchema>;
export type AdminAuditLogsResponse = z.infer<typeof adminAuditLogsResponseSchema>;
