import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginRoute from "./login/page";
import RegisterRoute from "./register/page";

const redirectAuthenticatedRoute = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  redirectAuthenticatedRoute
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace
  })
}));

describe("auth routes", () => {
  beforeEach(() => {
    redirectAuthenticatedRoute.mockReset();
    redirectAuthenticatedRoute.mockResolvedValue(undefined);
    replace.mockReset();
  });

  it("renders the login route for guests after checking authenticated redirect rules", async () => {
    render(await LoginRoute());

    expect(screen.getByRole("main")).toHaveTextContent("เข้าสู่ระบบเพื่อดำเนินการต่อ");
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register");
    expect(redirectAuthenticatedRoute).toHaveBeenCalledTimes(1);
  });

  it("renders the register route for guests after checking authenticated redirect rules", async () => {
    render(await RegisterRoute());

    expect(screen.getByRole("main")).toHaveTextContent(
      "สร้างพื้นที่ของคุณสำหรับอัปโหลดเอกสาร สรุปบทเรียน ถาม AI และทำควิซทบทวน"
    );
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
    expect(redirectAuthenticatedRoute).toHaveBeenCalledTimes(1);
  });
});
