import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegisterPage } from "./RegisterPage";

describe("RegisterPage", () => {
  it("renders role selection, account fields, terms, and route link", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("heading", { name: "สร้างบัญชีใหม่" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "นักเรียน" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "ผู้สอน" })).not.toBeChecked();
    expect(screen.getByLabelText("ชื่อ-นามสกุล")).toBeInTheDocument();
    expect(screen.getByLabelText("อีเมล")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("ยืนยันรหัสผ่าน")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
  });

  it("shows validation errors for mismatched passwords and missing terms", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
      target: { value: "นักเรียนทดลอง" }
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
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(screen.getByText("รหัสผ่านยืนยันไม่ตรงกัน")).toBeInTheDocument();
    expect(screen.getByText("กรุณายอมรับเงื่อนไขการใช้งาน")).toBeInTheDocument();
  });

  it("submits a valid teacher registration in mock mode", () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("radio", { name: "ผู้สอน" }));
    fireEvent.change(screen.getByLabelText("ชื่อ-นามสกุล"), {
      target: { value: "อาจารย์สมชาย ใจดี" }
    });
    fireEvent.change(screen.getByLabelText("อีเมล"), {
      target: { value: "teacher@example.com" }
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "secure-pass" }
    });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
      target: { value: "secure-pass" }
    });
    fireEvent.click(screen.getByLabelText("ฉันยอมรับข้อตกลงและเงื่อนไขการใช้งาน"));
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(screen.getByRole("status")).toHaveTextContent("สมัครสมาชิกสำเร็จในโหมด mock");
    expect(screen.getByText("เส้นทางผู้สอน")).toBeInTheDocument();
  });
});
