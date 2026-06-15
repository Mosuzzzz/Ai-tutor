import { describe, expect, it, vi } from "vitest";

import { deleteDocumentFromLibrary } from "./documentDeleteClient";

describe("deleteDocumentFromLibrary", () => {
  it("calls the document delete BFF with same-origin credentials", async () => {
    const fetcher = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          document: {
            id: "file-ready"
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

    const result = await deleteDocumentFromLibrary("file-ready", fetcher);

    expect(result).toEqual({
      document: {
        id: "file-ready"
      },
      message: "ลบเอกสารออกจากคลังแล้ว",
      ok: true
    });
    expect(fetcher).toHaveBeenCalledWith("/api/documents/file-ready", {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "DELETE"
    });
  });

  it("returns a safe failure for empty ids, backend errors, and invalid responses", async () => {
    expect(await deleteDocumentFromLibrary(" ")).toEqual({
      message: "ไม่สามารถลบเอกสารได้ในขณะนี้",
      ok: false
    });

    const backendFailure = await deleteDocumentFromLibrary(
      "file-ready",
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

    expect(backendFailure).toEqual({
      message: "บัญชีนี้ไม่มีสิทธิ์ลบเอกสารนี้",
      ok: false
    });

    const invalidResponse = await deleteDocumentFromLibrary(
      "file-ready",
      vi.fn(async () => new Response("not json", { status: 200 }))
    );

    expect(invalidResponse).toEqual({
      message: "ไม่สามารถลบเอกสารได้ในขณะนี้",
      ok: false
    });
  });
});
