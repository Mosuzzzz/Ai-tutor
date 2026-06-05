import { describe, expect, it } from "vitest";

import {
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
