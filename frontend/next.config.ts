import type { NextConfig } from "next";

type ContentSecurityPolicyEnvironment = "development" | "production" | "test";

export const buildContentSecurityPolicy = (environment: ContentSecurityPolicyEnvironment = process.env.NODE_ENV) => {
  const scriptSource =
    environment === "production" ? "script-src 'self'" : "script-src 'self' 'unsafe-eval' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "object-src 'none'",
    scriptSource,
    "style-src 'self' 'unsafe-inline'"
  ].join("; ");
};

const contentSecurityPolicy = buildContentSecurityPolicy();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: securityHeaders,
        source: "/:path*"
      }
    ];
  }
};

export default nextConfig;
