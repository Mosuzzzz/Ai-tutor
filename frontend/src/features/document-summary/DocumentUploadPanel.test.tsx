import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DocumentUploadPanel } from "./DocumentUploadPanel";

const routerRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: routerRefresh
  })
}));

describe("DocumentUploadPanel", () => {
  it("renders a disabled learner state when the role cannot upload", () => {
    render(<DocumentUploadPanel canUpload={false} />);

    expect(screen.getByText("การอัปโหลดสำหรับผู้สอนและแอดมิน")).toBeInTheDocument();
    expect(screen.queryByLabelText("เลือกไฟล์เอกสาร")).not.toBeInTheDocument();
  });

  it("uploads a valid file and shows the processing status without exposing endpoints", async () => {
    const submitUpload = vi.fn(async () => ({
      document: {
        createdAt: "2026-06-05T10:00:00.000Z",
        filename: "training-manual.pdf",
        id: "file-ready",
        status: "pending" as const
      },
      message: "อัปโหลดเอกสารสำเร็จ",
      ok: true as const
    }));
    const fetchStatus = vi.fn(async () => ({
      document: {
        createdAt: "2026-06-05T10:00:00.000Z",
        filename: "training-manual.pdf",
        id: "file-ready",
        status: "processing" as const
      },
      ok: true as const
    }));

    render(
      <DocumentUploadPanel
        canUpload
        fetchStatus={fetchStatus}
        pollIntervalMs={5}
        submitUpload={submitUpload}
      />
    );

    const fileInput = screen.getByLabelText("เลือกไฟล์เอกสาร");
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["training manual"], "training-manual.pdf", { type: "application/pdf" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "อัปโหลดเอกสาร" }));

    await waitFor(() => {
      expect(submitUpload).toHaveBeenCalledWith({
        file: expect.objectContaining({
          name: "training-manual.pdf"
        })
      });
    });
    await waitFor(() => {
      expect(fetchStatus).toHaveBeenCalledWith("file-ready");
    });

    expect(screen.getByRole("status")).toHaveTextContent("กำลังประมวลผลเอกสาร");
    expect(screen.getByRole("progressbar", { name: "สถานะการประมวลผลเอกสาร" })).toBeInTheDocument();
    expect(routerRefresh).toHaveBeenCalled();
    expect(screen.queryByText("/api/documents/upload")).not.toBeInTheDocument();
  });

  it("shows client-side validation errors before submitting", async () => {
    const submitUpload = vi.fn();

    render(<DocumentUploadPanel canUpload submitUpload={submitUpload} />);

    fireEvent.change(screen.getByLabelText("เลือกไฟล์เอกสาร"), {
      target: {
        files: [new File(["bad"], "payload.exe", { type: "application/octet-stream" })]
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "อัปโหลดเอกสาร" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("รองรับเฉพาะไฟล์ PDF, Word, PowerPoint หรือรูปภาพ");
    expect(submitUpload).not.toHaveBeenCalled();
  });
});
