import { describe, expect, it } from "vitest";

import { assertCsrfSafeRequest, isStateChangingMethod } from "./csrf";

describe("CSRF and origin guard helpers", () => {
  it("treats safe HTTP methods as non-mutating", () => {
    expect(isStateChangingMethod("GET")).toBe(false);
    expect(isStateChangingMethod("HEAD")).toBe(false);
    expect(isStateChangingMethod("OPTIONS")).toBe(false);
    expect(isStateChangingMethod("POST")).toBe(true);
  });

  it("allows state-changing requests from the same origin", () => {
    expect(() =>
      assertCsrfSafeRequest({
        host: "localhost:3000",
        method: "POST",
        origin: "http://localhost:3000"
      })
    ).not.toThrow();
  });

  it("allows configured trusted origins for local development", () => {
    expect(() =>
      assertCsrfSafeRequest({
        allowedOrigins: ["http://127.0.0.1:3000"],
        host: "localhost:3000",
        method: "POST",
        origin: "http://127.0.0.1:3000"
      })
    ).not.toThrow();
  });

  it("rejects state-changing requests with missing or cross-site origin", () => {
    expect(() =>
      assertCsrfSafeRequest({
        host: "localhost:3000",
        method: "POST",
        origin: null
      })
    ).toThrow("CSRF origin check failed");

    expect(() =>
      assertCsrfSafeRequest({
        host: "localhost:3000",
        method: "POST",
        origin: "https://evil.example.com"
      })
    ).toThrow("CSRF origin check failed");
  });
});
