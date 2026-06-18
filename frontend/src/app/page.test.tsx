import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import HomePage from "./page";

const studySession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Student One",
    email: "student@example.com",
    role: "user"
  }
};

const requirePageSession = vi.hoisted(() => vi.fn());
const loadStudyDashboardForSession = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/authGuard", () => ({
  requirePageSession
}));

vi.mock("@/features/study-dashboard/studyDashboardApi", () => ({
  loadStudyDashboardForSession
}));

describe("Study dashboard page", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studySession);
    loadStudyDashboardForSession.mockReset();
    loadStudyDashboardForSession.mockResolvedValue({
      dashboard: {
        apiResponse: {
          average_score: 88,
          completed_quizzes: 7,
          read_documents_count: 4,
          recent_scores: [],
          score_trend: [],
          streak_days: 3
        },
        generatedAtLabel: "5 มิ.ย. 2569 10:00",
        headline: "แผนทบทวนของคุณพร้อมแล้ว",
        metrics: [
          {
            helper: "จะเริ่มนับหลังอัปโหลดและประมวลผลเสร็จ",
            id: "ready-documents",
            label: "เอกสารพร้อมอ่าน",
            value: "4"
          },
          {
            helper: "คะแนนแรกจะปรากฏหลังส่งคำตอบ",
            id: "completed-quizzes",
            label: "ควิซที่ทำแล้ว",
            value: "7"
          }
        ],
        nextMilestone: "ต่อยอดด้วยควิซทบทวนชุดถัดไป",
        onboardingSteps: [],
        primaryAction: {
          description: "ให้ระบบสรุปและเตรียมเนื้อหา",
          href: "/documents",
          id: "upload-document",
          title: "อัปโหลดเอกสารแรก",
          tone: "primary"
        },
        secondaryActions: [],
        summary: "Student One มีเอกสาร 4 รายการและควิซ 7 ชุดในเส้นทางทบทวนล่าสุด",
        userName: "Student One"
      },
      status: "ready"
    });
  });

  it("renders the AI Tutor shell with the API-ready study dashboard", async () => {
    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(loadStudyDashboardForSession).toHaveBeenCalledWith({
      session: studySession
    });
    expect(screen.getAllByText("AI Tutor").length).toBeGreaterThan(0);
    expect(screen.getByRole("main")).toHaveTextContent("แดชบอร์ดของฉัน");
    expect(screen.getByRole("main")).toHaveTextContent("7");
    expect(screen.getByTestId("study-dashboard")).toHaveAttribute("data-source", "api");
  });

  it("renders dashboard error state inside the protected app shell", async () => {
    loadStudyDashboardForSession.mockResolvedValue({
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดได้",
      status: "error"
    });

    render(await HomePage());

    expect(requirePageSession).toHaveBeenCalledWith("/");
    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแดชบอร์ดได้");
  });
});
