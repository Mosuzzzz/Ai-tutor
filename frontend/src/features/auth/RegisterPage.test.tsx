import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_COPY, AUTH_MESSAGES } from "./authContent";
import { RegisterPage } from "./RegisterPage";

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });
};

const fillValidRegistration = () => {
  fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
    target: { value: "ผู้เรียนทดลอง" }
  });
  fireEvent.change(screen.getByLabelText("อีเมล"), {
    target: { value: "learner@example.com" }
  });
  fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
    target: { value: "secure-pass" }
  });
  fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
    target: { value: "secure-pass" }
  });
  fireEvent.click(screen.getByLabelText(AUTH_COPY.register.termsLabel));
};

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a focused single-user account form with a truthful planned Google option", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("heading", { name: "สร้างพื้นที่เรียนของคุณ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับหน้าแรก" })).toHaveAttribute("href", "/home");
    expect(screen.queryByRole("radio", { name: "นักเรียน" })).not.toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "ผู้สอน" })).not.toBeInTheDocument();
    expect(screen.queryByText("บัญชีเดียวสำหรับพื้นที่เรียนรู้ของคุณ")).not.toBeInTheDocument();
    expect(screen.queryByText(/หลังสมัครแล้วคุณจะอัปโหลดเอกสาร/)).not.toBeInTheDocument();
    expect(screen.queryByText("พื้นที่เรียนส่วนตัว")).not.toBeInTheDocument();
    expect(screen.getByLabelText("ชื่อ-นามสกุล")).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("ยืนยันรหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText(AUTH_COPY.register.termsLabel)).toBeInTheDocument();
    expect(screen.getByText("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "สมัครสมาชิก" })).toHaveClass("auth-primary-submit");
    expect(screen.getByRole("button", { name: "ดำเนินการต่อด้วย Google (เร็ว ๆ นี้)" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Facebook/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: AUTH_COPY.register.footerLink })).toHaveAttribute("href", "/login");
  });

  it("reveals and hides both registration passwords without changing their values", () => {
    render(<RegisterPage />);

    const password = screen.getByLabelText("รหัสผ่าน");
    const confirmation = screen.getByLabelText("ยืนยันรหัสผ่าน");
    fireEvent.change(password, { target: { value: "secure-pass" } });
    fireEvent.change(confirmation, { target: { value: "secure-pass" } });

    fireEvent.click(screen.getAllByRole("button", { name: "แสดงรหัสผ่าน" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "แสดงรหัสผ่าน" })[0]);

    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "text");
    expect(password).toHaveValue("secure-pass");
    expect(confirmation).toHaveValue("secure-pass");
  });

  it("shows validation errors for mismatched passwords and missing terms", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
      target: { value: "ผู้เรียนทดลอง" }
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
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    expect(screen.getByText("รหัสผ่านยืนยันไม่ตรงกัน")).toBeInTheDocument();
    expect(screen.getByText("กรุณายอมรับเงื่อนไขการใช้งาน")).toBeInTheDocument();
    expect(screen.getByLabelText(AUTH_COPY.register.termsLabel)).toHaveAttribute(
      "aria-describedby",
      "register-terms-error"
    );
  });

  it("submits a valid single-user registration through the BFF without a role choice", async () => {
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

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    expect(await screen.findByRole("status")).toHaveTextContent("สมัครสมาชิกสำเร็จ");
    expect(screen.queryByText("เส้นทางผู้สอน")).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        body: expect.not.stringContaining('"role"'),
        credentials: "same-origin",
        method: "POST"
      })
    );
  });

  it("shows a login action after local dev email verification completes", async () => {
    const devMessage = "สมัครสมาชิกและยืนยันอีเมลสำหรับ local dev แล้ว กรุณาเข้าสู่ระบบ";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          email: "learner@example.com",
          message: devMessage,
          ok: true,
          requiresEmailVerification: false,
          verifiedInDevelopment: true
        },
        { status: 201 }
      )
    );
    render(<RegisterPage />);

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("สมัครสมาชิกสำเร็จ");
    expect(success).toHaveTextContent("บัญชีของคุณพร้อมแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน");
    expect(screen.queryByText(devMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(/local dev/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ไปหน้าเข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("uses verification-required success copy without creating a session", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
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

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent("สมัครสมาชิกสำเร็จ");
    expect(success).toHaveTextContent("กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ");
    expect(screen.getByRole("link", { name: "ไปหน้าเข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("keeps an unsupported registration conflict as a safe form-level failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          message: "ข้อมูลที่ส่งไปยัง backend ไม่ถูกต้อง",
          ok: false
        },
        { status: 409 }
      )
    );
    render(<RegisterPage />);

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("ไม่สามารถสมัครสมาชิกได้");
    expect(alert).toHaveTextContent("กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง");
    expect(screen.getByLabelText("อีเมล")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("uses an availability message instead of transport detail for registration", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("backend unavailable"));
    render(<RegisterPage />);

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("ไม่สามารถสมัครสมาชิกได้ในขณะนี้");
    expect(alert).toHaveTextContent("กรุณาลองใหม่อีกครั้งในภายหลัง");
    expect(alert).not.toHaveTextContent("backend unavailable");
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

    fillValidRegistration();
    fireEvent.click(screen.getByRole("button", { name: AUTH_COPY.register.submitLabel }));

    const pendingStatus = await screen.findByRole("status");
    expect(pendingStatus).toHaveTextContent(AUTH_MESSAGES.registerSubmitting);
    expect(pendingStatus).toHaveAttribute("data-tone", "info");
    expect(screen.getByRole("button", { name: "กำลังสร้างบัญชี..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "กำลังสร้างบัญชี..." })).toHaveAttribute("aria-busy", "true");

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
