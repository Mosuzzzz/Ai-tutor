import { z } from "zod";

export const DOCUMENTS_DASHBOARD_API_PATH = "/api/files/dashboard";
export const DOCUMENT_UPLOAD_API_PATH = "/api/files/upload";
export const documentDeleteApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}`;
export const documentDetailApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}/detail`;
export const fileStatusApiPath = (fileId: string) => `/api/files/${encodeURIComponent(fileId)}/status`;
export const recapApiPath = (fileId: string) => `/api/recap/${encodeURIComponent(fileId)}`;


const safeStringSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}, z.string());

const safeNullableStringSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}, z.string().nullable());

const safeCountSchema = z.coerce.number().int().nonnegative().catch(0);

const safeBooleanSchema = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (["true", "1", "yes", "y"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "0", "no", "n", ""].includes(normalizedValue)) {
      return false;
    }
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}, z.boolean()).catch(false);

export const documentProcessingStatusSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["completed", "complete", "done", "processed", "success", "summarized"].includes(normalizedValue)) {
    return "ready";
  }

  if (["queued", "waiting"].includes(normalizedValue)) {
    return "pending";
  }

  if (["in_progress", "running", "uploaded"].includes(normalizedValue)) {
    return "processing";
  }

  if (["failed", "failure"].includes(normalizedValue)) {
    return "error";
  }

  return normalizedValue;
}, z.enum(["pending", "processing", "ready", "error"]));

const statusCountsSchema = z.object({
  error: safeCountSchema.optional().default(0),
  pending: safeCountSchema.optional().default(0),
  processing: safeCountSchema.optional().default(0),
  ready: safeCountSchema.optional().default(0)
});

const documentLibraryItemSchema = z.object({
  created_at: safeStringSchema.optional().default(""),
  filename: safeStringSchema.optional().default(""),
  id: safeStringSchema,
  related_exams_count: safeCountSchema.optional().default(0),
  status: documentProcessingStatusSchema.optional().default("processing"),
  summary_available: safeBooleanSchema.optional().default(false),
  summary_markdown: safeNullableStringSchema,
  uploaded_by: safeStringSchema.optional().default("")
}).passthrough();

const normalizeDocumentLibraryPayload = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const payload = value as Record<string, unknown>;
  const documents = payload.documents ?? payload.files ?? payload.items ?? payload.data;

  return {
    ...payload,
    documents
  };
};

export const documentLibraryResponseSchema = z.preprocess(normalizeDocumentLibraryPayload, z.object({
  documents: z.array(documentLibraryItemSchema),
  status_counts: statusCountsSchema,
  total_documents: safeCountSchema.optional()
}).passthrough()).transform((response) => ({
  ...response,
  total_documents: response.total_documents ?? response.documents.length
}));

const relatedExamSchema = z.object({
  created_at: safeStringSchema,
  id: safeStringSchema,
  score: z.number().nullable().optional(),
  status: safeStringSchema.optional().default("completed"),
  taken_at: safeNullableStringSchema.optional()
}).passthrough();

export const documentDetailResponseSchema = z.object({
  created_at: safeStringSchema.optional().default(""),
  extracted_text_preview: safeStringSchema.optional().default(""),
  filename: safeStringSchema.optional().default(""),
  id: safeStringSchema,
  related_exams: z.array(relatedExamSchema).catch([]),
  status: documentProcessingStatusSchema.optional().default("processing"),
  storage_url: safeStringSchema.optional().default(""),
  summary_available: safeBooleanSchema.optional().default(false),
  summary_markdown: safeNullableStringSchema,
  tenant_id: safeStringSchema.optional().default(""),
  uploaded_by: safeStringSchema.optional().default("")
}).passthrough();

export const fileStatusResponseSchema = z.object({
  created_at: safeStringSchema.optional().default(""),
  file_id: safeStringSchema,
  filename: safeStringSchema.optional().default(""),
  status: documentProcessingStatusSchema
}).passthrough();

export const fileUploadResponseSchema = z.object({
  created_at: safeStringSchema.optional().default(""),
  filename: safeStringSchema.optional().default(""),
  id: safeStringSchema,
  status: documentProcessingStatusSchema.optional().default("processing"),
  storage_url: safeStringSchema.optional().default(""),
  tenant_id: safeStringSchema.optional().default(""),
  uploaded_by: safeStringSchema.optional().default("")
}).passthrough();

export const recapResponseSchema = z.object({
  cached: safeBooleanSchema.optional().default(false),
  file_id: safeStringSchema,
  filename: safeStringSchema.optional().default(""),
  generated_at: safeStringSchema.optional().default(""),
  summary_markdown: safeStringSchema.optional().default("")
}).passthrough();

export type DocumentLibraryResponse = z.infer<typeof documentLibraryResponseSchema>;
export type DocumentDetailResponse = z.infer<typeof documentDetailResponseSchema>;
export type FileStatusResponse = z.infer<typeof fileStatusResponseSchema>;
export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;
export type RecapResponse = z.infer<typeof recapResponseSchema>;
