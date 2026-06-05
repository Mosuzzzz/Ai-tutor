import { z } from "zod";

export const TEACHER_DASHBOARD_API_PATH = "/api/analytics/trainer";
export const TEACHER_STUDENTS_API_PATH = "/api/analytics/trainer/students";

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

const scoreTrendPointSchema = z.object({
  average_score: z.number(),
  date: z.string()
});

export const teacherDashboardResponseSchema = z.object({
  average_tenant_score: z.number(),
  department_stats: z.array(departmentStatSchema),
  score_trend: z.array(scoreTrendPointSchema),
  skill_gaps: z.array(skillGapSchema),
  total_employees: z.number(),
  total_quizzes_taken: z.number()
});

const teacherStudentSchema = z.object({
  average_score: z.number(),
  completed_quizzes: z.number(),
  email: z.email(),
  full_name: z.string().nullable().optional(),
  last_active_at: z.string().nullable().optional(),
  user_id: z.string()
});

export const teacherStudentsResponseSchema = z.array(teacherStudentSchema);

export type TeacherDashboardResponse = z.infer<typeof teacherDashboardResponseSchema>;
export type TeacherStudentsResponse = z.infer<typeof teacherStudentsResponseSchema>;
