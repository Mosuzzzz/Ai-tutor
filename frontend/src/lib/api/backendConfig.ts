export type BackendEnvironment = {
  AI_TUTOR_BACKEND_URL?: string;
} & Record<string, string | undefined>;

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8000";

export const getBackendBaseUrl = (env: BackendEnvironment = process.env) => {
  const rawUrl = env.AI_TUTOR_BACKEND_URL?.trim() || DEFAULT_BACKEND_BASE_URL;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Backend URL must be a valid URL");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Backend URL must use http or https");
  }

  const normalizedPath = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname.replace(/\/+$/, "");

  return `${parsedUrl.origin}${normalizedPath}`;
};

export const createBackendUrl = (path: string, baseUrl = getBackendBaseUrl()) => {
  if (path.startsWith("//") || /^[a-z][a-z\d+\-.]*:/i.test(path)) {
    throw new Error("Backend path must be relative");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${baseUrl}/`);
};
