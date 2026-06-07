import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_MESSAGES } from "./authContent";
import { RegisterPage } from "./RegisterPage";

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });
};

const fillValidTeacherRegistration = () => {
  fireEvent.click(screen.getByRole("radio", { name: "ผู้สอน" }));
  fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
    target: { value: "อาจารย์สมชาย ใจดี" }
  });
  fireEvent.change(screen.getByLabelText("อีเมล"), {
    target: { value: "teacher@example.com" }
  });
  fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
    target: { value: "secure-pass" }
  });
  fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
    target: { value: "secure-pass" }
  });
  fireEvent.click(screen.getByLabelText("ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน"));
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders role selection, account fields, terms, and route link", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("heading", { name: "สร้างบัญชีใหม่" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "นักเรียน" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "ผู้สอน" })).not.toBeChecked();
    expect(screen.getByLabelText("ชื่อ-นามสกุล")).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("ยืนยันรหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("shows validation errors for mismatched passwords and missing terms", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
      target: { value: "นักเรียนทดลอง" }
    });
    fireEvent.change(screen.getByLabelText("อีเมล"), {
      target: { value: "learner@example.com" }
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "learning123" }
    });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
      target: { value: "different123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(screen.getByText("รหัสผ่านยืนยันไม่ตรงกัน")).toBeInTheDocument();
    expect(screen.getByText("กรุณายอมรับเงื่อนไขการใช้งาน")).toBeInTheDocument();
  });

  it("submits a valid teacher registration through the BFF", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          message: AUTH_MESSAGES.registerSuccess,
          ok: true,
          requiresEmailVerification: true
        },
        { status: 201 }
      )
    );
    render(<RegisterPage />);

    fillValidTeacherRegistration();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(await screen.findByText(AUTH_MESSAGES.registerSuccess)).toBeInTheDocument();
    expect(screen.getByText("เส้นทางผู้สอน")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST"
      })
    );
  });

  it("shows a login action after local dev email verification completes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          email: "teacher@example.com",
          message: "สมัครสมาชิกและยืนยันอีเมลสำหรับ local dev แล้ว กรุณาเข้าสู่ระบบ",
          ok: true,
          requiresEmailVerification: false,
          verifiedInDevelopment: true
        },
        { status: 201 }
      )
    );
    render(<RegisterPage />);

    fillValidTeacherRegistration();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(
      await screen.findByText("สมัครสมาชิกและยืนยันอีเมลสำหรับ local dev แล้ว กรุณาเข้าสู่ระบบ")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ไปหน้าเข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("uses an info status tone while registration is submitting instead of a success tone", async () => {
    let resolveRegister: (response: Response) => void = () => undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveRegister = resolve;
        })
    );
    render(<RegisterPage />);

    fillValidTeacherRegistration();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    const pendingStatus = await screen.findByRole("status");
    expect(pendingStatus).toHaveTextContent(AUTH_MESSAGES.registerSubmitting);
    expect(pendingStatus).toHaveAttribute("data-tone", "info");

    resolveRegister(
      jsonResponse(
        {
          message: AUTH_MESSAGES.registerSuccess,
          ok: true,
          requiresEmailVerification: true
        },
        { status: 201 }
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveAttribute("data-tone", "success");
    });
  });
});
