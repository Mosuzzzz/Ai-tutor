import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeAccountMenu } from "./HomeAccountMenu";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, replace }) }));

const session = {
  mode: "http-only-cookie" as const,
  storesTokenInClient: false as const,
  user: { email: "a-very-long-learner-email@example.com", role: "user" as const }
};

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });

describe("HomeAccountMenu", () => {
  it("uses the full email in its accessible greeting and localizes the Thai greeting", () => {
    const { rerender } = render(<HomeAccountMenu language="en" session={session} />);
    expect(screen.getByRole("button", { name: "Hello! a-very-long-learner-email@example.com" })).toBeInTheDocument();

    rerender(<HomeAccountMenu language="th" session={session} />);
    expect(screen.getByRole("button", { name: "สวัสดี! a-very-long-learner-email@example.com" })).toBeInTheDocument();
  });

  it("opens only Logout, closes on outside click, and restores trigger focus on Escape", async () => {
    render(<HomeAccountMenu language="en" session={session} />);
    const trigger = screen.getByRole("button", { name: /Hello!/ });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toHaveTextContent("Log out");
    expect(screen.getByRole("menu").querySelectorAll("button")).toHaveLength(1);

    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("disables repeat logout, calls the BFF, returns home, and refreshes after success", async () => {
    let resolveLogout: (response: Response) => void = () => undefined;
    const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise<Response>((resolve) => { resolveLogout = resolve; }));
    render(<HomeAccountMenu language="en" session={session} />);
    fireEvent.click(screen.getByRole("button", { name: /Hello!/ }));
    const logoutButton = screen.getByRole("menuitem", { name: "Log out" });
    fireEvent.click(logoutButton);
    expect(logoutButton).toBeDisabled();
    fireEvent.click(logoutButton);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ credentials: "same-origin", method: "POST" })
    );

    resolveLogout(jsonResponse({ message: "Logged out", ok: true }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    expect(refresh).toHaveBeenCalled();
  });

  it("keeps the menu open and shows localized failure status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ message: "No", ok: false }));
    render(<HomeAccountMenu language="th" session={session} />);
    fireEvent.click(screen.getByRole("button", { name: /สวัสดี!/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "ออกจากระบบ" }));

    expect(await screen.findByRole("status")).toHaveTextContent("ไม่สามารถออกจากระบบได้ โปรดลองอีกครั้ง");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
