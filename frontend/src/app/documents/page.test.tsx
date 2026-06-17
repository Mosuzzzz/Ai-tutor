import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import DocumentsPage from "./page";

const userSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Study User",
    email: "user@example.com",
    role: "user"
  }
};

const documentDashboard = {
  apiEndpoint: "/api/files/dashboard",
  apiResponse: {
    documents: [],
    status_counts: {
      error: 0,
      pending: 0,
      processing: 0,
      ready: 0
    },
    total_documents: 0
  },
  detailEndpointPattern: "/api/files/{file_id}/detail",
  documentDetails: [],
  generatedAtLabel: "5 Jun 2026, 10:00",
  recapEndpointPattern: "/api/recap/{file_id}",
  selectedDocumentId: "",
  workspaceName: "Document Workspace"
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadDocumentSummaryForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/document-summary/documentSummaryApi", () => ({
  loadDocumentSummaryForSession
}));

describe("documents route", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(userSession);
    loadDocumentSummaryForSession.mockReset();
    loadDocumentSummaryForSession.mockResolvedValue({
      dashboard: documentDashboard,
      status: "empty"
    });
  });

  it("renders the API-backed document summary feature inside the app shell", async () => {
    render(await DocumentsPage());

    expect(requirePageSession).toHaveBeenCalledWith("/documents");
    expect(loadDocumentSummaryForSession).toHaveBeenCalledWith({
      session: userSession
    });
    expect(screen.getByRole("banner")).toHaveTextContent("AI Tutor");
    expect(screen.getByTestId("document-summary")).toBeInTheDocument();
    expect(screen.getByTestId("document-summary")).toHaveAttribute("data-source", "api");
  });
});
