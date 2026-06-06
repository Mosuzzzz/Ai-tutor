import { describe, expect, it, vi } from "vitest";

import {
  getDocumentProcessingStatus,
  submitDocumentUpload
} from "./documentUploadApiClient";

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200,
    statusText: init.statusText
  });
};

describe("document upload API client", () => {
  it("submits a document to the BFF without storing tokens or forcing Content-Type", async () => {
    const file = new File(["training manual"], "training-manual.pdf", { type: "application/pdf" });
    const fetcher = vi.fn(async () =>
      jsonResponse(
        {
          document: {
            createdAt: "2026-06-05T10:00:00.000Z",
            filename: "training-manual.pdf",
            id: "file-ready",
            status: "pending"
          },
          message: "อัปโหลดเอกสารสำเร็จ",
          ok: true
        },
        { status: 201 }
      )
    );
    const localStorageSetItem = vi.spyOn(Storage.prototype, "setItem");

    const result = await submitDocumentUpload({ file }, fetcher);

    expect(result.ok).toBe(true);
    expect(result.document?.status).toBe("pending");
    expect(fetcher).toHaveBeenCalledWith(
      "/api/documents/upload",
      expect.objectContaining({
        body: expect.any(FormData),
        credentials: "same-origin",
        method: "POST"
      })
    );
    const init = fetcher.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(init.headers).has("Content-Type")).toBe(false);
    expect(localStorageSetItem).not.toHaveBeenCalled();

    localStorageSetItem.mockRestore();
  });

  it("maps upload validation and server errors to a safe failure result", async () => {
    const invalidResult = await submitDocumentUpload({
      file: new File(["bad"], "malware.exe", { type: "application/octet-stream" })
    });
    const fetcher = vi.fn(async () =>
      jsonResponse(
        {
          message: "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้",
          ok: false
        },
        { status: 403 }
      )
    );
    const forbiddenResult = await submitDocumentUpload(
      {
        file: new File(["training manual"], "training-manual.pdf", { type: "application/pdf" })
      },
      fetcher
    );

    expect(invalidResult.ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(forbiddenResult).toEqual({
      message: "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้",
      ok: false
    });
  });

  it("loads a safe processing status from the BFF", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse({
        document: {
          createdAt: "2026-06-05T10:00:00.000Z",
          filename: "training-manual.pdf",
          id: "file-ready",
          status: "ready"
        },
        ok: true
      })
    );

    const result = await getDocumentProcessingStatus("file-ready", fetcher);

    expect(result.ok).toBe(true);
    expect(result.document?.status).toBe("ready");
    expect(fetcher).toHaveBeenCalledWith(
      "/api/documents/file-ready/status",
      expect.objectContaining({
        credentials: "same-origin",
        method: "GET"
      })
    );
  });
});
