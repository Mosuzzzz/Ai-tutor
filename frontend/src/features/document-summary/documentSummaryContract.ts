import { z } from "zod";

export const DOCUMENTS_DASHBOARD_API_PATH = "/api/files/dashboard";
export const DOCUMENT_UPLOAD_API_PATH = "/api/files/upload";
export const documentDeleteApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}`;
export const documentDetailApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}/detail`;
export const fileStatusApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}/status`;
export const recapApiPath = (fileId: string) => `/api/recap/${encodeURIComponent(fileId)}`;

export const documentProcessingStatusSchema = z.enum(["pending", "processing", "ready", "error"]);

const statusCountsSchema = z.object({
  error: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  ready: z.number().int().nonnegative()
});

const documentLibraryItemSchema = z.object({
  created_at: z.string(),
  filename: z.string(),
  id: z.string(),
  related_exams_count: z.number().int().nonnegative(),
  status: documentProcessingStatusSchema,
  summary_available: z.boolean(),
  summary_markdown: z.string().nullable()
});

export const documentLibraryResponseSchema = z.object({
  documents: z.array(documentLibraryItemSchema),
  status_counts: statusCountsSchema,
  total_documents: z.number().int().nonnegative()
});

const relatedExamSchema = z.object({
  created_at: z.string(),
  id: z.string(),
  score: z.number().nullable().optional(),
  taken_at: z.string().nullable().optional()
});

export const documentDetailResponseSchema = z.object({
  created_at: z.string(),
  extracted_text_preview: z.string(),
  filename: z.string(),
  id: z.string(),
  related_exams: z.array(relatedExamSchema),
  status: documentProcessingStatusSchema,
  storage_url: z.string(),
  summary_available: z.boolean(),
  summary_markdown: z.string().nullable(),
  user_id: z.string()
});

export const fileStatusResponseSchema = z.object({
  created_at: z.string(),
  file_id: z.string(),
  filename: z.string(),
  status: documentProcessingStatusSchema
});

export const fileUploadResponseSchema = z.object({
  created_at: z.string(),
  filename: z.string(),
  id: z.string(),
  status: documentProcessingStatusSchema,
  storage_url: z.string(),
  user_id: z.string()
});

export const recapResponseSchema = z.object({
  cached: z.boolean(),
  file_id: z.string(),
  filename: z.string(),
  generated_at: z.string(),
  summary_markdown: z.string()
});

export type DocumentLibraryResponse = z.infer<typeof documentLibraryResponseSchema>;
export type DocumentDetailResponse = z.infer<typeof documentDetailResponseSchema>;
export type FileStatusResponse = z.infer<typeof fileStatusResponseSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
export type RecapResponse = z.infer<typeof recapResponseSchema>;
