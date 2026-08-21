import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";
import type { AuthSession } from "../auth/types";

const routerRefresh = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());
let pathname = "/documents/summary-1";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: routerRefresh, replace: routerReplace })
}));

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: init.status ?? 200
  });

const learnerSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "ชื่อผู้เรียนที่ยาวมากเพื่อทดสอบพื้นที่บัญชี",
    email: "a-very-long-learning-account@example.com",
    role: "user"
  }
};

describe("AppShell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerRefresh.mockReset();
    routerReplace.mockReset();
    pathname = "/documents/summary-1";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders landmarks and preserves nested active navigation", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.getByRole("link", { name: "ข้ามไปยังเนื้อหาหลัก" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("complementary", { name: "แถบนำทางหลัก" })).toBeInTheDocument();
    expect(screen.getByRole("banner", { name: "แถบบนของแอป" })).toBeInTheDocument();
    expect(screen.getByRole("main", { name: "พื้นที่เนื้อหาหลัก" })).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("link", { name: /เอกสารของฉัน/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).not.toHaveAttribute("aria-current");
  });

  it("uses the approved wordmark and renders only approved navigation", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    expect(screen.getAllByRole("img", { name: "AI Tutor" })[0]).toHaveAttribute("src", expect.stringContaining("ai-tutor-wordmark-green.png"));
    expect(screen.getByRole("link", { name: /^แดชบอร์ด$/ })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /เอกสารของฉัน/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /แชทกับเอกสาร/ })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: /ควิซทบทวน/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: /สถิติการทบทวน/ })).toHaveAttribute("href", "/analytics");
    expect(screen.getByRole("link", { name: /การตั้งค่า/ })).toHaveAttribute("href", "/settings");
    expect(screen.queryByRole("link", { name: /คอร์สเรียน/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "เริ่มจากเอกสาร" })).not.toBeInTheDocument();
  });

  it("shows a contextual non-heading label and no unsupported topbar controls", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);

    const topbar = screen.getByRole("banner", { name: "แถบบนของแอป" });
    expect(within(topbar).getByText("เอกสารของฉัน")).toBeInTheDocument();
    expect(within(topbar).queryByRole("heading")).not.toBeInTheDocument();
    expect(within(topbar).queryByRole("searchbox")).not.toBeInTheDocument();
    expect(within(topbar).queryByRole("button", { name: "การแจ้งเตือน" })).not.toBeInTheDocument();
    expect(within(topbar).queryByRole("button", { name: "ช่วยเหลือ" })).not.toBeInTheDocument();
  });

  it("keeps identity, Settings, and Logout in the desktop account menu", () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: /เปิดเมนูบัญชี/ }));

    const menu = screen.getByRole("menu", { name: "เมนูบัญชี" });
    expect(menu).toHaveTextContent(learnerSession.user.displayName ?? "");
    expect(menu).toHaveTextContent(learnerSession.user.email);
    expect(within(menu).getByRole("menuitem", { name: "การตั้งค่า" })).toHaveAttribute("href", "/settings");
    expect(within(menu).getByRole("menuitem", { name: "ออกจากระบบ" })).toBeInTheDocument();
  });

  it("locks body scroll and restores focus after Escape", async () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    const menuButton = screen.getByRole("button", { name: "เปิดเมนู" });
    menuButton.focus();
    fireEvent.click(menuButton);

    expect(screen.getByRole("dialog", { name: "เมนูหลัก" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "ปิดเมนู" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "เมนูหลัก" })).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
    expect(menuButton).toHaveFocus();
  });

  it("traps focus and closes the mobile drawer after navigation", async () => {
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));
    const dialog = screen.getByRole("dialog", { name: "เมนูหลัก" });
    const closeButton = within(dialog).getByRole("button", { name: "ปิดเมนู" });
    const logoutButton = within(dialog).getByRole("button", { name: "ออกจากระบบ" });

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(logoutButton).toHaveFocus();
    const dashboardLink = within(dialog).getByRole("link", { name: /^แดชบอร์ด$/ });
    dashboardLink.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(dashboardLink);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "เมนูหลัก" })).not.toBeInTheDocument());
  });

  it("cleans up body scroll locking when the shell unmounts", () => {
    const { unmount } = render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the mobile drawer immediately for reduced-motion users", () => {
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)"
    })));
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: "เปิดเมนู" }));

    fireEvent.click(screen.getByRole("button", { name: "ปิดเมนู" }));

    expect(screen.queryByRole("dialog", { name: "เมนูหลัก" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes and cleans up the mobile drawer when the viewport reaches desktop", () => {
    let desktopChangeListener: ((event: { matches: boolean }) => void) | undefined;
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      addEventListener: (_event: string, listener: (event: { matches: boolean }) => void) => {
        if (query === "(min-width: 1024px)") desktopChangeListener = listener;
      },
      matches: false,
      removeEventListener: vi.fn()
    })));
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    const menuButton = screen.getByRole("button", { name: "เปิดเมนู" });
    menuButton.focus();
    fireEvent.click(menuButton);
    expect(document.body.style.overflow).toBe("hidden");

    act(() => desktopChangeListener?.({ matches: true }));

    expect(screen.queryByRole("dialog", { name: "เมนูหลัก" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(menuButton).toHaveFocus();
  });

  it("logs out through the same-origin BFF and redirects to /login", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "ออกจากระบบสำเร็จ", ok: true }));
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: /เปิดเมนูบัญชี/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "ออกจากระบบ" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ credentials: "same-origin", method: "POST" })));
    expect(routerReplace).toHaveBeenCalledWith("/login");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });

  it("keeps the user in place and announces a safe logout failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "ไม่สามารถออกจากระบบได้ในขณะนี้", ok: false }, { status: 503 }));
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: /เปิดเมนูบัญชี/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "ออกจากระบบ" }));

    expect(await screen.findByRole("status")).toHaveTextContent("ไม่สามารถออกจากระบบได้ในขณะนี้");
    expect(routerReplace).not.toHaveBeenCalled();
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  it("prevents repeated logout submissions while the request is pending", async () => {
    let resolveLogout: ((response: Response) => void) | undefined;
    const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveLogout = resolve;
      })
    );
    render(<AppShell session={learnerSession}><p>Route content</p></AppShell>);
    fireEvent.click(screen.getByRole("button", { name: /เปิดเมนูบัญชี/ }));
    const logoutButton = screen.getByRole("menuitem", { name: "ออกจากระบบ" });

    fireEvent.click(logoutButton);
    fireEvent.click(logoutButton);

    expect(logoutButton).toBeDisabled();
    expect(fetcher).toHaveBeenCalledTimes(1);
    resolveLogout?.(jsonResponse({ message: "ออกจากระบบสำเร็จ", ok: true }));
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/login"));
  });
});
