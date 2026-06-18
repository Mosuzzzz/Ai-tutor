import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { toStudyDashboardViewModel } from "./studyDashboardMapper";
import { StudyDashboardPage } from "./StudyDashboardPage";

const session = {
  mode: "http-only-cookie" as const,
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
    role: "user" as const
  }
};

const emptyDashboard = toStudyDashboardViewModel({
  response: {
    average_score: 0,
    completed_quizzes: 0,
    read_documents_count: 0,
    recent_scores: [],
    score_trend: [],
    streak_days: 0
  },
  session,
  timestamp: new Date("2026-06-05T10:00:00.000Z")
});

const readyDashboard = toStudyDashboardViewModel({
  response: {
    average_score: 86,
    completed_quizzes: 3,
    read_documents_count: 5,
    recent_scores: [
      {
        exam_id: "exam-1",
        filename: "คู่มือความปลอดภัยห้องปฏิบัติการ.pdf",
        id: "score-1",
        score: 92,
        submitted_at: "2026-06-05T10:00:00.000Z"
      }
    ],
    score_trend: [
      {
        average_score: 88,
        date: "2026-06-05"
      }
    ],
    streak_days: 2
  },
  session,
  timestamp: new Date("2026-06-05T10:00:00.000Z")
});

describe("StudyDashboardPage", () => {
  it("renders a single-user empty dashboard with clear onboarding actions", () => {
    render(<StudyDashboardPage dashboard={emptyDashboard} dataSource="api" status="empty" />);

    const dashboard = screen.getByTestId("study-dashboard");
    expect(dashboard).toHaveAttribute("data-source", "api");
    expect(screen.getByRole("heading", { level: 1, name: "ยังไม่มีข้อมูลการเรียน" })).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูลการเรียน")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /อัปโหลดเอกสารแรก/ })).toHaveAttribute("href", "/documents");
    expect(screen.getByRole("link", { name: /สร้างควิซทบทวน/ })).toHaveAttribute("href", "/quiz");
    expect(screen.getByRole("link", { name: /ดูสถิติการทบทวน/ })).toHaveAttribute("href", "/analytics");
    expect(dashboard).not.toHaveTextContent("แดชบอร์ดผู้เรียน");
    expect(dashboard).not.toHaveTextContent("แดชบอร์ดครู");
  });

  it("renders real dashboard metrics without mock learning items", () => {
    render(<StudyDashboardPage dashboard={readyDashboard} dataSource="api" status="ready" />);

    expect(screen.getByTestId("study-dashboard")).toHaveTextContent("แผนทบทวนของคุณพร้อมแล้ว");
    expect(screen.getByText("เอกสารพร้อมอ่าน")).toBeInTheDocument();
    expect(screen.getByText("ควิซที่ทำแล้ว")).toBeInTheDocument();
    expect(screen.getByText("สตรีกการทบทวน")).toBeInTheDocument();
    expect(screen.getByText("หัวข้อที่ควรทบทวน")).toBeInTheDocument();
    expect(screen.getByText("คู่มือความปลอดภัยห้องปฏิบัติการ.pdf")).toBeInTheDocument();
    expect(screen.queryByText("เรียนต่อจากเดิม")).not.toBeInTheDocument();
  });

  it("renders loading and error states with safe Thai copy", () => {
    const { rerender } = render(<StudyDashboardPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดแดชบอร์ดของฉัน");

    rerender(<StudyDashboardPage errorMessage="ไม่สามารถโหลดแดชบอร์ดได้" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแดชบอร์ดได้");
  });
});
