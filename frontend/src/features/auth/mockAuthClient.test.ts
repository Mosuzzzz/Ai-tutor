import { describe, expect, it } from "vitest";

import { submitMockLogin, submitMockRegister } from "./mockAuthClient";

describe("mock auth client", () => {
  it("returns an API-ready login result without exposing passwords or access tokens", async () => {
    const result = await submitMockLogin({
      email: "  Learner@Example.COM ",
      password: "learning123"
    });

    expect(result).toEqual({
      ok: true,
      message: "เข้าสู่ระบบสำเร็จในโหมด mock",
      session: {
        mode: "http-only-cookie",
        storesTokenInClient: false,
        user: {
          email: "learner@example.com",
          role: "student"
        }
      }
    });
    expect(JSON.stringify(result)).not.toContain("learning123");
    expect(JSON.stringify(result)).not.toContain("accessToken");
  });

  it("returns a register result with the selected role and display name", async () => {
    const result = await submitMockRegister({
      acceptedTerms: true,
      email: " Teacher@Example.com ",
      fullName: "อาจารย์สมชาย ใจดี",
      password: "secure-pass",
      role: "teacher"
    });

    expect(result).toEqual({
      ok: true,
      message: "สมัครสมาชิกสำเร็จในโหมด mock",
      session: {
        mode: "http-only-cookie",
        storesTokenInClient: false,
        user: {
          displayName: "อาจารย์สมชาย ใจดี",
          email: "teacher@example.com",
          role: "teacher"
        }
      }
    });
    expect(JSON.stringify(result)).not.toContain("secure-pass");
    expect(JSON.stringify(result)).not.toContain("accessToken");
  });
});
