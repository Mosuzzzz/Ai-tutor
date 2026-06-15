import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema, validateLogin, validateRegister } from "./authValidation";

describe("auth validation", () => {
  it("exposes Zod schemas for auth form validation without requiring a visible role", () => {
    expect(loginSchema.safeParse({ email: "learner@example.com", password: "learning123" }).success).toBe(
      true
    );
    expect(
      registerSchema.safeParse({
        acceptedTerms: true,
        confirmPassword: "learning123",
        email: "learner@example.com",
        fullName: "ผู้เรียนทดลอง",
        password: "learning123"
      }).success
    ).toBe(true);
  });

  it("rejects login submissions without a valid email and password", () => {
    const result = validateLogin({ email: "not-an-email", password: "short" });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.email).toBe("กรุณากรอกอีเมลให้ถูกต้อง");
    expect(result.fieldErrors.password).toBe("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  });

  it("accepts a valid login submission and normalizes email casing", () => {
    const result = validateLogin({ email: "  Student@Example.COM ", password: "learning123" });

    expect(result).toEqual({
      ok: true,
      values: {
        email: "student@example.com",
        password: "learning123"
      }
    });
  });

  it("rejects register submissions with weak password, mismatch, and unchecked terms", () => {
    const result = validateRegister({
      acceptedTerms: false,
      confirmPassword: "different-password",
      email: "learner@example.com",
      fullName: "",
      password: "weak"
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors).not.toHaveProperty("role");
    expect(result.fieldErrors.fullName).toBe("กรุณากรอกชื่อ-นามสกุล");
    expect(result.fieldErrors.password).toBe("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    expect(result.fieldErrors.confirmPassword).toBe("รหัสผ่านยืนยันไม่ตรงกัน");
    expect(result.fieldErrors.acceptedTerms).toBe("กรุณายอมรับเงื่อนไขการใช้งาน");
  });

  it("accepts a valid single-user registration submission and adds the backend-compatible default role", () => {
    const result = validateRegister({
      acceptedTerms: true,
      confirmPassword: "secure-pass",
      email: " Learner@Example.com ",
      fullName: "ผู้เรียนทดลอง",
      password: "secure-pass"
    });

    expect(result).toEqual({
      ok: true,
      values: {
        acceptedTerms: true,
        email: "learner@example.com",
        fullName: "ผู้เรียนทดลอง",
        password: "secure-pass",
        role: "student"
      }
    });
  });
});
