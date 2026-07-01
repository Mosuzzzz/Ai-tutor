import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

    expect(screen.getByRole("link", { name: /สร้างควิซจากสรุปนี้/ })).toHaveAttribute(
      "href",
      "/quiz?documentId=doc-lab-safety"
    );
    expect(screen.getByRole("link", { name: /ถาม AI จากเอกสารนี้/ })).toHaveAttribute(
      "href",
      "/chat?documentId=doc-lab-safety"
    );
    const selectedCard = screen.getByTestId("document-summary-selected-card");
    expect(within(selectedCard).getByText("พร้อมใช้งานกับ AI")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ส่งออกสรุป" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "แชร์สรุป" })).not.toBeInTheDocument();
  });

  it("blocks AI actions when the selected document only has a backend fallback summary", () => {
    const dashboard: DocumentSummaryViewModel = {
      ...documentSummaryMock,
      documentDetails: [
        {
          ...documentSummaryMock.documentDetails[0],
          canUseAiActions: false,
          detailedBreakdown: [],
          keyTopics: [],
          summaryMarkdown: "",
          summaryNotice: "backend ยังไม่ได้ส่งสรุปที่สร้างจากเนื้อหาเอกสารจริง",
          summaryQuality: "needs-backend-summary"
        }
      ],
      selectedDocumentId: "doc-lab-safety"
    };

    render(<DocumentSummaryPage dashboard={dashboard} selectedDocumentId="doc-lab-safety" />);

    expect(screen.queryByRole("link", { name: /สร้างควิซจากสรุปนี้/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ถาม AI จากเอกสารนี้/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("รอสรุปจริงจาก Backend").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/backend ยังไม่ได้ส่งสรุปที่สร้างจากเนื้อหาเอกสารจริง/).length).toBeGreaterThan(0);
    expect(screen.getByText(/ยังไม่มีหัวข้อสำคัญจนกว่า backend จะส่งสรุป/)).toBeInTheDocument();
  });
  it("keeps core AI flow actions scoped and resilient for long filenames", () => {
    render(<DocumentSummaryPage />);

    expect(screen.getByTestId("document-summary-hero")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("document-summary-selected-card")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByText("1 อัปโหลดเอกสาร")).toBeInTheDocument();
    expect(screen.getByText("2 อ่านสรุป")).toBeInTheDocument();
    expect(screen.getByText("3 ถาม AI หรือสร้างควิซ")).toBeInTheDocument();
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

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีเอกสารพร้อมสรุป");
    expect(screen.getByText(/อัปโหลดเอกสารแรกหรือรอให้ระบบประมวลผลเสร็จ/)).toBeInTheDocument();
    expect(screen.queryByText(/รอครูแชร์|ผู้เรียน|ผู้สอน/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "ดูคอร์สเรียน" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับแดชบอร์ด" })).toHaveAttribute("href", "/");
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

  it("shows only the two latest uploaded documents in the sidebar and opens all documents in a popup", () => {
    const latestDocuments = [...documentSummaryMock.apiResponse.documents].sort(
      (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at)
    );

    render(<DocumentSummaryPage canUploadDocuments dashboard={documentSummaryMock} selectedDocumentId="doc-lab-safety" />);

    const libraryPreview = screen.getByRole("region", { name: "เอกสารล่าสุดในคลัง" });

    expect(within(libraryPreview).getAllByRole("article")).toHaveLength(2);
    expect(within(libraryPreview).getByText(latestDocuments[0].filename)).toBeInTheDocument();
    expect(within(libraryPreview).getByText(latestDocuments[1].filename)).toBeInTheDocument();
    expect(within(libraryPreview).queryByText(latestDocuments[2].filename)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ดูเอกสารทั้งหมดในคลัง" }));

    const libraryDialog = screen.getByRole("dialog", { name: "เอกสารทั้งหมดในคลัง" });

    expect(within(libraryDialog).getAllByRole("article")).toHaveLength(latestDocuments.length);
    expect(within(libraryDialog).getByText(latestDocuments[2].filename)).toBeInTheDocument();
    expect(within(libraryDialog).getByText(`รวม ${latestDocuments.length} รายการ เรียงจากล่าสุดก่อน`)).toBeInTheDocument();
    expect(within(libraryDialog).getByRole("button", { name: "ปิดคลังเอกสารทั้งหมด" })).toHaveFocus();

    fireEvent.click(within(libraryDialog).getByRole("button", { name: "ปิดคลังเอกสารทั้งหมด" }));

    expect(screen.queryByRole("dialog", { name: "เอกสารทั้งหมดในคลัง" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ดูเอกสารทั้งหมดในคลัง" })).toHaveFocus();
  });

  it("closes the document library popup with Escape and restores focus to the opener", async () => {
    render(<DocumentSummaryPage canUploadDocuments dashboard={documentSummaryMock} selectedDocumentId="doc-lab-safety" />);

    const opener = screen.getByRole("button", { name: "ดูเอกสารทั้งหมดในคลัง" });
    fireEvent.click(opener);

    const libraryDialog = screen.getByRole("dialog", { name: "เอกสารทั้งหมดในคลัง" });
    fireEvent.keyDown(libraryDialog, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "เอกสารทั้งหมดในคลัง" })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(opener).toHaveFocus();
    });
  });

  it("lets a user delete an uploaded document from the library after confirmation", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          document: {
            id: "doc-ai-ethics"
          },
          message: "ลบเอกสารออกจากคลังแล้ว",
          ok: true
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<DocumentSummaryPage canUploadDocuments dashboard={documentSummaryMock} selectedDocumentId="doc-lab-safety" />);

    const documentCard = screen.getByRole("article", {
      name: "เอกสารในคลัง แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf"
    });
    fireEvent.click(within(documentCard).getByRole("button", { name: "ลบเอกสาร แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/documents/doc-ai-ethics", {
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        },
        method: "DELETE"
      });
    });

    expect(confirmSpy).toHaveBeenCalledWith("ต้องการลบเอกสาร \"แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf\" ออกจากคลังใช่ไหม?");
    await waitFor(() => {
      expect(screen.queryByRole("article", { name: "เอกสารในคลัง แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("ลบเอกสารออกจากคลังแล้ว");
  });

  it("keeps a document visible and shows a safe error when delete fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            message: "บัญชีนี้ไม่มีสิทธิ์ลบเอกสารนี้",
            ok: false
          }),
          {
            headers: {
              "Content-Type": "application/json"
            },
            status: 403
          }
        );
      })
    );

    render(<DocumentSummaryPage canUploadDocuments dashboard={documentSummaryMock} selectedDocumentId="doc-lab-safety" />);

    const documentCard = screen.getByRole("article", {
      name: "เอกสารในคลัง แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf"
    });
    fireEvent.click(within(documentCard).getByRole("button", { name: "ลบเอกสาร แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("บัญชีนี้ไม่มีสิทธิ์ลบเอกสารนี้");
    expect(screen.getByRole("article", { name: "เอกสารในคลัง แนวทางจริยธรรม AI สำหรับห้องเรียน.pdf" })).toBeInTheDocument();
  });
});
