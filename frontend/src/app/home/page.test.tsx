import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicHomePage from "./page";

const getServerAuthSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  getServerAuthSession
}));

describe("public Home page", () => {
  it("renders the temporary public Home content and auth links", () => {
    render(<PublicHomePage />);

    expect(getServerAuthSession).not.toHaveBeenCalled();
    expect(screen.getByRole("main")).toHaveTextContent("หน้า Home อยู่ระหว่างการออกแบบใหม่");
    expect(screen.getByRole("img", { name: "AI Tutor Learning Platform" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register");
  });
});
