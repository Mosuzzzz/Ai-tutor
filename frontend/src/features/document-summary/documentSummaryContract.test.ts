import { describe, expect, it } from "vitest";

import {
  DOCUMENT_UPLOAD_API_PATH,
  fileUploadResponseSchema,
  documentDetailResponseSchema,
  documentLibraryResponseSchema,
  fileStatusResponseSchema,
  recapResponseSchema
} from "./documentSummaryContract";
import {
  backendDocumentDashboardResponse,
  backendDocumentDetailResponse,
  backendDocumentStatusResponse,
  backendRecapResponse
} from "./documentSummaryTestData";

describe("document summary Backend contract", () => {
  it("validates dashboard, detail, status, and recap responses", () => {
    expect(documentLibraryResponseSchema.parse(backendDocumentDashboardResponse).total_documents).toBe(3);
    expect(documentDetailResponseSchema.parse(backendDocumentDetailResponse).summary_available).toBe(true);
    expect(fileStatusResponseSchema.parse(backendDocumentStatusResponse).status).toBe("ready");
    expect(recapResponseSchema.parse(backendRecapResponse).cached).toBe(true);
  });

  it("validates the upload response without requiring browser-only fields", () => {
    expect(DOCUMENT_UPLOAD_API_PATH).toBe("/api/files/upload");
    expect(
      fileUploadResponseSchema.parse({
        created_at: "2026-06-05T10:00:00.000Z",
        filename: "safety-handbook.pdf",
        id: "file-ready",
        status: "pending",
        storage_url: "/secure/uploads/safety-handbook.pdf",
        user_id: "user-1"
      }).status
    ).toBe("pending");
  });

  it("accepts current backend payloads when optional ownership fields are omitted", () => {
    const parsedDashboard = documentLibraryResponseSchema.parse({
      documents: [
        {
          created_at: "2026-06-18T09:51:37.000Z",
          filename: "lesson-screenshot.png",
          id: "file-from-backend",
          related_exams_count: 0,
          status: "ready",
          summary_available: true,
          summary_markdown: "## ภาพรวม\nสรุปจาก backend"
        }
      ],
      status_counts: {
        error: 0,
        pending: 0,
        processing: 0,
        ready: 1
      },
      total_documents: 1
    });

    const parsedDetail = documentDetailResponseSchema.parse({
      created_at: "2026-06-18T09:51:37.000Z",
      extracted_text_preview: "ตัวอย่างเนื้อหาจาก backend",
      filename: "lesson-screenshot.png",
      id: "file-from-backend",
      related_exams: [
        {
          created_at: "2026-06-18T10:00:00.000Z",
          id: "exam-from-backend",
          score: null,
          taken_at: null
        }
      ],
      status: "ready",
      summary_available: true,
      summary_markdown: "## ภาพรวม\nสรุปจาก backend"
    });

    const parsedUpload = fileUploadResponseSchema.parse({
      created_at: "2026-06-18T09:51:37.000Z",
      filename: "lesson-screenshot.png",
      id: "file-from-backend",
      status: "pending"
    });

    expect(parsedDashboard.documents[0]?.summary_available).toBe(true);
    expect(parsedDetail.related_exams[0]?.status).toBe("completed");
    expect(parsedDetail.user_id).toBe("");
    expect(parsedUpload.user_id).toBe("");
  });

  it("rejects unknown document status values", () => {
    const result = documentLibraryResponseSchema.safeParse({
      ...backendDocumentDashboardResponse,
      documents: [
        {
          ...backendDocumentDashboardResponse.documents[0],
          status: "finished"
        }
      ]
    });

    expect(result.success).toBe(false);
  });

  it("keeps the dashboard shape aligned with the document route contract", () => {
    const result = documentLibraryResponseSchema.safeParse({
      documents: [],
      total_documents: 0
    });

    expect(result.success).toBe(false);
  });
});