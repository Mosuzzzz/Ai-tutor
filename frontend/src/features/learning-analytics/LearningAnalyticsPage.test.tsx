import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LearningAnalyticsPage } from "./LearningAnalyticsPage";
import { learningAnalyticsMock } from "./learningAnalyticsData";
import type { LearningAnalyticsViewModel } from "./types";

const emptyAnalyticsMock: LearningAnalyticsViewModel = {
  ...learningAnalyticsMock,
  apiResponse: {
    ...learningAnalyticsMock.apiResponse,
    average_tenant_score: 0,
    department_stats: [],
    score_trend: [],
    skill_gaps: [],
    total_employees: 0,
    total_quizzes_taken: 0
  },
  activities: []
};

const partialEmptyAnalyticsMock: LearningAnalyticsViewModel = {
  ...learningAnalyticsMock,
  apiResponse: {
    ...learningAnalyticsMock.apiResponse,
    department_stats: [],
    skill_gaps: []
  },
  activities: []
};

const noTrendAnalyticsMock: LearningAnalyticsViewModel = {
  ...learningAnalyticsMock,
  apiResponse: {
    ...learningAnalyticsMock.apiResponse,
    score_trend: []
  }
};

const metricsOnlyAnalyticsMock: LearningAnalyticsViewModel = {
  ...learningAnalyticsMock,
  activities: [],
  apiResponse: {
    average_tenant_score: 0,
    department_stats: [],
    score_trend: [],
    skill_gaps: [],
    total_employees: 128,
    total_quizzes_taken: 34
  },
  workspaceName: "Global Admin"
};

describe("LearningAnalyticsPage", () => {
  it("renders an API-ready Thai learning analytics workspace", () => {
    render(<LearningAnalyticsPage />);

    const analytics = screen.getByTestId("learning-analytics");
    expect(analytics).toHaveAttribute("data-source", "api-ready-mock");
    expect(analytics).not.toHaveAttribute("data-api-endpoint");
    expect(screen.getByRole("heading", { name: "สถิติการเรียน" })).toBeInTheDocument();
    expect(screen.getByText("Learning Analytics Workspace")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();
    expect(screen.getAllByText("84%").length).toBeGreaterThan(0);
  });

  it("renders metric cards, score trend, skill radar, and activity table", () => {
    render(<LearningAnalyticsPage />);

    expect(screen.getByRole("img", { name: "แนวโน้มคะแนนเฉลี่ย 7 วันล่าสุด" })).toBeInTheDocument();
    const radar = screen.getByRole("region", { name: "เรดาร์ทักษะที่ควรทบทวน" });
    expect(radar).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "กิจกรรมการเรียนล่าสุด" })).toBeInTheDocument();
    expect(within(radar).getByText("เวกเตอร์และแรง")).toBeInTheDocument();
    expect(screen.getByText("สร้างควิซจากจุดอ่อน")).toHaveAttribute("href", "/quiz");
    expect(screen.getByText("ดูเอกสารที่เกี่ยวข้อง")).toHaveAttribute("href", "/documents");
  });

  it("sorts skill gaps by risk and exposes accessible progress bars", () => {
    render(<LearningAnalyticsPage />);

    const radar = screen.getByRole("region", { name: "เรดาร์ทักษะที่ควรทบทวน" });
    const skillCards = within(radar).getAllByRole("article");

    expect(skillCards[0]).toHaveAccessibleName("ทักษะ เวกเตอร์และแรง");
    expect(
      within(skillCards[0]).getByRole("progressbar", {
        name: "เวกเตอร์และแรง ความเสี่ยง 45%"
      })
    ).toHaveAttribute("aria-valuenow", "45");
    expect(within(skillCards[0]).getByText("ต้องเสริมพื้นฐาน")).toBeInTheDocument();
  });

  it("keeps analytics layout readable with long Thai content", () => {
    render(<LearningAnalyticsPage />);

    expect(screen.getByTestId("learning-analytics-grid")).toHaveClass(
      "items-start",
      "xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
    );
    expect(screen.getByTestId("learning-analytics-main-panel")).toHaveClass("min-w-0", "overflow-hidden");
    expect(screen.getByTestId("learning-analytics-side-panel")).toHaveClass("min-w-0", "overflow-hidden");
  });

  it("does not expose backend endpoint details or internal field names in the DOM", () => {
    render(<LearningAnalyticsPage />);

    expect(screen.queryByText("/api/analytics/trainer")).not.toBeInTheDocument();
    expect(screen.queryByText("/api/analytics/dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("tenant_id")).not.toBeInTheDocument();
    expect(screen.queryByText("user_id")).not.toBeInTheDocument();
    expect(screen.getByTestId("learning-analytics")).not.toHaveAttribute("data-api-endpoint");
  });

  it("renders panel-level empty states for partially empty API lists", () => {
    const { rerender } = render(<LearningAnalyticsPage analytics={partialEmptyAnalyticsMock} />);

    expect(screen.getByTestId("learning-skill-gaps-empty")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("learning-activity-empty")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("learning-department-empty")).toHaveAttribute("role", "status");

    rerender(<LearningAnalyticsPage analytics={noTrendAnalyticsMock} />);

    expect(screen.getByTestId("learning-score-trend-empty")).toHaveAttribute("role", "status");
  });

  it("renders the dashboard shell when API data contains only aggregate metrics", () => {
    render(<LearningAnalyticsPage analytics={metricsOnlyAnalyticsMock} dataSource="api" />);

    expect(screen.getByTestId("learning-analytics")).toHaveAttribute("data-source", "api");
    expect(screen.getByTestId("learning-analytics-grid")).toBeInTheDocument();
    expect(screen.getByText("Global Admin")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByTestId("learning-score-trend-empty")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("learning-skill-gaps-empty")).toHaveAttribute("role", "status");
    expect(screen.getByTestId("learning-activity-empty")).toHaveAttribute("role", "status");
  });

  it("renders loading, error, and empty states with explicit accessible semantics", () => {
    const { rerender } = render(<LearningAnalyticsPage status="loading" />);

    expect(screen.getByRole("status")).toHaveTextContent("กำลังโหลดสถิติการเรียน");

    rerender(<LearningAnalyticsPage errorMessage="โหลดสถิติการเรียนไม่สำเร็จ" status="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("โหลดสถิติการเรียนไม่สำเร็จ");

    rerender(<LearningAnalyticsPage analytics={emptyAnalyticsMock} />);

    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่มีข้อมูลสถิติจากควิซ");
    expect(screen.queryByRole("table", { name: "กิจกรรมการเรียนล่าสุด" })).not.toBeInTheDocument();
  });
});
