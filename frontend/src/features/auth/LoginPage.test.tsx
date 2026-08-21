import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_MESSAGES } from "./authContent";
import { LoginPage } from "./LoginPage";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace
  })
}));

const jsonResponse = (body: unknown, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });
};

const fillValidLogin = () => {
  fireEvent.change(screen.getByLabelText("อีเมล"), {
    target: { value: "student@example.com" }
  });
  fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
    target: { value: "learning123" }
  });
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    replace.mockClear();
  });

  it("renders a focused login form with a Home escape path and a truthful planned Google option", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "ยินดีต้อนรับกลับมา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับหน้าแรก" })).toHaveAttribute("href", "/home");
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "เข้าสู่ระบบ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "เข้าสู่ระบบ" })).toHaveClass("auth-primary-submit");
    expect(screen.getByRole("button", { name: "ดำเนินการต่อด้วย Google (เร็ว ๆ นี้)" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Facebook/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ลืมรหัสผ่าน?" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register");
  });

  it("updates the companion when fields receive focus and password visibility changes", () => {
    render(<LoginPage />);

    fireEvent.focus(screen.getByLabelText("อีเมล"));
    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-state", "email");

    fireEvent.focus(screen.getByLabelText("รหัสผ่าน"));
    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-state", "password");

    fireEvent.click(screen.getByRole("button", { name: "แสดงรหัสผ่าน" }));
    expect(screen.getByTestId("auth-study-companion")).toHaveAttribute("data-state", "password-visible");
  });

  it("reveals and hides the login password without clearing its value", () => {
    render(<LoginPage />);

    const password = screen.getByLabelText("รหัสผ่าน");
    fireEvent.change(password, { target: { value: "learning123" } });
    fireEvent.click(screen.getByRole("button", { name: "แสดงรหัสผ่าน" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("learning123");
    expect(screen.getByRole("button", { name: "ซ่อนรหัสผ่าน" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ซ่อนรหัสผ่าน" }));
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveValue("learning123");
  });

  it("shows validation errors before submitting login through the BFF", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: {
            email: "student@example.com",
            role: "user"
          }
        }
      })
    );
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(screen.getByText("กรุณากรอกอีเมล")).toBeInTheDocument();
    expect(screen.getByText("กรุณากรอกรหัสผ่าน")).toBeInTheDocument();

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(await screen.findByText(AUTH_MESSAGES.loginSuccess)).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        credentials: "same-origin",
        method: "POST"
      })
    );
  });

  it("uses an info status tone while login is submitting instead of a success tone", async () => {
    let resolveLogin: (response: Response) => void = () => undefined;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        })
    );
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    const pendingStatus = await screen.findByRole("status");
    expect(pendingStatus).toHaveTextContent(AUTH_MESSAGES.loginSubmitting);
    expect(pendingStatus).toHaveAttribute("data-tone", "info");
    expect(screen.getByRole("button", { name: "กำลังเข้าสู่ระบบ..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "กำลังเข้าสู่ระบบ..." })).toHaveAttribute("aria-busy", "true");

    resolveLogin(
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: {
            email: "student@example.com",
            role: "user"
          }
        }
      })
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveAttribute("data-tone", "success");
    });
  });

  it("redirects every successful login to the unified personal workspace", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: {
            email: "teacher@example.com",
            role: "user"
          }
        }
      })
    );
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/home");
    });
  });

  it("keeps an invalid-credential response combined and non-enumerating", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          message: "กรุณาเข้าสู่ระบบอีกครั้ง",
          ok: false
        },
        { status: 401 }
      )
    );
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    expect(alert).toHaveTextContent("ตรวจสอบข้อมูลแล้วลองอีกครั้ง");
    expect(alert).not.toHaveTextContent("กรุณาเข้าสู่ระบบอีกครั้ง");
  });

  it("preserves the safe verified-email guidance for a login 403", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(
        {
          message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
          ok: false
        },
        { status: 403 }
      )
    );
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
  });

  it("uses an availability message when login cannot reach a safe response", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Network unavailable"));
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้");
    expect(alert).toHaveTextContent("กรุณาลองใหม่อีกครั้งในภายหลัง");
    expect(alert).not.toHaveTextContent("Network unavailable");
  });

  it("shows success before replacing the route after the controlled 650ms window", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: {
            email: "student@example.com",
            role: "user"
          }
        }
      })
    );
    render(<LoginPage />);

    fillValidLogin();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await act(async () => undefined);
    expect(screen.getByRole("status")).toHaveTextContent("เข้าสู่ระบบสำเร็จ");
    expect(screen.getByRole("status")).toHaveTextContent("กำลังพาคุณไปยังพื้นที่เรียน...");
    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(649));
    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(replace).toHaveBeenCalledWith("/home");
    vi.useRealTimers();
  });

  it("does not submit again or redirect after unmount during the success window", async () => {
    vi.useFakeTimers();
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        message: AUTH_MESSAGES.loginSuccess,
        ok: true,
        session: {
          mode: "http-only-cookie",
          storesTokenInClient: false,
          user: { email: "student@example.com", role: "user" }
        }
      })
    );
    const { unmount } = render(<LoginPage />);

    fillValidLogin();
    const submit = screen.getByRole("button", { name: "เข้าสู่ระบบ" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await act(async () => undefined);

    expect(fetcher).toHaveBeenCalledTimes(1);
    unmount();
    act(() => vi.advanceTimersByTime(650));
    expect(replace).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
