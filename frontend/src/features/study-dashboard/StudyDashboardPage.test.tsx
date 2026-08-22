import { render as rtlRender, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { ProductLanguageProvider } from "../product-navigation/ProductLanguageContext.client";
import type { StudyDashboardResponse } from "./studyDashboardContract";
import { toStudyDashboardViewModel } from "./studyDashboardMapper";
import { StudyDashboardPage } from "./StudyDashboardPage";

const session = {
  mode: "http-only-cookie" as const,
  storesTokenInClient: false,
  user: { displayName: "Siwakorn bundi", email: "siwakorn@example.com", role: "user" as const }
} satisfies AuthSession;

const analytics: StudyDashboardResponse = {
  average_score: 86,
  completed_quizzes: 3,
  read_documents_count: 99,
  recent_scores: [
    { exam_id: "exam 1/ไทย", filename: "ควิซล่าสุด.pdf", id: "score-1", score: 92, submitted_at: "2026-06-05T10:00:00.000Z" }
  ],
  score_trend: [
    { average_score: 72, date: "2026-06-03" },
    { average_score: 84, date: "2026-06-04" },
    { average_score: 90, date: "2026-06-05" }
  ],
  streak_days: 40
};

const documents: DocumentLibraryResponse = {
  documents: [
    {
      created_at: "2026-06-05T09:00:00.000Z",
      filename: "คู่มือความปลอดภัยห้องปฏิบัติการฉบับชื่อยาวมากสำหรับทดสอบการแสดงผล.pdf",
      id: "file ready/หนึ่ง",
      related_exams_count: 2,
      status: "ready",
      summary_available: true,
      summary_markdown: "# ต้องไม่แสดง"
    }
  ],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 1 },
  total_documents: 1
};

const emptyAnalytics: StudyDashboardResponse = {
  average_score: 0,
  completed_quizzes: 0,
  read_documents_count: 0,
  recent_scores: [],
  score_trend: [],
  streak_days: 0
};

const emptyDocuments: DocumentLibraryResponse = {
  documents: [],
  status_counts: { error: 0, pending: 0, processing: 0, ready: 0 },
  total_documents: 0
};

const renderDashboard = (element: ReactElement) => rtlRender(
  <ProductLanguageProvider language="th">{element}</ProductLanguageProvider>
);

describe("StudyDashboardPage", () => {
  it("renders the approved reading order with truthful contextual links", () => {
    const dashboard = toStudyDashboardViewModel({ analytics, documents, session });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="ready" />);

    const page = screen.getByTestId("study-dashboard");
    const studyFocus = screen.getByTestId("dashboard-study-focus");
    expect(page).toHaveAttribute("data-source", "api");
    expect(within(page).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(studyFocus).getByRole("heading", { level: 1 })).toHaveTextContent(/กลับมาเรียนต่อกันเถอะ/);
    expect(within(studyFocus).getByRole("heading", { level: 2, name: "เรียนอะไรต่อดี" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /กลับมาเรียนต่อกันเถอะ/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "เรียนอะไรต่อดี" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "เอกสารล่าสุด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "ภาพรวมการเรียน" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "แนวโน้มคะแนนควิซ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "การทบทวนล่าสุด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "ทำอะไรต่อได้บ้าง" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /แนวโน้มคะแนนควิซจาก 3 จุดข้อมูล: 72%, 84%, 90%/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /เปิดเอกสาร คู่มือความปลอดภัย/ })).toHaveAttribute(
      "href",
      "/documents/file%20ready%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"
    );
    expect(screen.getByRole("link", { name: /ถามจากเอกสาร คู่มือความปลอดภัย/ })).toHaveAttribute(
      "href",
      "/chat?documentId=file+ready%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"
    );
    expect(screen.getByRole("link", { name: /ดูผลควิซ ควิซล่าสุด/ })).toHaveAttribute(
      "href",
      "/quiz?examId=exam+1%2F%E0%B9%84%E0%B8%97%E0%B8%A2"
    );
    expect(page).not.toHaveTextContent("ต้องไม่แสดง");
    expect(page).not.toHaveTextContent(/สตรีก|ชั่วโมง|XP|คำแนะนำจาก AI|กำหนดทบทวน/);
    expect(page.querySelectorAll("a a, a button, button a, button button")).toHaveLength(0);
  });

  it("keeps the Thai greeting lead together and exposes the display name as the wrap boundary", () => {
    const dashboard = toStudyDashboardViewModel({ analytics, documents, session });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="ready" />);

    const heading = screen.getByRole("heading", { level: 1 });
    const lead = within(heading).getByTestId("dashboard-greeting-lead");
    const name = within(heading).getByTestId("dashboard-greeting-name");
    expect(heading).toHaveTextContent("กลับมาเรียนต่อกันเถอะ, Siwakorn bundi");
    expect(lead).toHaveTextContent("กลับมาเรียนต่อกันเถอะ,");
    expect(name).toHaveTextContent("Siwakorn bundi");
    expect(Array.from(heading.children).some((child) => child.textContent === "เถอะ,")).toBe(false);
  });

  it("renders every core section and compact guidance in the first-use state", () => {
    const dashboard = toStudyDashboardViewModel({ analytics: emptyAnalytics, documents: emptyDocuments, session });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="empty" />);

    expect(screen.getByTestId("dashboard-study-focus")).toContainElement(
      screen.getByRole("heading", { level: 2, name: "เริ่มจากเอกสารของคุณ" })
    );
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "เริ่มจากเอกสารของคุณ" })).toBeInTheDocument();
    expect(screen.getByText("อัปโหลดเอกสารเพื่อให้ AI Tutor เตรียมสรุป แชท และควิซ")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "ไปที่เอกสารของฉัน" })[0]).toHaveAttribute("href", "/documents");
    const steps = screen.getByRole("list", { name: "ขั้นตอนเริ่มต้นใช้งาน AI Tutor" });
    expect(within(steps).getAllByRole("listitem")).toHaveLength(3);
    expect(steps).toHaveTextContent("อัปโหลดเอกสาร");
    expect(steps).toHaveTextContent("รอ AI เตรียมเนื้อหา");
    expect(steps).toHaveTextContent("เริ่มสรุป แชท และควิซ");
    expect(screen.getByRole("heading", { level: 2, name: "ภาพรวมการเรียน" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "แนวโน้มคะแนนควิซ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "เอกสารล่าสุด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "การทบทวนล่าสุด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "ทำอะไรต่อได้บ้าง" })).toBeInTheDocument();
    expect(screen.getByText("ข้อมูลจะเริ่มปรากฏหลังจากคุณอัปโหลดเอกสารและทำควิซ")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีข้อมูลมากพอสำหรับแสดงแนวโน้ม")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีเอกสารล่าสุด")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่มีประวัติการทบทวน")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /แชท|ควิซ/ })).not.toBeInTheDocument();
  });

  it("renders an empty score visualization instead of inventing a trend from one point", () => {
    const dashboard = toStudyDashboardViewModel({
      analytics: { ...emptyAnalytics, score_trend: [{ average_score: 88, date: "2026-06-05" }] },
      documents,
      session
    });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="ready" />);

    const activity = screen.getByRole("region", { name: "แนวโน้มคะแนนควิซ" });
    expect(within(activity).getByRole("status")).toHaveTextContent("ยังไม่มีข้อมูลมากพอสำหรับแสดงแนวโน้ม");
    expect(within(activity).queryByRole("img", { name: /จุดข้อมูล/ })).not.toBeInTheDocument();
  });

  it("defensively limits overview, recent documents, and recent reviews in presentation", () => {
    const base = toStudyDashboardViewModel({ analytics, documents, session });
    const dashboard = {
      ...base,
      progressMetrics: [
        ...base.progressMetrics,
        { helper: "ต้องไม่แสดง", id: "ready-documents" as const, label: "เกินขอบเขต", value: "99" }
      ],
      recentDocuments: Array.from({ length: 5 }, (_, index) => ({
        ...base.recentDocuments[0],
        filename: `เอกสารลำดับ ${index + 1}`,
        id: `document-${index + 1}`
      })),
      recentReviews: Array.from({ length: 4 }, (_, index) => ({
        ...base.recentReviews[0],
        filename: `ผลควิซลำดับ ${index + 1}`,
        id: `review-${index + 1}`
      }))
    };

    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="ready" />);

    const overview = screen.getByRole("region", { name: "ภาพรวมการเรียน" });
    const recentDocuments = screen.getByRole("region", { name: "เอกสารล่าสุด" });
    const recentReviews = screen.getByRole("region", { name: "การทบทวนล่าสุด" });
    expect(within(overview).getAllByRole("definition")).toHaveLength(3);
    expect(within(recentDocuments).getAllByRole("article")).toHaveLength(4);
    expect(within(recentDocuments).queryByText("เอกสารลำดับ 5")).not.toBeInTheDocument();
    expect(within(recentReviews).getAllByRole("article")).toHaveLength(3);
    expect(within(recentReviews).queryByText("ผลควิซลำดับ 4")).not.toBeInTheDocument();
  });

  it("omits the zero average metric when no quizzes are completed", () => {
    const dashboard = toStudyDashboardViewModel({ analytics: emptyAnalytics, documents, session });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="ready" />);

    expect(screen.getByText("เอกสารพร้อมใช้")).toBeInTheDocument();
    expect(screen.queryByText("คะแนนควิซเฉลี่ย")).not.toBeInTheDocument();
  });

  it.each([
    ["documents", "ยังไม่สามารถโหลดข้อมูลเอกสารได้ในขณะนี้"],
    ["analytics", "ยังไม่สามารถโหลดข้อมูลความคืบหน้าได้ในขณะนี้"]
  ] as const)("renders a quiet contextual %s partial failure with the useful source", (missing, copy) => {
    const dashboard = toStudyDashboardViewModel({
      ...(missing === "analytics" ? { documents } : { analytics }),
      session
    });
    renderDashboard(<StudyDashboardPage dashboard={dashboard} dataSource="api" status="partial" />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("status").some((notice) => notice.textContent?.includes(copy))).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("study-dashboard")).not.toHaveTextContent(/raw|HTTP|500/);
  });

  it("renders the safe full error with one semantic dashboard heading", () => {
    renderDashboard(<StudyDashboardPage errorMessage="ไม่สามารถโหลดแดชบอร์ดได้ในขณะนี้" status="error" />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent("ไม่สามารถโหลดแดชบอร์ดได้ในขณะนี้");
  });
});
