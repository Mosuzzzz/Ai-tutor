import type {
  DocumentDetailResponse,
  DocumentLibraryResponse,
  FileStatusResponse,
  RecapResponse
} from "./documentSummaryContract";

export const backendDocumentDashboardResponse: DocumentLibraryResponse = {
  documents: [
    {
      created_at: "2026-06-05T08:00:00.000Z",
      filename: "safety-handbook.pdf",
      id: "file-ready",
      related_exams_count: 2,
      status: "ready",
      summary_available: true,
      summary_markdown:
        "## Overview\nReview safety checklist before entering the lab.\n\n## Key Actions\n- Wear goggles\n- Report incidents"
    },
    {
      created_at: "2026-06-04T08:00:00.000Z",
      filename: "ethics-guide.pdf",
      id: "file-needs-recap",
      related_exams_count: 1,
      status: "ready",
      summary_available: false,
      summary_markdown: null
    },
    {
      created_at: "2026-06-03T08:00:00.000Z",
      filename: "processing.pdf",
      id: "file-processing",
      related_exams_count: 0,
      status: "processing",
      summary_available: false,
      summary_markdown: null
    }
  ],
  status_counts: {
    error: 0,
    pending: 0,
    processing: 1,
    ready: 2
  },
  total_documents: 3
};

export const backendDocumentDetailResponse: DocumentDetailResponse = {
  created_at: "2026-06-05T08:00:00.000Z",
  extracted_text_preview: "Safety checklist preview",
  filename: "safety-handbook.pdf",
  id: "file-ready",
  related_exams: [
    {
      created_at: "2026-06-05T09:00:00.000Z",
      id: "exam-1",
      score: 86,
      status: "published",
      taken_at: null
    }
  ],
  status: "ready",
  storage_url: "/secure/uploads/safety-handbook.pdf",
  summary_available: true,
  summary_markdown:
    "## Overview\nReview safety checklist before entering the lab.\n\n## Key Actions\n- Wear goggles\n- Report incidents",
  user_id: "user-1"
};

export const backendDocumentStatusResponse: FileStatusResponse = {
  created_at: "2026-06-05T08:00:00.000Z",
  file_id: "file-ready",
  filename: "safety-handbook.pdf",
  status: "ready"
};

export const backendRecapResponse: RecapResponse = {
  cached: true,
  file_id: "file-needs-recap",
  filename: "ethics-guide.pdf",
  generated_at: "2026-06-05T09:00:00.000Z",
  summary_markdown:
    "## Overview\nAI ethics guidance for classroom use.\n\n## Key Actions\n- Cite sources\n- Protect student privacy"
};
