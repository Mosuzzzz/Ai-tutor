import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentSummaryPage } from "./DocumentSummaryPage";
import { documentSummaryMock } from "./documentSummaryData";
import type { DocumentSummaryViewModel } from "./types";

const emptyDocumentSummary: DocumentSummaryViewModel = {
  ...documentSummaryMock,
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
  documentDetails: [],
  selectedDocumentId: ""
};

describe("DocumentSummaryPage", () => {
  it("renders an API-ready Thai document summary workspace", () => {
    render(<DocumentSummaryPage />);

    expect(screen.getByTestId("document-summary")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { name: "สรุปเอกสารด้วย AI" })).toBeInTheDocument();
    expect(screen.getAllByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 3, name: "หัวข้อสำคัญ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "รายละเอียดสรุป" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "เอกสารที่เกี่ยวข้อง" })).toBeInTheDocument();
  });

  it("renders document status metrics, status labels, and safe action targets", () => {
    render(<DocumentSummaryPage />);

    expect(screen.getByText("เอกสารทั้งหมด")).toBeInTheDocument();
    expect(screen.getByText("พร้อมสรุป")).toBeInTheDocument();
    expect(screen.getByText("กำลังประมวลผล")).toBeInTheDocument();
    expect(screen.getByText("มีปัญหา")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /สร้างควิซจากสรุปนี้/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: /ถาม AI จากเอกสารนี้/ })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("button", { name: "ส่งออกสรุป" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "แชร์สรุป" })).toBeDisabled();
  });

  it("does not expose backend endpoint details in the DOM", () => {
    render(<DocumentSummaryPage />);

    expect(screen.queryByText("/api/files/dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/files/{file_id}/detail")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/recap/{file_id}")).not.toBeInTheDocument();
    expect(screen.getByTestId("document-summary")).not.toHaveAttribute("data-api-endpoint");
  });

  it("renders loading and error states with explicit accessible semantics", () => {
    const { rerender } = render(<DocumentSummaryPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดสรุปเอกสาร");

    rerender(<DocumentSummaryPage errorMessage="โหลดข้อมูลเอกสารไม่สำเร็จ" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("โหลดข้อมูลเอกสารไม่สำเร็จ");
  });

  it("renders an empty state instead of crashing when the document library is empty", () => {
    render(<DocumentSummaryPage dashboard={emptyDocumentSummary} />);

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีเอกสารที่พร้อมสรุป");
    expect(screen.getByText("อัปโหลดเอกสารหรือรอให้ pipeline ประมวลผลเสร็จก่อน")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /สร้างควิซจากสรุปนี้/ })).not.toBeInTheDocument();
  });

  it("supports swapping the selected document from API-ready data", () => {
    render(<DocumentSummaryPage dashboard={documentSummaryMock} selectedDocumentId="doc-ai-ethics" />);

    const summaryRegion = screen.getByRole("region", { name: "รายละเอียดสรุปเอกสารที่เลือก" });

    expect(within(summaryRegion).getByText("แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf")).toBeInTheDocument();
    expect(within(summaryRegion).getByText("ความโปร่งใสในการใช้ AI")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูรายละเอียดเอกสาร/ })).toHaveAttribute(
      "href",
      "/documents/doc-ai-ethics"
    );
  });
});
