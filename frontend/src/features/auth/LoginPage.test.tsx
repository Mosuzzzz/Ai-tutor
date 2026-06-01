import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
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

  it("shows validation errors before mock login succeeds", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(screen.getByText("กรุณากรอกอีเมล")).toBeInTheDocument();
    expect(screen.getByText("กรุณากรอกรหัสผ่าน")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("อีเมล"), {
      target: { value: "student@example.com" }
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "learning123" }
    });
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(await screen.findByText("เข้าสู่ระบบสำเร็จในโหมด mock")).toBeInTheDocument();
  });
});
