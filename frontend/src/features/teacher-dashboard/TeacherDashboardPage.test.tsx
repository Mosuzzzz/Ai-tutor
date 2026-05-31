import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeacherDashboardPage } from "./TeacherDashboardPage";

describe("TeacherDashboardPage", () => {
  it("renders a Thai teacher dashboard with API-ready mock data", () => {
    render(<TeacherDashboardPage />);

    expect(screen.getByTestId("teacher-dashboard")).toHaveAttribute("data-source", "api-ready-mock");
    expect(screen.getByRole("heading", { level: 2, name: "แดชบอร์ดครู" })).toBeInTheDocument();
    expect(screen.getByText("สวัสดีครับ ครูเมย์")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("renders class progress and quiz status summaries", () => {
    render(<TeacherDashboardPage />);

    const classes = screen.getByRole("region", { name: "ภาพรวมห้องเรียน" });
    expect(within(classes).getByText("วิทยาศาสตร์ข้อมูล ม.5")).toBeInTheDocument();
    expect(within(classes).getByRole("progressbar", { name: "วิทยาศาสตร์ข้อมูล ม.5 ทำสำเร็จ 76%" })).toBeInTheDocument();

    const quizzes = screen.getByRole("region", { name: "ควิซล่าสุด" });
    expect(within(quizzes).getByText("ควิซเวกเตอร์แคลคูลัส")).toBeInTheDocument();
    expect(within(quizzes).getByText("เผยแพร่แล้ว")).toBeInTheDocument();
    expect(within(quizzes).getByText("แบบร่าง")).toBeInTheDocument();
  });

  it("renders recent activity and teacher action links", () => {
    render(<TeacherDashboardPage />);

    expect(screen.getByRole("region", { name: "กิจกรรมล่าสุด" })).toHaveTextContent("นักเรียนส่งควิซล่าสุด");
    expect(screen.getByRole("link", { name: /สร้างควิซใหม่/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: /ดูสรุปเอกสาร/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /เปิดสถิติการเรียน/ })).toHaveAttribute("href", "/analytics");
  });
});
