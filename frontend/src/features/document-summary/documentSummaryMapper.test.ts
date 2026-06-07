import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { backendDocumentDashboardResponse, backendDocumentDetailResponse, backendRecapResponse } from "./documentSummaryTestData";
import { isDocumentLibraryEmpty, selectDocumentForDetail, toDocumentSummaryViewModel } from "./documentSummaryMapper";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "student"
  }
};

describe("document summary mapper", () => {
  it("maps dashboard and detail responses into the existing view model shape", () => {
    const dashboard = toDocumentSummaryViewModel({
      dashboard: backendDocumentDashboardResponse,
      details: [backendDocumentDetailResponse],
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.apiResponse.total_documents).toBe(3);
    expect(dashboard.selectedDocumentId).toBe("file-ready");
    expect(dashboard.documentDetails[0]?.filename).toBe("safety-handbook.pdf");
    expect(dashboard.documentDetails[0]?.uploadedByLabel).toContain("Trainer One");
    expect(dashboard.documentDetails[0]?.keyTopics.map((topic) => topic.title)).toContain("Overview");
    expect(dashboard.documentDetails[0]?.relatedDocuments.map((document) => document.id)).toContain("file-needs-recap");
    expect(dashboard.documentDetails[0]?.relatedDocuments.find((document) => document.id === "file-needs-recap")?.href).toBe(
      "/documents/file-needs-recap"
    );
    expect(JSON.stringify(dashboard)).not.toContain("learner@example.com");
  });

  it("uses recap markdown when a ready document has no cached summary in detail", () => {
    const dashboard = toDocumentSummaryViewModel({
      dashboard: backendDocumentDashboardResponse,
      details: [
        {
          ...backendDocumentDetailResponse,
          filename: "ethics-guide.pdf",
          id: "file-needs-recap",
          summary_available: false,
          summary_markdown: null
        }
      ],
      recaps: [backendRecapResponse],
      selectedDocumentId: "file-needs-recap",
      session
    });

    expect(dashboard.selectedDocumentId).toBe("file-needs-recap");
    expect(dashboard.documentDetails[0]?.summaryMarkdown).toContain("AI ethics guidance");
  });

  it("detects empty libraries and selects ready documents first", () => {
    expect(
      isDocumentLibraryEmpty({
        documents: [],
        status_counts: {
          error: 0,
          pending: 0,
          processing: 0,
          ready: 0
        },
        total_documents: 0
      })
    ).toBe(true);

    expect(selectDocumentForDetail(backendDocumentDashboardResponse)?.id).toBe("file-ready");
    expect(selectDocumentForDetail(backendDocumentDashboardResponse, "file-processing")?.id).toBe("file-processing");
  });
});
