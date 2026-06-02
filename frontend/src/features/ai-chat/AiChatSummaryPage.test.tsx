import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiChatSummaryPage } from "./AiChatSummaryPage";
import { aiChatSummaryMock } from "./aiChatData";
import type { AiChatSummaryViewModel } from "./types";

const emptyChatMock: AiChatSummaryViewModel = {
  ...aiChatSummaryMock,
  documents: [],
  messages: [],
  selectedDocumentId: ""
};

describe("AiChatSummaryPage", () => {
  it("renders an API-ready Thai AI chat and summary workspace", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByTestId("ai-chat-summary")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { name: "แชท AI กับเอกสาร" })).toBeInTheDocument();
    expect(screen.getAllByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "บทสนทนาอ้างอิงเอกสาร" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "สรุปประกอบคำตอบ" })).toBeInTheDocument();
  });

  it("renders document list, selected summary, grounded messages, and citations", () => {
    render(<AiChatSummaryPage />);

    const selectedDocument = screen.getByRole("article", {
      name: "เอกสารที่เลือก คู่มือความปลอดภัยห้องปฏิบัติการ.pdf"
    });

    expect(within(selectedDocument).getByText("พร้อมถาม AI")).toBeInTheDocument();
    expect(screen.getByText("ควรเริ่มทบทวนเรื่องใดก่อนทำควิซความปลอดภัย")).toBeInTheDocument();
    expect(screen.getByText(/เริ่มจาก checklist ก่อนเข้าห้องปฏิบัติการ/)).toBeInTheDocument();
    expect(screen.getAllByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf · ส่วนที่ 2").length).toBeGreaterThan(0);
    expect(screen.getByText("ตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง")).toBeInTheDocument();
  });

  it("renders safe next-step actions and a disabled mock composer", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByRole("link", { name: /ดูสรุปเอกสาร/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /สร้างควิซจากคำตอบนี้/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("textbox", { name: "คำถามถึง AI Tutor" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "ส่งคำถาม" })).toBeDisabled();
  });

  it("keeps the three-column workspace from overlapping with long Thai content", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByTestId("ai-chat-workspace-grid")).toHaveClass("items-start", "xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,320px)]");
    expect(screen.getByTestId("ai-chat-document-selector")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("ai-chat-thread-column")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("ai-chat-summary-panel")).toHaveClass("min-w-0", "overflow-hidden");
  });

  it("does not expose backend endpoint details in the DOM", () => {
    render(<AiChatSummaryPage />);

    expect(screen.queryByText("/api/chat/query")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/chat/history")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/files/dashboard")).not.toBeInTheDocument();
    expect(screen.getByTestId("ai-chat-summary")).not.toHaveAttribute("data-api-endpoint");
  });

  it("renders loading, error, and empty states with explicit accessible semantics", () => {
    const { rerender } = render(<AiChatSummaryPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดบทสนทนา AI");

    rerender(<AiChatSummaryPage errorMessage="โหลดบทสนทนาไม่สำเร็จ" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("โหลดบทสนทนาไม่สำเร็จ");

    rerender(<AiChatSummaryPage chat={emptyChatMock} />);

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีเอกสารที่พร้อมให้ถาม AI");
    expect(screen.queryByRole("textbox", { name: "คำถามถึง AI Tutor" })).not.toBeInTheDocument();
  });

  it("supports swapping selected document data without changing UI structure", () => {
    render(<AiChatSummaryPage chat={aiChatSummaryMock} selectedDocumentId="doc-ai-ethics" />);

    const selectedDocument = screen.getByRole("article", {
      name: "เอกสารที่เลือก แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf"
    });

    expect(within(selectedDocument).getByText("แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf")).toBeInTheDocument();
    expect(within(selectedDocument).getByText("สรุปหลักการใช้ AI อย่างโปร่งใสและตรวจสอบคำตอบด้วยหลักฐาน")).toBeInTheDocument();
  });
});
