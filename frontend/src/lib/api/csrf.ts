import { ApiClientError } from "./backendClient";

export type CsrfRequestInput = {
  allowedOrigins?: readonly string[];
  host: string | null;
  method: string;
  origin: string | null;
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const isStateChangingMethod = (method: string) => {
  return !SAFE_METHODS.has(method.toUpperCase());
};

export const assertCsrfSafeRequest = ({ allowedOrigins = [], host, method, origin }: CsrfRequestInput) => {
  if (!isStateChangingMethod(method)) {
    return;
  }

  const requestOrigin = origin;
  const requestHost = host;

  if (!requestOrigin || !requestHost) {
    return throwCsrfError();
  }

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(requestOrigin);
  } catch {
    return throwCsrfError();
  }

  if (parsedOrigin.host === requestHost || allowedOrigins.includes(parsedOrigin.origin)) {
    return;
  }

  return throwCsrfError();
};

const throwCsrfError = (): never => {
  throw new ApiClientError({
    code: "csrf_violation",
    message: "CSRF origin check failed"
  });
};
