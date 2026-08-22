import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "../auth/types";
import { ProductNavigation } from "./ProductNavigation";

let pathname = "/home";
const routerRefresh = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh: routerRefresh, replace: routerReplace })
}));

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: { displayName: "Learner Name", email: "long-account@example.com", role: "user" }
};

const props = {
  language: "en" as const,
  onLanguageToggle: vi.fn(),
  onThemeToggle: vi.fn(),
  theme: "light" as const
};

describe("ProductNavigation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    pathname = "/home";
    routerRefresh.mockReset();
    routerReplace.mockReset();
    props.onLanguageToggle.mockReset();
    props.onThemeToggle.mockReset();
    document.body.style.overflow = "";
  });

  it("keeps anonymous Home marketing-only and authenticated Home product-only", () => {
    const { rerender } = render(<ProductNavigation {...props} mode="marketing" session={null} />);
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "#how-it-works");
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();

    rerender(<ProductNavigation {...props} mode="product" session={session} />);
    [
      ["Dashboard", "/dashboard"], ["Documents", "/documents"], ["Chat", "/chat"],
      ["Quiz", "/quiz"], ["Analytics", "/analytics"]
    ].forEach(([name, href]) => expect(screen.getByRole("link", { name })).toHaveAttribute("href", href));
    expect(screen.queryByRole("link", { name: /How it works|My workspace/i })).not.toBeInTheDocument();
  });

  it("keeps all guest access controls truthful", () => {
    render(<ProductNavigation {...props} mode="marketing" session={null} />);

    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "#how-it-works");
    expect(screen.getByRole("link", { name: "Study kit" })).toHaveAttribute("href", "#study-kit");
    expect(screen.getByRole("link", { name: "Progress" })).toHaveAttribute("href", "#progress");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("aria-label", "Log in");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Start studying" })).toHaveAttribute("href", "/register");
  });

  it("localizes only the shared product chrome without changing route contracts", () => {
    render(<ProductNavigation {...props} language="th" mode="product" session={session} />);

    expect(screen.getByRole("link", { name: "แดชบอร์ด" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "เอกสารของฉัน" })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("button", { name: "ภาษา: TH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ธีม: Light" })).toBeInTheDocument();
  });

  it("delegates language and theme changes to the shared preference owner", () => {
    render(<ProductNavigation {...props} mode="marketing" session={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Language: EN" }));
    fireEvent.click(screen.getByRole("button", { name: "Theme: Light" }));

    expect(props.onLanguageToggle).toHaveBeenCalledTimes(1);
    expect(props.onThemeToggle).toHaveBeenCalledTimes(1);
  });

  it("uses a subtle nested active route and keeps Settings in the compact account menu", () => {
    pathname = "/documents/file-1";
    render(<ProductNavigation {...props} mode="product" session={session} />);
    expect(screen.getByRole("link", { name: "Documents" })).toHaveAttribute("aria-current", "page");
    const account = screen.getByRole("button", { name: /Open account menu Learner Name/ });
    expect(account).not.toHaveTextContent("long-account@example.com");
    fireEvent.click(account);
    expect(within(screen.getByRole("menu", { name: "Account menu" })).getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.queryByRole("link", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("closes the account menu with Escape and restores trigger focus", () => {
    render(<ProductNavigation {...props} mode="product" session={session} />);
    const trigger = screen.getByRole("button", { name: /Open account menu Learner Name/ });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes the account menu after an outside pointer interaction", () => {
    render(<ProductNavigation {...props} mode="product" session={session} />);
    fireEvent.click(screen.getByRole("button", { name: /Open account menu Learner Name/ }));
    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu", { name: "Account menu" })).not.toBeInTheDocument();
  });

  it("opens an accessible mobile dialog and restores body state on Escape", () => {
    render(<ProductNavigation {...props} mode="product" session={session} />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Product navigation" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Product navigation" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("traps focus, closes from the backdrop, and cleans body state on unmount", () => {
    const { unmount } = render(<ProductNavigation {...props} mode="product" session={session} />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Product navigation" });
    const firstLink = within(dialog).getByRole("link", { name: "AI Tutor home" });
    const logoutButton = within(dialog).getByRole("button", { name: "Log out" });
    firstLink.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(logoutButton).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Close navigation backdrop" }));
    expect(screen.queryByRole("dialog", { name: "Product navigation" })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the mobile dialog after a route change", () => {
    const { rerender } = render(<ProductNavigation {...props} mode="product" session={session} />);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    pathname = "/dashboard";
    rerender(<ProductNavigation {...props} mode="product" session={session} />);
    expect(screen.queryByRole("dialog", { name: "Product navigation" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes and restores focus when the full desktop navigation becomes available", () => {
    let desktopListener: ((event: { matches: boolean }) => void) | undefined;
    vi.stubGlobal("matchMedia", vi.fn((query: string) => ({
      addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
        if (query === "(min-width: 1200px)") desktopListener = listener;
      },
      matches: false,
      removeEventListener: vi.fn()
    })));
    render(<ProductNavigation {...props} mode="product" session={session} />);
    const trigger = screen.getByRole("button", { name: "Open navigation menu" });
    trigger.focus();
    fireEvent.click(trigger);

    act(() => desktopListener?.({ matches: true }));

    expect(screen.queryByRole("dialog", { name: "Product navigation" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("button", { name: "Language: EN" })).toHaveFocus();
  });

  it("never exposes a full email in the account trigger when displayName is missing", () => {
    const emailOnlySession = { ...session, user: { ...session.user, displayName: null } };
    render(<ProductNavigation {...props} mode="product" session={emailOnlySession} />);

    const account = screen.getByRole("button", { name: "Open account menu Account" });
    expect(account).not.toHaveTextContent(emailOnlySession.user.email);
    expect(account).not.toHaveAccessibleName(emailOnlySession.user.email);
    expect(account.getAttribute("aria-label")).not.toContain(emailOnlySession.user.email);
    fireEvent.click(account);
    expect(screen.getByRole("menu", { name: "Account menu" })).toHaveTextContent(emailOnlySession.user.email);
  });

  it("does not trust an email-shaped displayName for the compact trigger", () => {
    const emailNameSession = { ...session, user: { ...session.user, displayName: session.user.email } };
    render(<ProductNavigation {...props} mode="product" session={emailNameSession} />);

    const account = screen.getByRole("button", { name: "Open account menu Account" });
    expect(account.getAttribute("aria-label")).not.toContain(emailNameSession.user.email);
    expect(account).not.toHaveTextContent(emailNameSession.user.email);
  });

  it("preserves the Home logout destination", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "Logged out", ok: true }), {
        headers: { "content-type": "application/json" },
        status: 200
      })
    );
    render(<ProductNavigation {...props} logoutRedirect="/home" mode="product" session={session} />);
    fireEvent.click(screen.getByRole("button", { name: /Open account menu Learner Name/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    expect(routerReplace).toHaveBeenCalledWith("/home");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });
});
