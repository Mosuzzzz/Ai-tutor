import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("security headers", () => {
  it("sets the frontend security headers required by AGENTS_FRONTEND", async () => {
    const headers = await nextConfig.headers?.();
    const authHeaders = headers?.find((entry) => entry.source === "/:path*")?.headers ?? [];
    const headerNames = authHeaders.map((header) => header.key);

    expect(headerNames).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options"
      ])
    );
  });
});
