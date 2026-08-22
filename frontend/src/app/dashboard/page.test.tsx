import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/types";
import DashboardPage from "../(app)/dashboard/page";

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

describe("dashboard page", () => {
  beforeEach(() => {
    requirePageSession.mockReset();
    requirePageSession.mockResolvedValue(studySession);
    loadStudyDashboardForSession.mockReset();
    loadStudyDashboardForSession.mockResolvedValue({
      dashboard: {
        availability: { analytics: "available", documents: "available" },
        continuation: {
          description: "สรุปพร้อมแล้ว",
          kind: "ready-summary",
          primaryAction: { ariaLabel: "เปิดเอกสารล่าสุด", href: "/documents/file-1", label: "เปิดเอกสาร" },
          secondaryActions: [],
          statusLabel: "พร้อมใช้กับ AI",
          title: "คู่มือเรียน.pdf"
        },
        displayName: "Student One",
        generatedAt: "2026-06-05T10:00:00.000Z",
        generatedAtLabel: "5 มิ.ย. 2569 10:00",
        greeting: "กลับมาเรียนต่อกันเถอะ, Student One",
        hasDocuments: true,
        intro: "เลือกสิ่งที่ควรเรียนต่อ",
        progressMetrics: [],
        recentDocuments: [],
        recentReviews: [],
        sectionIssues: []
      },
      status: "ready"
    });
  });

  it("renders the protected API-ready study dashboard", async () => {
    render(await DashboardPage());

    expect(requirePageSession).toHaveBeenCalledWith("/dashboard");
    expect(loadStudyDashboardForSession).toHaveBeenCalledWith({ session: studySession });
    expect(screen.getByTestId("study-dashboard")).toHaveTextContent("Welcome back, Student One");
    expect(screen.getByTestId("study-dashboard")).toHaveAttribute("data-source", "api");
  });

  it("retains the dashboard error state inside the protected app shell", async () => {
    loadStudyDashboardForSession.mockResolvedValue({
      errorMessage: "ไม่สามารถโหลดแดชบอร์ดได้",
      status: "error"
    });

    render(await DashboardPage());

    expect(requirePageSession).toHaveBeenCalledWith("/dashboard");
    expect(screen.getByRole("alert")).toHaveTextContent("The Dashboard is unavailable right now.");
  });
});
