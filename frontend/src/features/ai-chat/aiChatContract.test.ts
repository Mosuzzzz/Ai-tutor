import { describe, expect, it } from "vitest";

import {
  CHAT_HISTORY_API_PATH,
  CHAT_QUERY_API_PATH,
  chatHistoryApiPath,
  chatHistoryResponseSchema,
  chatQueryInputSchema,
  chatQueryResponseSchema
} from "./aiChatContract";
import {
  backendChatHistoryResponse,
  backendChatQueryResponse
} from "./aiChatTestData";

describe("AI chat Backend contract", () => {
  it("validates query and history responses while normalizing history citations", () => {
    expect(CHAT_QUERY_API_PATH).toBe("/api/chat/query");
    expect(CHAT_HISTORY_API_PATH).toBe("/api/chat/history");
    expect(chatQueryResponseSchema.parse(backendChatQueryResponse).citations[0]?.matched_text).toContain("Report");

    const history = chatHistoryResponseSchema.parse(backendChatHistoryResponse);

    expect(history[0]?.citations[0]?.file_id).toBe("file-ready");
    expect(history[1]?.citations[0]).toEqual({
      chunk_index: 2,
      file_id: "file-ready",
      filename: "safety-handbook.pdf",
      matched_text: "Citation text is not available in this history entry."
    });
  });

  it("rejects unsafe query payloads and malformed citations", () => {
    expect(chatQueryInputSchema.safeParse({ fileId: "file-ready", prompt: "  " }).success).toBe(false);
    expect(
      chatHistoryResponseSchema.safeParse([
        {
          citations: [
            {
              chunk_index: 0
            }
          ],
          file_id: "file-ready",
          id: "history-bad",
          query: "Broken?",
          response: "Broken",
          timestamp: "2026-06-05T09:10:00.000Z"
        }
      ]).success
    ).toBe(false);
  });

  it("builds history URLs with file filter and pagination", () => {
    expect(chatHistoryApiPath({ fileId: "file/ready", limit: 10, skip: 5 })).toBe(
      "/api/chat/history?file_id=file%2Fready&skip=5&limit=10"
    );
    expect(chatHistoryApiPath()).toBe("/api/chat/history");
  });
});
