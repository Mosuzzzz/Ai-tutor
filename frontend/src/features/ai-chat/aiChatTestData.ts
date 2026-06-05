import type { ChatQueryResponse } from "./aiChatContract";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";

export const backendChatDocumentsResponse: DocumentLibraryResponse = {
  documents: [
    {
      created_at: "2026-06-05T08:00:00.000Z",
      filename: "safety-handbook.pdf",
      id: "file-ready",
      related_exams_count: 2,
      status: "ready",
      summary_available: true,
      summary_markdown:
        "## Overview\nReview safety checklist before entering the lab.\n\n## Key Actions\n- Wear goggles\n- Report incidents",
      uploaded_by: "Trainer One"
    },
    {
      created_at: "2026-06-04T08:00:00.000Z",
      filename: "ethics-guide.pdf",
      id: "file-processing",
      related_exams_count: 0,
      status: "processing",
      summary_available: false,
      summary_markdown: null,
      uploaded_by: "Trainer Two"
    }
  ],
  status_counts: {
    error: 0,
    pending: 0,
    processing: 1,
    ready: 1
  },
  total_documents: 2
};

export const backendChatHistoryResponse = [
  {
    citations: [
      {
        chunk_index: 1,
        file_id: "file-ready",
        filename: "safety-handbook.pdf",
        matched_text: "Wear goggles before entering the lab."
      }
    ],
    file_id: "file-ready",
    id: "history-1",
    query: "What should I review first?",
    response: "Start with the safety checklist before entering the lab.",
    timestamp: "2026-06-05T09:10:00.000Z"
  },
  {
    citations: [
      {
        chunk: 2,
        filename: "safety-handbook.pdf"
      }
    ],
    file_id: "file-ready",
    id: "history-2",
    query: "How do I cite the source?",
    response: "Use the matched document section as evidence.",
    timestamp: "2026-06-05T09:20:00.000Z"
  }
];

export const backendChatQueryResponse: ChatQueryResponse = {
  chat_history_id: "history-3",
  citations: [
    {
      chunk_index: 3,
      file_id: "file-ready",
      filename: "safety-handbook.pdf",
      matched_text: "Report incidents immediately."
    }
  ],
  response_text: "Report incidents immediately and notify the trainer."
};
