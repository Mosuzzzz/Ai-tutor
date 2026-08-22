import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import type { StudyDashboardResponse } from "./studyDashboardContract";
import { isStudyDashboardDataEmpty, toStudyDashboardViewModel } from "./studyDashboardMapper";

const session: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Siwakorn bundi",
    email: "siwakorn@example.com",
    role: "user"
  }
};

const analytics: StudyDashboardResponse = {
  average_score: 86.4,
  completed_quizzes: 4,
  read_documents_count: 99,
  recent_scores: [
    { exam_id: "exam-low", filename: "ล่าสุดคะแนนน้อย.pdf", id: "score-low", score: 55, submitted_at: "2026-06-05T10:00:00.000Z" },
    { exam_id: "exam high/1", filename: "เก่ากว่าคะแนนสูง.pdf", id: "score-high", score: 99, submitted_at: "2026-06-04T10:00:00.000Z" },
    { exam_id: "exam-mid", filename: "สาม.pdf", id: "score-mid", score: 80, submitted_at: "2026-06-03T10:00:00.000Z" },
    { exam_id: "exam-old", filename: "สี่.pdf", id: "score-old", score: 75, submitted_at: "2026-06-02T10:00:00.000Z" }
  ],
  score_trend: [{ average_score: 86.4, date: "2026-06-05" }],
  streak_days: 12
};

const documents: DocumentLibraryResponse = {
  documents: [
    {
      created_at: "2026-06-05T09:00:00.000Z",
      filename: "ล่าสุดแต่ล้มเหลว.pdf",
      id: "error-newest",
      related_exams_count: 0,
      status: "error",
      summary_available: false,
      summary_markdown: null
    },
    {
      created_at: "2026-06-04T09:00:00.000Z",
      filename: "กำลังประมวลผล.pdf",
      id: "processing-newer",
      related_exams_count: 0,
      status: "processing",
      summary_available: false,
      summary_markdown: null
    },
    {
      created_at: "2026-06-03T09:00:00.000Z",
      filename: "คู่มือพร้อมสรุป.pdf",
      id: "ready summary/หนึ่ง",
      related_exams_count: 2,
      status: "ready",
      summary_available: true,
      summary_markdown: "# เนื้อหาที่ไม่ควรส่งเข้า Dashboard"
    },
    {
      created_at: "2026-06-02T09:00:00.000Z",
      filename: "พร้อมแต่ยังไม่มีสรุป.pdf",
      id: "ready-no-summary",
      related_exams_count: 0,
      status: "ready",
      summary_available: false,
      summary_markdown: null
    },
    {
      created_at: "2026-06-01T09:00:00.000Z",
      filename: "เอกสารเก่า.pdf",
      id: "old-document",
      related_exams_count: 1,
      status: "ready",
      summary_available: true,
      summary_markdown: "old"
    }
  ],
  status_counts: { error: 1, pending: 0, processing: 1, ready: 3 },
  total_documents: 5
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

describe("study dashboard mapper", () => {
  it("maps the newest eligible ready summary into truthful contextual continuation actions", () => {
    const dashboard = toStudyDashboardViewModel({
      analytics,
      documents,
      session,
      timestamp: new Date("2026-06-05T10:00:00.000Z")
    });

    expect(dashboard.greeting).toBe("กลับมาเรียนต่อกันเถอะ, Siwakorn bundi");
    expect(dashboard.continuation).toMatchObject({
      kind: "ready-summary",
      primaryAction: { href: "/documents/ready%20summary%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87" },
      title: "คู่มือพร้อมสรุป.pdf"
    });
    expect(dashboard.continuation.secondaryActions.map((action) => action.href)).toEqual([
      "/chat?documentId=ready+summary%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87",
      "/quiz?documentId=ready+summary%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"
    ]);
    expect(JSON.stringify(dashboard)).not.toContain("เนื้อหาที่ไม่ควรส่งเข้า Dashboard");
  });

  it("uses a generic greeting instead of exposing email when displayName is missing", () => {
    const dashboard = toStudyDashboardViewModel({
      analytics: emptyAnalytics,
      documents: emptyDocuments,
      session: { ...session, user: { ...session.user, displayName: null } }
    });

    expect(dashboard.greeting).toBe("กลับมาเรียนต่อกันเถอะ");
    expect(dashboard.greeting).not.toContain("siwakorn@example.com");
  });

  it("gates AI actions for ready documents without a summary", () => {
    const onlyReadyWithoutSummary: DocumentLibraryResponse = {
      documents: [documents.documents[3]],
      status_counts: { error: 0, pending: 0, processing: 0, ready: 1 },
      total_documents: 1
    };

    const dashboard = toStudyDashboardViewModel({
      analytics: emptyAnalytics,
      documents: onlyReadyWithoutSummary,
      session
    });

    expect(dashboard.continuation).toMatchObject({
      kind: "ready-document",
      primaryAction: { href: "/documents/ready-no-summary" },
      statusLabel: "สรุปยังไม่พร้อม"
    });
    expect(dashboard.continuation.secondaryActions).toEqual([]);
    expect(JSON.stringify(dashboard.continuation)).not.toMatch(/\/chat|\/quiz/);
  });

  it.each([
    { expectedKind: "processing-document", expectedLabel: "รอประมวลผล", status: "pending" as const },
    { expectedKind: "processing-document", expectedLabel: "กำลังประมวลผล", status: "processing" as const },
    { expectedKind: "failed-document", expectedLabel: "ประมวลผลไม่สำเร็จ", status: "error" as const }
  ])("maps $status without fake progress, timing, or retry behavior", ({ expectedKind, expectedLabel, status }) => {
    const dashboard = toStudyDashboardViewModel({
      analytics: emptyAnalytics,
      documents: {
        documents: [{ ...documents.documents[0], id: `${status}-document`, status }],
        status_counts: {
          error: status === "error" ? 1 : 0,
          pending: status === "pending" ? 1 : 0,
          processing: status === "processing" ? 1 : 0,
          ready: 0
        },
        total_documents: 1
      },
      session
    });

    expect(dashboard.continuation.kind).toBe(expectedKind);
    expect(dashboard.continuation.statusLabel).toBe(expectedLabel);
    expect(dashboard.continuation.primaryAction.href).toBe("/documents");
    expect(dashboard.continuation.secondaryActions).toEqual([]);
    expect(JSON.stringify(dashboard.continuation)).not.toMatch(/%|นาที|retry|ลองอีกครั้ง/i);
  });

  it("keeps at most four latest-uploaded documents with one contextual action and no summary body", () => {
    const dashboard = toStudyDashboardViewModel({ analytics, documents, session });

    expect(dashboard.recentDocuments).toHaveLength(4);
    expect(dashboard.recentDocuments.map((document) => document.id)).toEqual([
      "error-newest",
      "processing-newer",
      "ready summary/หนึ่ง",
      "ready-no-summary"
    ]);
    expect(dashboard.recentDocuments[2]).toMatchObject({ relatedQuizCount: 2, statusLabel: "พร้อมใช้กับ AI" });
    dashboard.recentDocuments.forEach((document) => expect(document).toHaveProperty("action"));
    expect(JSON.stringify(dashboard.recentDocuments)).not.toContain("summary_markdown");
    expect(JSON.stringify(dashboard.recentDocuments)).not.toContain("เนื้อหาที่ไม่ควรส่งเข้า Dashboard");
  });

  it("keeps at most three genuinely recent reviews instead of ranking by score", () => {
    const dashboard = toStudyDashboardViewModel({ analytics, documents, session });

    expect(dashboard.recentReviews).toHaveLength(3);
    expect(dashboard.recentReviews.map((review) => review.id)).toEqual(["score-low", "score-high", "score-mid"]);
    expect(dashboard.recentReviews[0]).toMatchObject({ gradeLabel: "ควรทบทวน", scoreLabel: "55%" });
    expect(dashboard.recentReviews[1].href).toBe("/quiz?examId=exam+high%2F1");
  });

  it("builds at most three truthful metrics and omits zero averages and unsupported concepts", () => {
    const ready = toStudyDashboardViewModel({ analytics, documents, session });
    expect(ready.progressMetrics).toEqual([
      expect.objectContaining({ id: "ready-documents", label: "เอกสารพร้อมใช้", value: "3" }),
      expect.objectContaining({ id: "completed-quizzes", value: "4" }),
      expect.objectContaining({ id: "average-score", value: "86%" })
    ]);

    const noQuiz = toStudyDashboardViewModel({ analytics: emptyAnalytics, documents, session });
    expect(noQuiz.progressMetrics.map((metric) => metric.id)).toEqual(["ready-documents"]);
    expect(JSON.stringify(ready)).not.toMatch(/สตรีก|ชั่วโมง|XP|กำหนดทบทวน|คำแนะนำจาก AI/i);
  });

  it("maps the latest seven real score-trend points in chronological date order", () => {
    const dashboard = toStudyDashboardViewModel({
      analytics: {
        ...analytics,
        score_trend: [
          { average_score: 78, date: "2026-08-08" },
          { average_score: 71, date: "2026-08-01" },
          { average_score: 74, date: "2026-08-04" },
          { average_score: 76, date: "2026-08-06" },
          { average_score: 73, date: "2026-08-03" },
          { average_score: 77, date: "2026-08-07" },
          { average_score: 72, date: "2026-08-02" },
          { average_score: 75, date: "2026-08-05" }
        ]
      },
      documents,
      session
    });

    expect(dashboard.scoreTrend).toHaveLength(7);
    expect(dashboard.scoreTrend.map((point) => point.date)).toEqual([
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      "2026-08-05",
      "2026-08-06",
      "2026-08-07",
      "2026-08-08"
    ]);
    expect(dashboard.scoreTrend.map((point) => point.scoreLabel)).toEqual([
      "72%",
      "73%",
      "74%",
      "75%",
      "76%",
      "77%",
      "78%"
    ]);
  });

  it("builds only contextual supporting actions that are backed by available product state", () => {
    const ready = toStudyDashboardViewModel({ analytics, documents, session });
    expect(ready.nextActions.map((action) => [action.id, action.href])).toEqual([
      ["documents", "/documents"],
      ["quiz", "/quiz?documentId=ready+summary%2F%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"],
      ["analytics", "/analytics"]
    ]);

    const firstUse = toStudyDashboardViewModel({ analytics: emptyAnalytics, documents: emptyDocuments, session });
    expect(firstUse.nextActions.map((action) => [action.id, action.href])).toEqual([["documents", "/documents"]]);
  });

  it("maps empty and partial availability without inventing source data", () => {
    expect(isStudyDashboardDataEmpty({ analytics: emptyAnalytics, documents: emptyDocuments })).toBe(true);
    const dashboard = toStudyDashboardViewModel({ analytics, session });

    expect(dashboard.availability).toEqual({ analytics: "available", documents: "unavailable" });
    expect(dashboard.sectionIssues).toEqual([{
      id: "documents",
      message: "ยังไม่สามารถโหลดข้อมูลเอกสารได้ในขณะนี้"
    }]);
    expect(dashboard.continuation.kind).toBe("documents-unavailable");
  });
});
