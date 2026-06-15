import { describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import { ApiClientError, type BackendFormDataRequestOptions, type BackendJsonRequestOptions } from "../../../../lib/api/backendClient";
import {
  createDocumentRouteHandlers,
  type DocumentFormBackendRequest,
  type DocumentJsonBackendRequest
} from "./documentBffHandlers";

const backendUploadResponse = {
  created_at: "2026-06-05T10:00:00.000Z",
  filename: "safety-handbook.pdf",
  id: "file-ready",
  status: "pending",
  storage_url: "/secure/uploads/safety-handbook.pdf",
  tenant_id: "tenant-1",
  uploaded_by: "trainer-1"
};

const backendStatusResponse = {
  created_at: "2026-06-05T10:00:00.000Z",
  file_id: "file-ready",
  filename: "safety-handbook.pdf",
  status: "processing"
};

const createUploadRequest = ({
  cookie = "server-cookie-token",
  file = new File(["safe lab checklist"], "safety-handbook.pdf", { type: "application/pdf" }),
  origin = "http://frontend.test"
}: {
  cookie?: string | null;
  file?: File | null;
  origin?: string | null;
} = {}) => {
  const headers = new Headers({
    host: "frontend.test"
  });
  const formData = new FormData();

  if (origin !== null) {
    headers.set("origin", origin);
  }

  if (cookie) {
    headers.set("cookie", `${AUTH_COOKIE_NAMES.accessToken}=${encodeURIComponent(cookie)}`);
  }

  if (file) {
    formData.set("file", file, file.name);
    formData.set("filename", file.name);
  }

  return new Request("http://frontend.test/api/documents/upload", {
    body: formData,
    headers,
    method: "POST"
  });
};

const createStatusRequest = (cookie: string | null = "server-cookie-token") => {
  const headers = new Headers({
    host: "frontend.test"
  });

  if (cookie) {
    headers.set("cookie", `${AUTH_COOKIE_NAMES.accessToken}=${encodeURIComponent(cookie)}`);
  }

  return new Request("http://frontend.test/api/documents/file-ready/status", {
    headers,
    method: "GET"
  });
};

const createDeleteRequest = ({
  cookie = "server-cookie-token",
  origin = "http://frontend.test"
}: {
  cookie?: string | null;
  origin?: string | null;
} = {}) => {
  const headers = new Headers({
    host: "frontend.test"
  });

  if (origin !== null) {
    headers.set("origin", origin);
  }

  if (cookie) {
    headers.set("cookie", `${AUTH_COOKIE_NAMES.accessToken}=${encodeURIComponent(cookie)}`);
  }

  return new Request("http://frontend.test/api/documents/file-ready", {
    headers,
    method: "DELETE"
  });
};

describe("document BFF route handlers", () => {
  it("uploads a safe document to Backend with the HttpOnly access cookie", async () => {
    const backendFormDataRequest = vi.fn(async () => backendUploadResponse) as unknown as ReturnType<typeof vi.fn> &
      DocumentFormBackendRequest;
    const backendJsonRequest = vi.fn() as unknown as DocumentJsonBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest,
      backendJsonRequest
    });

    const response = await handlers.upload(createUploadRequest());
    const body = await response.json();

    expect(response.status, JSON.stringify(body)).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.document).toEqual({
      createdAt: "2026-06-05T10:00:00.000Z",
      filename: "safety-handbook.pdf",
      id: "file-ready",
      status: "pending"
    });
    expect(JSON.stringify(body)).not.toContain("server-cookie-token");
    expect(JSON.stringify(body)).not.toContain("storage_url");
    expect(JSON.stringify(body)).not.toContain("/secure/uploads");
    expect(backendFormDataRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        body: expect.any(FormData),
        path: "/api/files/upload"
      })
    );
  });

  it("rejects cross-origin, missing-cookie, and invalid file upload attempts before Backend", async () => {
    const backendFormDataRequest = vi.fn() as unknown as DocumentFormBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest,
      backendJsonRequest: vi.fn() as unknown as DocumentJsonBackendRequest
    });

    const crossOrigin = await handlers.upload(createUploadRequest({ origin: "https://evil.example.com" }));
    const missingCookie = await handlers.upload(createUploadRequest({ cookie: null }));
    const invalidFile = await handlers.upload(
      createUploadRequest({
        file: new File(["bad"], "payload.exe", { type: "application/octet-stream" })
      })
    );

    expect(crossOrigin.status).toBe(403);
    expect(missingCookie.status).toBe(401);
    expect(invalidFile.status).toBe(400);
    expect(backendFormDataRequest).not.toHaveBeenCalled();
  });

  it("enforces the configured upload size limit before Backend", async () => {
    const backendFormDataRequest = vi.fn() as unknown as DocumentFormBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest,
      backendJsonRequest: vi.fn() as unknown as DocumentJsonBackendRequest,
      maxFileSizeBytes: 4
    });

    const response = await handlers.upload(
      createUploadRequest({
        file: new File(["12345"], "too-large.pdf", { type: "application/pdf" })
      })
    );

    expect(response.status).toBe(400);
    expect(backendFormDataRequest).not.toHaveBeenCalled();
  });

  it("loads upload processing status through the server-side access cookie", async () => {
    const backendJsonRequest = vi.fn(async () => backendStatusResponse) as unknown as ReturnType<typeof vi.fn> &
      DocumentJsonBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest: vi.fn() as unknown as DocumentFormBackendRequest,
      backendJsonRequest
    });

    const response = await handlers.status(createStatusRequest(), { fileId: "file-ready" });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.document.status).toBe("processing");
    expect(backendJsonRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        path: "/api/files/file-ready/status"
      })
    );
  });

  it("deletes a document through the server-side access cookie without leaking backend details", async () => {
    const backendJsonRequest = vi.fn(async () => null) as unknown as ReturnType<typeof vi.fn> &
      DocumentJsonBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest: vi.fn() as unknown as DocumentFormBackendRequest,
      backendJsonRequest
    });

    const response = await handlers.delete(createDeleteRequest(), { fileId: "file-ready" });
    const body = await response.json();

    expect(response.status, JSON.stringify(body)).toBe(200);
    expect(body).toEqual({
      document: {
        id: "file-ready"
      },
      message: "ลบเอกสารออกจากคลังแล้ว",
      ok: true
    });
    expect(JSON.stringify(body)).not.toContain("server-cookie-token");
    expect(backendJsonRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "server-cookie-token",
        method: "DELETE",
        path: "/api/files/file-ready"
      })
    );
  });

  it("rejects cross-origin and missing-cookie document delete attempts before Backend", async () => {
    const backendJsonRequest = vi.fn() as unknown as DocumentJsonBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest: vi.fn() as unknown as DocumentFormBackendRequest,
      backendJsonRequest
    });

    const crossOrigin = await handlers.delete(createDeleteRequest({ origin: "https://evil.example.com" }), {
      fileId: "file-ready"
    });
    const missingCookie = await handlers.delete(createDeleteRequest({ cookie: null }), { fileId: "file-ready" });

    expect(crossOrigin.status).toBe(403);
    expect(missingCookie.status).toBe(401);
    expect(backendJsonRequest).not.toHaveBeenCalled();
  });

  it("maps Backend upload errors to safe BFF responses", async () => {
    const backendFormDataRequest = vi.fn(async (_options: BackendFormDataRequestOptions<unknown>) => {
      throw new ApiClientError({
        code: "forbidden",
        message: "Tenant mismatch",
        status: 403
      });
    }) as unknown as ReturnType<typeof vi.fn> & DocumentFormBackendRequest;
    const handlers = createDocumentRouteHandlers({
      backendFormDataRequest,
      backendJsonRequest: vi.fn(async (_options: BackendJsonRequestOptions<unknown>) => backendStatusResponse) as unknown as DocumentJsonBackendRequest
    });

    const response = await handlers.upload(createUploadRequest());
    const body = await response.json();

    expect(response.status, JSON.stringify(body)).toBe(403);
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("Tenant mismatch");
  });
});
