import { z } from "zod";

import type { DocumentProcessingStatus } from "./types";

type DocumentUploadFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type UploadedDocumentStatus = {
  createdAt: string;
  filename: string;
  id: string;
  status: DocumentProcessingStatus;
};

export type DocumentUploadSuccess = {
  document: UploadedDocumentStatus;
  message: string;
  ok: true;
};

export type DocumentStatusSuccess = {
  document: UploadedDocumentStatus;
  ok: true;
};

export type DocumentUploadFailure = {
  message: string;
  ok: false;
};

export type DocumentUploadResult = DocumentUploadSuccess | DocumentUploadFailure;
export type DocumentStatusResult = DocumentStatusSuccess | DocumentUploadFailure;

const DOCUMENT_UPLOAD_BFF_PATH = "/api/documents/upload";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const ALLOWED_UPLOAD_EXTENSIONS: readonly string[] = [
  ".pdf",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp"
];
const GENERIC_UPLOAD_ERROR = "ไม่สามารถอัปโหลดเอกสารได้ในขณะนี้";
const GENERIC_STATUS_ERROR = "ไม่สามารถอ่านสถานะการประมวลผลเอกสารได้";

const documentProcessingStatusSchema = z.enum(["pending", "processing", "ready", "error"]);

const uploadedDocumentStatusSchema = z.object({
  createdAt: z.string(),
  filename: z.string(),
  id: z.string(),
  status: documentProcessingStatusSchema
});

const documentUploadSuccessSchema = z.object({
  document: uploadedDocumentStatusSchema,
  message: z.string().min(1),
  ok: z.literal(true)
});

const documentStatusSuccessSchema = z.object({
  document: uploadedDocumentStatusSchema,
  ok: z.literal(true)
});

const documentUploadFailureSchema = z.object({
  message: z.string().min(1),
  ok: z.literal(false)
});

export const submitDocumentUpload = async (
  { file }: { file: File | null | undefined },
  fetcher: DocumentUploadFetch = globalThis.fetch
): Promise<DocumentUploadResult> => {
  const validation = validateDocumentUploadFile(file);
  if (!validation.ok) {
    return validation;
  }

  try {
    const formData = new FormData();
    formData.set("file", validation.file, validation.file.name);
    formData.set("filename", validation.file.name);

    const response = await fetcher(DOCUMENT_UPLOAD_BFF_PATH, {
      body: formData,
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "POST"
    });
    const payload = await readJsonBody(response);
    const parsed = documentUploadSuccessSchema.safeParse(payload);

    if (parsed.success) {
      return parsed.data;
    }

    return {
      message: extractMessage(payload) ?? GENERIC_UPLOAD_ERROR,
      ok: false
    };
  } catch {
    return {
      message: GENERIC_UPLOAD_ERROR,
      ok: false
    };
  }
};

export const getDocumentProcessingStatus = async (
  fileId: string,
  fetcher: DocumentUploadFetch = globalThis.fetch
): Promise<DocumentStatusResult> => {
  const safeFileId = fileId.trim();

  if (!safeFileId) {
    return {
      message: GENERIC_STATUS_ERROR,
      ok: false
    };
  }

  try {
    const response = await fetcher(documentStatusBffPath(safeFileId), {
      credentials: "same-origin",
      headers: {
        Accept: "application/json"
      },
      method: "GET"
    });
    const payload = await readJsonBody(response);
    const success = documentStatusSuccessSchema.safeParse(payload);

    if (success.success) {
      return success.data;
    }

    const failure = documentUploadFailureSchema.safeParse(payload);
    return {
      message: failure.success ? failure.data.message : GENERIC_STATUS_ERROR,
      ok: false
    };
  } catch {
    return {
      message: GENERIC_STATUS_ERROR,
      ok: false
    };
  }
};

export const validateDocumentUploadFile = (
  file: File | null | undefined
):
  | {
      file: File;
      ok: true;
    }
  | DocumentUploadFailure => {
  if (!file) {
    return {
      message: "กรุณาเลือกไฟล์เอกสารก่อนอัปโหลด",
      ok: false
    };
  }

  if (file.size <= 0) {
    return {
      message: "ไฟล์ว่าง ไม่สามารถอัปโหลดได้",
      ok: false
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      message: "ไฟล์ต้องมีขนาดไม่เกิน 50 MB",
      ok: false
    };
  }

  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(getFileExtension(file.name))) {
    return {
      message: "รองรับเฉพาะไฟล์ PDF, Word, PowerPoint หรือรูปภาพ",
      ok: false
    };
  }

  return {
    file,
    ok: true
  };
};

const documentStatusBffPath = (fileId: string) => `/api/documents/${encodeURIComponent(fileId)}/status`;

const getFileExtension = (filename: string) => {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
};

const readJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const extractMessage = (payload: unknown) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return undefined;
};
