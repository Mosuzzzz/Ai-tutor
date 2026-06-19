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
