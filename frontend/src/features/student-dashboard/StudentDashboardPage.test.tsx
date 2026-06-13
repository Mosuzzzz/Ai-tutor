import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentDashboardPage } from "./StudentDashboardPage";
import { studentDashboardMock } from "./mockData";

describe("StudentDashboardPage", () => {
  it("renders the API-ready Thai student dashboard without exposing endpoint details", () => {
    render(<StudentDashboardPage />);

    const dashboard = screen.getByTestId("student-dashboard");
    expect(dashboard).toHaveAttribute("data-source", "api-ready-mock");
    expect(dashboard).not.toHaveAttribute("data-api-endpoint");
    expect(screen.getByRole("heading", { level: 2, name: "แดชบอร์ดผู้เรียน" })).toBeInTheDocument();
    expect(screen.getByText("ยินดีต้อนรับกลับมา ศิวกร")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders loading and error states explicitly", () => {
    const { rerender } = render(<StudentDashboardPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดแดชบอร์ดผู้เรียน");

    rerender(<StudentDashboardPage errorMessage="ไม่สามารถโหลดข้อมูลผู้เรียนได้" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดข้อมูลผู้เรียนได้");
  });

  it("renders an API empty state without exposing endpoint details", () => {
    render(
      <StudentDashboardPage
        dashboard={{
          ...studentDashboardMock,
          apiResponse: {
            average_score: 0,
            completed_quizzes: 0,
            read_documents_count: 0,
            recent_scores: [],
            score_trend: [],
            streak_days: 0
          },
          assistantPrompts: [],
          continueLearning: []
        }}
        dataSource="api"
        status="empty"
      />
    );

    const dashboard = screen.getByTestId("student-dashboard");
    expect(dashboard).toHaveAttribute("data-source", "api");
    expect(dashboard).not.toHaveAttribute("data-api-endpoint");
    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีข้อมูลการเรียน");
    expect(screen.getByTestId("dashboard-hero")).toHaveAttribute("data-dashboard-surface", "student");
    expect(screen.getAllByTestId("dashboard-metric-card")).toHaveLength(4);
    expect(screen.getByText("พื้นที่เรียนรู้จะเติมข้อมูลเองหลังเริ่มใช้งาน")).toBeInTheDocument();
  });

  it("renders first-run onboarding actions in the empty state", () => {
    render(
      <StudentDashboardPage
        dashboard={{
          ...studentDashboardMock,
          apiResponse: {
            average_score: 0,
            completed_quizzes: 0,
            read_documents_count: 0,
            recent_scores: [],
            score_trend: [],
            streak_days: 0
          },
          assistantPrompts: [],
          continueLearning: []
        }}
        dataSource="api"
        status="empty"
      />
    );

    expect(screen.getByRole("link", { name: /อัปโหลดเอกสารแรก/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /สร้างควิซฝึกซ้อม/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: /ดูสถิติหลังทำควิซ/ })).toHaveAttribute("href", "/analytics");
    expect(screen.getByRole("link", { name: /เปิดหน้าแชต AI/ })).toHaveAttribute("href", "/chat");
  });

  it("uses the shared premium dashboard visual language", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByTestId("dashboard-hero")).toHaveAttribute("data-dashboard-surface", "student");
    expect(screen.getAllByTestId("dashboard-metric-card")).toHaveLength(4);
    expect(screen.getByText("พื้นที่เรียนรู้ส่วนตัว")).toBeInTheDocument();
  });

  it("renders AI prompt and hero quick action links", () => {
    render(<StudentDashboardPage />);

    expect(screen.getByRole("link", { name: /เรียนต่อ/ })).toHaveAttribute("href", "/courses");
    expect(screen.getByRole("link", { name: /ถาม AI Tutor/ })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: /อธิบายหัวข้อที่ยังอ่อน/ })).toHaveAttribute("href", "/chat");
    expect(screen.getByRole("link", { name: /สร้างควิซเฉพาะจุด/ })).toHaveAttribute("href", "/quiz");
  });

  it("renders continue learning items with accessible progress bars", () => {
    render(<StudentDashboardPage />);

    const section = screen.getByRole("region", { name: "เรียนต่อจากเดิม" });
    expect(within(section).getByText("ทบทวนเวกเตอร์แคลคูลัส")).toBeInTheDocument();
    expect(
      within(section).getByRole("progressbar", {
        name: "ทบทวนเวกเตอร์แคลคูลัส ความคืบหน้า 68%"
      })
    ).toHaveAttribute("aria-valuenow", "68");
  });

  it("renders top recent scores and score trend accessibly", () => {
    render(<StudentDashboardPage dashboard={studentDashboardMock} />);

    const scores = screen.getByRole("region", { name: "คะแนนล่าสุด" });
    expect(within(scores).getByText("สรุปเวกเตอร์แคลคูลัส.pdf")).toBeInTheDocument();
    expect(within(scores).getByText("ยอดเยี่ยม")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "แนวโน้มคะแนนเฉลี่ย 7 วันล่าสุด" })).toBeInTheDocument();
  });
});
