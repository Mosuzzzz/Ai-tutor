import { z } from "zod";

export const CHAT_QUERY_API_PATH = "/api/chat/query";
export const CHAT_HISTORY_API_PATH = "/api/chat/history";

type ChatHistoryApiPathOptions = {
  fileId?: string;
  limit?: number;
  skip?: number;
};

export const chatHistoryApiPath = ({ fileId, limit, skip }: ChatHistoryApiPathOptions = {}) => {
  const params = new URLSearchParams();

  if (fileId) {
    params.set("file_id", fileId);
  }

  if (skip !== undefined) {
    params.set("skip", String(skip));
  }

  if (limit !== undefined) {
    params.set("limit", String(limit));
  }

  const query = params.toString();
  return query ? `${CHAT_HISTORY_API_PATH}?${query}` : CHAT_HISTORY_API_PATH;
};

export const chatQueryInputSchema = z.object({
  fileId: z.string().trim().min(1).optional(),
  prompt: z.string().trim().min(1).max(4_000)
});

const fullCitationSchema = z.object({
  chunk_index: z.number().int().nonnegative(),
  file_id: z.string(),
  filename: z.string(),
  matched_text: z.string()
});

const historyCitationSchema = z
  .union([
    fullCitationSchema,
    z.object({
      chunk: z.number().int().nonnegative(),
      filename: z.string()
    })
  ])
  .transform((citation) => {
    if ("file_id" in citation) {
      return citation;
    }

    return {
      chunk_index: citation.chunk,
      file_id: "",
      filename: citation.filename,
      matched_text: "Citation text is not available in this history entry."
    };
  });

export const chatQueryResponseSchema = z.object({
  chat_history_id: z.string(),
  citations: z.array(fullCitationSchema),
  response_text: z.string()
});

const nullableStringSchema = z.string().nullable().optional();

export const chatHistoryItemSchema = z
  .object({
    citations: z.array(historyCitationSchema),
    file_id: nullableStringSchema,
    id: z.string(),
    query: nullableStringSchema,
    response: nullableStringSchema,
    timestamp: z.string()
  })
  .transform((item) => ({
    ...item,
    citations: item.citations.map((citation) => ({
      ...citation,
      file_id: citation.file_id || item.file_id || "unknown-file"
    })),
    file_id: item.file_id ?? undefined,
    query: item.query || "Unknown query",
    response: item.response || "No response was recorded."
  }));

export const chatHistoryResponseSchema = z.array(chatHistoryItemSchema);

export type ChatQueryInput = z.infer<typeof chatQueryInputSchema>;
export type ChatQueryResponse = z.infer<typeof chatQueryResponseSchema>;
export type ChatHistoryItem = z.infer<typeof chatHistoryItemSchema>;
export type ChatHistoryResponse = z.infer<typeof chatHistoryResponseSchema>;
