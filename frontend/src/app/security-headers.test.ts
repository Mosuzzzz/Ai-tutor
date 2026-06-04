import { describe, expect, it } from "vitest";

import nextConfig, { buildContentSecurityPolicy } from "../../next.config";

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

  it("keeps dev CSP compatible with Next.js while hardening production script policy", () => {
    const developmentCsp = buildContentSecurityPolicy("development");
    const productionCsp = buildContentSecurityPolicy("production");
    const productionScriptSrc = getCspDirective(productionCsp, "script-src");

    expect(developmentCsp).toContain("script-src 'self' 'unsafe-eval' 'unsafe-inline'");
    expect(productionScriptSrc).toBe("script-src 'self'");
    expect(productionScriptSrc).not.toContain("'unsafe-eval'");
    expect(productionScriptSrc).not.toContain("'unsafe-inline'");
  });
});

const getCspDirective = (csp: string, directiveName: string) => {
  return csp
    .split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(directiveName));
};
