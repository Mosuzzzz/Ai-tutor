import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AiChatSummaryPage } from "./AiChatSummaryPage";
import { aiChatSummaryMock } from "./aiChatData";
import { backendChatQueryResponse } from "./aiChatTestData";
import type { AiChatSummaryViewModel } from "./types";

const emptyChatMock: AiChatSummaryViewModel = {
  ...aiChatSummaryMock,
  documents: [],
  messages: [],
  selectedDocumentId: ""
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AiChatSummaryPage", () => {
  it("renders an API-ready Thai AI chat and summary workspace", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByTestId("ai-chat-summary")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { name: "แชท AI กับเอกสาร" })).toBeInTheDocument();
    expect(screen.getAllByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "บทสนทนาอ้างอิงเอกสาร" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "สรุปประกอบคำตอบ" })).toBeInTheDocument();
    expect(screen.getByText("แชทจากเอกสารเดียวกัน")).toBeInTheDocument();
    expect(screen.queryByText("Grounded RAG Chat")).not.toBeInTheDocument();
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

  it("renders safe next-step actions and an enabled document-context composer", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByRole("link", { name: /ดูสรุปเอกสาร/ })).toHaveAttribute(
      "href",
      "/documents/doc-lab-safety"
    );
    expect(screen.getByRole("link", { name: /สร้างควิซจากเอกสารนี้/ })).toHaveAttribute(
      "href",
      "/quiz?documentId=doc-lab-safety"
    );
    expect(screen.getByRole("textbox", { name: "คำถามถึง AI Tutor" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "ส่งคำถาม" })).toBeDisabled();
  });

  it("submits a question with selected document context and appends grounded answer citations", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          chat: backendChatQueryResponse,
          message: "ส่งคำถามถึง AI สำเร็จ",
          ok: true
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<AiChatSummaryPage chat={{ ...aiChatSummaryMock, messages: [] }} />);

    fireEvent.change(screen.getByRole("textbox", { name: "คำถามถึง AI Tutor" }), {
      target: {
        value: "ควรสรุปประเด็นไหนก่อนทำควิซ"
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำถาม" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/chat/query", {
        body: JSON.stringify({
          fileId: "doc-lab-safety",
          prompt: "ควรสรุปประเด็นไหนก่อนทำควิซ"
        }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      });
    });

    expect(await screen.findByText("ควรสรุปประเด็นไหนก่อนทำควิซ")).toBeInTheDocument();
    expect(screen.getByText("รายงานเหตุผิดปกติทันทีและแจ้งครูผู้สอน")).toBeInTheDocument();
    expect(screen.getByText("safety-handbook.pdf · ส่วนที่ 4")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("ส่งคำถามถึง AI สำเร็จ");
    expect(screen.getByRole("textbox", { name: "คำถามถึง AI Tutor" })).toHaveValue("");
    expect(screen.queryByText("/api/chat/query")).not.toBeInTheDocument();
  });

  it("keeps document context visible and shows a safe error when chat submit fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Document is not ready for chat.",
            ok: false
          }),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 400
          }
        )
      )
    );

    render(<AiChatSummaryPage chat={{ ...aiChatSummaryMock, messages: [] }} />);

    fireEvent.change(screen.getByRole("textbox", { name: "คำถามถึง AI Tutor" }), {
      target: {
        value: "ถามจากเอกสารนี้"
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "ส่งคำถาม" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Document is not ready for chat.");
    expect(screen.getAllByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf").length).toBeGreaterThan(0);
  });

  it("keeps the three-column workspace from overlapping with long Thai content", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByTestId("ai-chat-workspace-grid")).toHaveClass("items-start", "xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,320px)]");
    expect(screen.getByTestId("ai-chat-document-selector")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("ai-chat-thread-column")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("ai-chat-summary-panel")).toHaveClass("min-w-0", "overflow-hidden");
  });

  it("keeps visible chat metrics and mapper-driven labels Thai-first", () => {
    render(<AiChatSummaryPage />);

    expect(screen.getByText("คำตอบอ้างอิง")).toBeInTheDocument();
    expect(screen.getByText("เอกสารพร้อมถาม")).toBeInTheDocument();
    expect(screen.getByText("ประวัติสนทนา")).toBeInTheDocument();
    expect(screen.queryByText("Grounded answers")).not.toBeInTheDocument();
    expect(screen.queryByText("Ready documents")).not.toBeInTheDocument();
    expect(screen.queryByText("History items")).not.toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "ไปคลังเอกสาร" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: "ดูคอร์สเรียน" })).toHaveAttribute("href", "/courses");
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
