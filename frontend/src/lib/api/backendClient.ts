import type { z } from "zod";

import { createBackendUrl, getBackendBaseUrl } from "./backendConfig";

export type ApiClientErrorCode =
  | "backend_error"
  | "configuration_error"
  | "csrf_violation"
  | "forbidden"
  | "invalid_response"
  | "network_error"
  | "not_found"
  | "timeout"
  | "unauthorized"
  | "validation_error";

type ApiClientErrorInput = {
  code: ApiClientErrorCode;
  details?: unknown;
  message: string;
  status?: number;
};

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode;
  readonly details?: unknown;
  readonly status?: number;

  constructor({ code, details, message, status }: ApiClientErrorInput) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export type ApiFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type BackendJsonRequestOptions<TResponse> = {
  accessToken?: string;
  baseUrl?: string;
  body?: unknown;
  fetcher?: ApiFetcher;
  headers?: HeadersInit;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  path: string;
  schema: z.ZodType<TResponse>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 10_000;

export const backendJsonRequest = async <TResponse>({
  accessToken,
  baseUrl = getBackendBaseUrl(),
  body,
  fetcher = globalThis.fetch,
  headers,
  method = "GET",
  path,
  schema,
  signal,
  timeoutMs = DEFAULT_TIMEOUT_MS
}: BackendJsonRequestOptions<TResponse>): Promise<TResponse> => {
  if (!fetcher) {
    throw new ApiClientError({
      code: "configuration_error",
      message: "Fetch API is not available in this runtime"
    });
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  signal?.addEventListener(
    "abort",
    () => {
      controller.abort();
    },
    { once: true }
  );

  try {
    const response = await fetcher(createBackendUrl(path, baseUrl), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: buildRequestHeaders(headers, accessToken, body !== undefined),
      method,
      signal: controller.signal
    });

    const payload = await readJsonBody(response);

    if (!response.ok) {
      throw buildBackendError(response, payload);
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiClientError({
        code: "invalid_response",
        details: parsed.error.issues,
        message: "Backend response did not match the expected contract",
        status: response.status
      });
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (timedOut) {
      throw new ApiClientError({
        code: "timeout",
        message: "Backend request timed out"
      });
    }

    throw new ApiClientError({
      code: "network_error",
      details: error,
      message: "Backend request failed"
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

export const mapApiErrorToMessage = (error: unknown) => {
  if (!(error instanceof ApiClientError)) {
    return "เกิดข้อผิดพลาดที่ไม่คาดคิด";
  }

  const messages: Record<ApiClientErrorCode, string> = {
    backend_error: "ระบบ backend ขัดข้องชั่วคราว",
    configuration_error: "การตั้งค่าการเชื่อมต่อ backend ไม่ถูกต้อง",
    csrf_violation: "คำขอนี้ไม่ผ่านการตรวจสอบความปลอดภัย",
    forbidden: "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้",
    invalid_response: "รูปแบบข้อมูลจาก backend ไม่ตรงกับที่ frontend คาดไว้",
    network_error: "เชื่อมต่อ backend ไม่สำเร็จ",
    not_found: "ไม่พบข้อมูลที่ต้องการ",
    timeout: "backend ใช้เวลาตอบกลับนานเกินไป",
    unauthorized: "กรุณาเข้าสู่ระบบอีกครั้ง",
    validation_error: "ข้อมูลที่ส่งไปยัง backend ไม่ถูกต้อง"
  };

  return messages[error.code];
};

const buildRequestHeaders = (headers: HeadersInit | undefined, accessToken: string | undefined, hasBody: boolean) => {
  const requestHeaders: Record<string, string> = {
    Accept: "application/json"
  };

  new Headers(headers).forEach((value, key) => {
    requestHeaders[key] = value;
  });

  if (hasBody) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (accessToken?.trim()) {
    requestHeaders.Authorization = `Bearer ${accessToken.trim()}`;
  }

  return requestHeaders;
};

const readJsonBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError({
      code: "invalid_response",
      message: "Backend response was not valid JSON",
      status: response.status
    });
  }
};

const buildBackendError = (response: Response, payload: unknown) => {
  return new ApiClientError({
    code: mapStatusToCode(response.status),
    details: payload,
    message: extractBackendDetail(payload) || response.statusText || "Backend request failed",
    status: response.status
  });
};

const mapStatusToCode = (status: number): ApiClientErrorCode => {
  if (status === 401) {
    return "unauthorized";
  }

  if (status === 403) {
    return "forbidden";
  }

  if (status === 404) {
    return "not_found";
  }

  if (status === 400 || status === 409 || status === 422) {
    return "validation_error";
  }

  return "backend_error";
};

const extractBackendDetail = (payload: unknown) => {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = payload.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return undefined;
};
