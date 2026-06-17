import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("renders the Stitch-inspired login form with safe mock social actions", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "AI Tutor" })).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "เข้าสู่ระบบ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Google ยังไม่เปิดใช้งาน" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Facebook ยังไม่เปิดใช้งาน" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register");
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
      expect(replace).toHaveBeenCalledWith("/");
    });
  });
});
