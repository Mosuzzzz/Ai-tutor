import { NextResponse } from "next/server";
import { z } from "zod";

import {
  DOCUMENT_UPLOAD_API_PATH,
  documentDeleteApiPath,
  fileStatusApiPath,
  fileStatusResponseSchema,
  fileUploadResponseSchema,
  type FileStatusResponse,
  type FileUploadResponse
} from "../../../../features/document-summary/documentSummaryContract";
import { AUTH_COOKIE_NAMES } from "../../../../lib/api/authCookies";
import {
  ApiClientError,
  backendFormDataRequest,
  backendJsonRequest,
  mapApiErrorToMessage,
  type BackendFormDataRequestOptions,
  type BackendJsonRequestOptions
} from "../../../../lib/api/backendClient";
import { assertCsrfSafeRequest } from "../../../../lib/api/csrf";

export type DocumentFormBackendRequest = <TResponse>(
  options: BackendFormDataRequestOptions<TResponse>
) => Promise<TResponse>;

export type DocumentJsonBackendRequest = <TResponse>(
  options: BackendJsonRequestOptions<TResponse>
) => Promise<TResponse>;

type DocumentRouteDependencies = {
  allowedExtensions?: readonly string[];
  allowedOrigins?: readonly string[];
  backendFormDataRequest?: DocumentFormBackendRequest;
  backendJsonRequest?: DocumentJsonBackendRequest;
  maxFileSizeBytes?: number;
};

type DocumentRouteContext = {
  fileId: string;
};

const DEFAULT_ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".png", ".jpg", ".jpeg", ".webp"] as const;
const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const createDocumentRouteHandlers = ({
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  allowedOrigins = getConfiguredAllowedOrigins(),
  backendFormDataRequest: formRequest = backendFormDataRequest,
  backendJsonRequest: jsonRequest = backendJsonRequest,
  maxFileSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES
}: DocumentRouteDependencies = {}) => {
  const assertRequestOrigin = (request: Request) => {
    assertCsrfSafeRequest({
      allowedOrigins,
      host: request.headers.get("host") ?? new URL(request.url).host,
      method: request.method,
      origin: request.headers.get("origin")
    });
  };

  const readAccessToken = (request: Request) => {
    const accessToken = readRequestCookie(request, AUTH_COOKIE_NAMES.accessToken);

    if (!accessToken) {
      throw new ApiClientError({
        code: "unauthorized",
        message: "Missing access token",
        status: 401
      });
    }

    return accessToken;
  };

  return {
    delete: async (request: Request, { fileId }: DocumentRouteContext) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const safeFileId = z.string().trim().min(1).max(200).parse(fileId);

        await jsonRequest({
          accessToken,
          method: "DELETE",
          path: documentDeleteApiPath(safeFileId),
          schema: z.unknown()
        });

        return createDocumentSuccessResponse(
          {
            document: {
              id: safeFileId
            },
            message: "ลบเอกสารออกจากคลังแล้ว",
            ok: true
          },
          200
        );
      } catch (error) {
        return createDocumentErrorResponse(error);
      }
    },
    status: async (request: Request, { fileId }: DocumentRouteContext) => {
      try {
        const accessToken = readAccessToken(request);
        const safeFileId = z.string().trim().min(1).max(200).parse(fileId);
        const documentStatus = await jsonRequest({
          accessToken,
          path: fileStatusApiPath(safeFileId),
          schema: fileStatusResponseSchema
        });

        return createDocumentSuccessResponse(
          {
            document: toSafeStatusDocument(documentStatus),
            ok: true
          },
          200
        );
      } catch (error) {
        return createDocumentErrorResponse(error);
      }
    },
    upload: async (request: Request) => {
      try {
        assertRequestOrigin(request);
        const accessToken = readAccessToken(request);
        const uploadPayload = await readUploadPayload(request);
        const file = validateUploadFile(uploadPayload.file, {
          allowedExtensions,
          fallbackFilename: uploadPayload.filename,
          maxFileSizeBytes
        });
        const formData = new FormData();
        formData.set("file", file, file.name);

        const document = await formRequest({
          accessToken,
          body: formData,
          path: DOCUMENT_UPLOAD_API_PATH,
          schema: fileUploadResponseSchema
        });

        return createDocumentSuccessResponse(
          {
            document: toSafeUploadedDocument(document),
            message: "อัปโหลดเอกสารสำเร็จ ระบบกำลังเริ่มประมวลผล",
            ok: true
          },
          201
        );
      } catch (error) {
        return createDocumentErrorResponse(error);
      }
    }
  };
};

export const documentRouteHandlers = createDocumentRouteHandlers();

const readUploadPayload = async (request: Request) => {
  try {
    const formData = await request.formData();
    const filename = formData.get("filename");
    return {
      file: formData.get("file"),
      filename: typeof filename === "string" ? filename : undefined
    };
  } catch {
    throw new ApiClientError({
      code: "validation_error",
      message: "Invalid upload form data",
      status: 400
    });
  }
};

const validateUploadFile = (
  value: FormDataEntryValue | null,
  {
    allowedExtensions,
    fallbackFilename,
    maxFileSizeBytes
  }: {
    allowedExtensions: readonly string[];
    fallbackFilename?: string;
    maxFileSizeBytes: number;
  }
): File => {
  const file = isUploadFile(value) ? value : undefined;

  if (!file) {
    return throwUploadValidationError("กรุณาเลือกไฟล์เอกสารก่อนอัปโหลด");
  }

  const filename = resolveUploadFilename(file, fallbackFilename);

  if (!filename) {
    throwUploadValidationError("ชื่อไฟล์ไม่ถูกต้อง");
  }

  if (file.size <= 0) {
    throwUploadValidationError("ไฟล์ว่าง ไม่สามารถอัปโหลดได้");
  }

  if (file.size > maxFileSizeBytes) {
    throwUploadValidationError("ไฟล์ต้องมีขนาดไม่เกิน 50 MB");
  }

  const extension = getFileExtension(filename);
  if (!allowedExtensions.includes(extension)) {
    throwUploadValidationError("รองรับเฉพาะไฟล์ PDF, Word, PowerPoint หรือรูปภาพ");
  }

  return filename === file.name ? file : new File([file], filename, { type: file.type });
};

const isUploadFile = (value: FormDataEntryValue | null): value is File => {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value &&
    "arrayBuffer" in value &&
    typeof value.name === "string" &&
    typeof value.size === "number" &&
    typeof value.type === "string" &&
    typeof value.arrayBuffer === "function"
  );
};

const throwUploadValidationError = (message: string): never => {
  throw new ApiClientError({
    code: "validation_error",
    message,
    status: 400
  });
};

const getFileExtension = (filename: string) => {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : "";
};

const resolveUploadFilename = (file: File, fallbackFilename: string | undefined) => {
  const primaryFilename = sanitizeFilename(file.name);

  if (getFileExtension(primaryFilename)) {
    return primaryFilename;
  }

  return sanitizeFilename(fallbackFilename ?? primaryFilename);
};

const sanitizeFilename = (filename: string) => {
  return filename.split(/[\\/]/).at(-1)?.trim().slice(0, 255) ?? "";
};

const toSafeUploadedDocument = (document: FileUploadResponse) => {
  return {
    createdAt: document.created_at,
    filename: document.filename,
    id: document.id,
    status: document.status
  };
};

const toSafeStatusDocument = (document: FileStatusResponse) => {
  return {
    createdAt: document.created_at,
    filename: document.filename,
    id: document.file_id,
    status: document.status
  };
};

const readRequestCookie = (request: Request, name: string) => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      const value = rawValue.join("=");
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }

  return undefined;
};

const createDocumentSuccessResponse = (payload: Record<string, unknown>, status: number) => {
  return NextResponse.json(payload, { status });
};

const createDocumentErrorResponse = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        message: "ข้อมูลเอกสารไม่ถูกต้อง",
        ok: false
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiClientError) {
    const message = error.code === "validation_error" ? error.message : mapApiErrorToMessage(error);

    return NextResponse.json(
      {
        message,
        ok: false
      },
      { status: error.status ?? (error.code === "csrf_violation" ? 403 : 500) }
    );
  }

  return NextResponse.json(
    {
      message: "ไม่สามารถอัปโหลดหรืออ่านสถานะเอกสารได้",
      ok: false
    },
    { status: 500 }
  );
};

function getConfiguredAllowedOrigins() {
  return (process.env.AI_TUTOR_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
