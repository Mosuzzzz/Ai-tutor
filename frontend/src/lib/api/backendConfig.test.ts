import { describe, expect, it } from "vitest";

import { createBackendUrl, getBackendBaseUrl } from "./backendConfig";

describe("backend API configuration", () => {
  it("uses the local FastAPI backend as the safe default server-only base URL", () => {
    expect(getBackendBaseUrl({})).toBe("http://127.0.0.1:8000");
  });

  it("uses AI_TUTOR_BACKEND_URL and removes trailing slashes", () => {
    expect(getBackendBaseUrl({ AI_TUTOR_BACKEND_URL: "https://api.example.com///" })).toBe(
      "https://api.example.com"
    );
  });

  it("rejects non-http backend URLs", () => {
    expect(() => getBackendBaseUrl({ AI_TUTOR_BACKEND_URL: "javascript:alert(1)" })).toThrow(
      "Backend URL must use http or https"
    );
  });

  it("builds backend URLs from relative API paths only", () => {
    expect(createBackendUrl("/api/auth/session", "https://api.example.com").toString()).toBe(
      "https://api.example.com/api/auth/session"
    );

    expect(() => createBackendUrl("https://evil.example.com/api/auth/session", "https://api.example.com")).toThrow(
      "Backend path must be relative"
    );

    expect(() => createBackendUrl("//evil.example.com/api/auth/session", "https://api.example.com")).toThrow(
      "Backend path must be relative"
    );
  });
});
