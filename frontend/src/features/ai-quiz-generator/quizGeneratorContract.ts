import { z } from "zod";

export const EXAM_GENERATE_API_PATH = "/api/exams/generate";

export const examDetailApiPath = (examId: string) => `/api/exams/${encodeURIComponent(examId)}`;
export const examUpdateApiPath = (examId: string) => examDetailApiPath(examId);
export const examPublishApiPath = (examId: string) => `${examDetailApiPath(examId)}/publish`;
export const examSubmitApiPath = (examId: string) => `${examDetailApiPath(examId)}/submit`;

export const quizDifficultySchema = z.enum(["easy", "medium", "hard"]);
export const examStatusSchema = z.enum(["draft", "published"]);

export const quizGenerationInputSchema = z.object({
  difficulty: quizDifficultySchema,
  fileId: z.string().trim().min(1),
  instructions: z.string().trim().max(2_000).optional(),
  numQuestions: z.number().int().min(5).max(20)
});

export const examGenerateRequestSchema = z.object({
  difficulty: quizDifficultySchema,
  file_id: z.string().trim().min(1),
  instructions: z.string().trim().max(2_000).optional(),
  num_questions: z.number().int().min(5).max(20)
});

const baseExamQuestionSchema = z.object({
  id: z.string(),
  options: z.array(z.string()).min(2),
  question_text: z.string()
});

export const trainerExamQuestionSchema = baseExamQuestionSchema.extend({
  citation: z.string(),
  correct_index: z.number().int().nonnegative(),
  explanation: z.string()
});

export const learnerExamQuestionSchema = baseExamQuestionSchema.strict();

const baseExamResponseSchema = z.object({
  file_id: z.string(),
  id: z.string(),
  score: z.number().nullable().optional(),
  status: examStatusSchema,
  taken_at: z.string().nullable().optional(),
  tenant_id: z.string(),
  user_answers: z.record(z.string(), z.number().int().nonnegative()).nullable().optional()
});

export const trainerExamResponseSchema = baseExamResponseSchema.extend({
  questions: z.array(trainerExamQuestionSchema)
});

export const learnerExamResponseSchema = baseExamResponseSchema.extend({
  questions: z.array(learnerExamQuestionSchema)
});

export const examResponseSchema = z.union([trainerExamResponseSchema, learnerExamResponseSchema]);

export const examUpdateInputSchema = z.object({
  questions: z.array(trainerExamQuestionSchema)
});

export const examUpdateResponseSchema = z.object({
  id: z.string(),
  questions: z.array(trainerExamQuestionSchema),
  status: examStatusSchema
});

export const examPublishResponseSchema = z.object({
  id: z.string(),
  status: z.literal("published")
});

export const examSubmitInputSchema = z.object({
  answers: z.record(z.string(), z.number().int().nonnegative())
});

export const examSubmitResultSchema = z.object({
  chosen: z.number().int().nonnegative().nullable().optional(),
  citation: z.string().nullable().optional(),
  correct_index: z.number().int().nonnegative().nullable().optional(),
  explanation: z.string().nullable().optional(),
  question_id: z.string()
});

export const examSubmitResponseSchema = z.object({
  correct_answers_count: z.number().int().nonnegative(),
  detailed_results: z.array(examSubmitResultSchema),
  exam_id: z.string(),
  passed: z.boolean(),
  score: z.number().int().min(0).max(100),
  total_questions: z.number().int().nonnegative()
});

export type QuizGenerationInput = z.infer<typeof quizGenerationInputSchema>;
export type ExamGenerateRequest = z.infer<typeof examGenerateRequestSchema>;
export type TrainerExamQuestion = z.infer<typeof trainerExamQuestionSchema>;
export type LearnerExamQuestion = z.infer<typeof learnerExamQuestionSchema>;
export type TrainerExamResponse = z.infer<typeof trainerExamResponseSchema>;
export type LearnerExamResponse = z.infer<typeof learnerExamResponseSchema>;
export type ExamResponse = z.infer<typeof examResponseSchema>;
export type ExamUpdateInput = z.infer<typeof examUpdateInputSchema>;
export type ExamUpdateResponse = z.infer<typeof examUpdateResponseSchema>;
export type ExamSubmitInput = z.infer<typeof examSubmitInputSchema>;
export type ExamSubmitResponse = z.infer<typeof examSubmitResponseSchema>;
