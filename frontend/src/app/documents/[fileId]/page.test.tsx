import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import DocumentSummaryDetailRoute from "./page";

const studentSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "student"
  }
};

const documentDashboard = {
  apiEndpoint: "/api/files/dashboard",
  apiResponse: {
    documents: [
      {
        created_at: "2026-06-05T08:00:00.000Z",
        filename: "safety-handbook.pdf",
        id: "file-ready",
        related_exams_count: 2,
        status: "ready" as const,
        summary_available: true,
        summary_markdown: "## Overview\nReview safety checklist",
        uploaded_by: "Trainer One"
      }
    ],
    status_counts: {
      error: 0,
      pending: 0,
      processing: 0,
      ready: 1
    },
    total_documents: 1
  },
  detailEndpointPattern: "/api/files/{file_id}/detail",
  documentDetails: [
    {
      detailedBreakdown: [
        {
          body: "Review safety checklist",
          id: "overview",
          title: "Overview"
        }
      ],
      filename: "safety-handbook.pdf",
      generatedAtLabel: "5 Jun 2026",
      id: "file-ready",
      keyTopics: [
        {
          confidencePercent: 96,
          id: "topic-1",
          title: "Overview"
        }
      ],
      relatedDocuments: [],
      sourcePreview: "Safety checklist preview",
      summaryMarkdown: "## Overview\nReview safety checklist",
      uploadedByLabel: "Uploaded by Trainer One"
    }
  ],
  generatedAtLabel: "5 Jun 2026, 10:00",
  recapEndpointPattern: "/api/recap/{file_id}",
  selectedDocumentId: "file-ready",
  workspaceName: "Document Workspace"
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadDocumentSummaryDetailForSession = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
}));

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/document-summary/documentSummaryApi", () => ({
  loadDocumentSummaryDetailForSession
}));

vi.mock("next/navigation", () => ({
  notFound,
  usePathname: () => "/documents/file-ready"
}));

describe("document summary detail route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studentSession);
    loadDocumentSummaryDetailForSession.mockReset();
    loadDocumentSummaryDetailForSession.mockResolvedValue({
      dashboard: documentDashboard,
      status: "ready"
    });
    notFound.mockClear();
  });

  it("guards the deep-linked document detail page and loads the selected file id", async () => {
    render(await DocumentSummaryDetailRoute({ params: Promise.resolve({ fileId: "file-ready" }) }));

    expect(requirePageSession).toHaveBeenCalledWith("/documents");
    expect(loadDocumentSummaryDetailForSession).toHaveBeenCalledWith({
      selectedDocumentId: "file-ready",
      session: studentSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByTestId("document-summary-detail")).toHaveAttribute("data-source", "api");
    expect(screen.getByRole("heading", { name: "safety-handbook.pdf" })).toBeInTheDocument();
  });

  it("rejects invalid path-like document ids before loading protected data", async () => {
    await expect(
      DocumentSummaryDetailRoute({ params: Promise.resolve({ fileId: "../file-ready" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
    expect(requirePageSession).not.toHaveBeenCalled();
    expect(loadDocumentSummaryDetailForSession).not.toHaveBeenCalled();
  });
});
