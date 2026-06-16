import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { backendDocumentDashboardResponse, backendDocumentDetailResponse } from "./documentSummaryTestData";
import { toDocumentSummaryViewModel } from "./documentSummaryMapper";
import { DocumentSummaryDetailPage } from "./DocumentSummaryDetailPage";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Learner One",
    email: "learner@example.com",
    role: "user"
  }
};

const dashboard = toDocumentSummaryViewModel({
  dashboard: backendDocumentDashboardResponse,
  details: [backendDocumentDetailResponse],
  selectedDocumentId: "file-ready",
  session,
  timestamp: new Date("2026-06-05T10:00:00.000Z")
});

describe("DocumentSummaryDetailPage", () => {
  it("renders a deep-linked document summary detail page", () => {
    render(<DocumentSummaryDetailPage dashboard={dashboard} dataSource="api" status="ready" />);

    expect(screen.getByTestId("document-summary-detail")).toHaveAttribute("data-source", "api");
    expect(screen.getByRole("link", { name: /กลับไปคลังเอกสาร/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("heading", { level: 1, name: "safety-handbook.pdf" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "สรุปเอกสาร" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "หัวข้อสำคัญ" })).toBeInTheDocument();
    expect(screen.getByText("รายละเอียดสรุปเอกสาร")).toBeInTheDocument();
    expect(screen.getByText("สรุปจาก AI")).toBeInTheDocument();
    expect(screen.queryByText("Document Summary Detail")).not.toBeInTheDocument();
    expect(screen.queryByText("Summary")).not.toBeInTheDocument();
  });

  it("keeps document-context actions scoped to the selected document id", () => {
    render(<DocumentSummaryDetailPage dashboard={dashboard} dataSource="api" status="ready" />);

    expect(screen.getByRole("link", { name: /สร้างควิซจากเอกสารนี้/ })).toHaveAttribute(
      "href",
      "/quiz?documentId=file-ready"
    );
    expect(screen.getByRole("link", { name: /ถาม AI จากเอกสารนี้/ })).toHaveAttribute(
      "href",
      "/chat?documentId=file-ready"
    );
  });

  it("renders accessible summary sections and does not expose backend-only details", () => {
    render(<DocumentSummaryDetailPage dashboard={dashboard} dataSource="api" status="ready" />);

    const summaryRegion = screen.getByRole("region", { name: "สรุปเอกสาร safety-handbook.pdf" });

    expect(within(summaryRegion).getByText("ภาพรวม")).toBeInTheDocument();
    expect(within(summaryRegion).getByText(/ทบทวนรายการความปลอดภัย/)).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThan(0);
    expect(screen.queryByText("/api/files/dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/files/file-ready/detail")).not.toBeInTheDocument();
    expect(screen.queryByText("/secure/uploads/safety-handbook.pdf")).not.toBeInTheDocument();
    expect(JSON.stringify(screen.getByTestId("document-summary-detail").textContent)).not.toContain("server-cookie-token");
  });

  it("renders explicit loading, error, and empty states", () => {
    const { rerender } = render(<DocumentSummaryDetailPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดรายละเอียดเอกสาร");

    rerender(<DocumentSummaryDetailPage errorMessage="ไม่พบเอกสารหรือไม่มีสิทธิ์เข้าถึง" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("ไม่พบเอกสารหรือไม่มีสิทธิ์เข้าถึง");

    rerender(
      <DocumentSummaryDetailPage
        dashboard={{
          ...dashboard,
          documentDetails: [],
          selectedDocumentId: "file-ready"
        }}
        status="ready"
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีรายละเอียดสรุปสำหรับเอกสารนี้");
  });
});
