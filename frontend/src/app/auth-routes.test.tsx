import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import LoginRoute from "./login/page";
import RegisterRoute from "./register/page";

describe("auth routes", () => {
  it("renders the login route", () => {
    render(<LoginRoute />);

    expect(screen.getByRole("main")).toHaveTextContent("เข้าสู่ระบบเพื่อดำเนินการต่อ");
    expect(screen.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register");
  });

  it("renders the register route", () => {
    render(<RegisterRoute />);

    expect(screen.getByRole("main")).toHaveTextContent("เริ่มต้นการเรียนรู้ด้วยพลังของ AI");
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });
});
