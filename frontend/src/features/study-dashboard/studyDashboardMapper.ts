import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { buildDocumentDetailHref } from "../document-summary/documentSummaryHelpers";
import type { StudyDashboardResponse } from "./studyDashboardContract";
import { formatScore, getRecentScores, scoreToGrade } from "./studyDashboardHelpers";
import type {
  DashboardDocumentStatus,
  StudyDashboardAction,
  StudyDashboardContinuation,
  StudyDashboardMetric,
  StudyDashboardRecentDocument,
  StudyDashboardScoreTrendPoint,
  StudyDashboardSupportingAction,
  StudyDashboardViewModel
} from "./types";

type StudyDashboardViewModelInput = {
  analytics?: StudyDashboardResponse;
  documents?: DocumentLibraryResponse;
  session: AuthSession;
  timestamp?: Date;
};

type DashboardSources = Pick<StudyDashboardViewModelInput, "analytics" | "documents">;
type DocumentItem = DocumentLibraryResponse["documents"][number];

const STATUS_LABELS: Record<DashboardDocumentStatus, string> = {
  error: "ประมวลผลไม่สำเร็จ",
  pending: "รอประมวลผล",
  processing: "กำลังประมวลผล",
  ready: "พร้อมใช้กับ AI"
};

export const toStudyDashboardViewModel = ({
  analytics,
  documents,
  session,
  timestamp = new Date()
}: StudyDashboardViewModelInput): StudyDashboardViewModel => {
  const sortedDocuments = sortDocumentsByCreatedAt(documents?.documents ?? []);
  const displayName = session.user.displayName?.trim();
  const continuation = buildContinuation(documents, sortedDocuments);

  return {
    availability: {
      analytics: analytics ? "available" : "unavailable",
      documents: documents ? "available" : "unavailable"
    },
    continuation,
    displayName: displayName || null,
    generatedAt: timestamp.toISOString(),
    generatedAtLabel: formatGeneratedAt(timestamp),
    greeting: displayName ? `กลับมาเรียนต่อกันเถอะ, ${displayName}` : "กลับมาเรียนต่อกันเถอะ",
    hasDocuments: Boolean(documents && documents.total_documents > 0),
    intro: "เลือกสิ่งที่ควรเรียนต่อ แล้วกลับเข้าสู่จังหวะการทบทวนของคุณ",
    nextActions: buildNextActions(analytics, continuation),
    progressMetrics: buildMetrics(analytics, documents),
    recentDocuments: buildRecentDocuments(sortedDocuments),
    recentReviews: analytics
      ? getRecentScores(analytics.recent_scores, 3).map((review) => ({
          ariaLabel: `ดูผลควิซ ${review.filename} คะแนน ${formatScore(review.score)}`,
          filename: review.filename,
          gradeLabel: scoreToGrade(review.score),
          href: buildQueryHref("/quiz", "examId", review.exam_id),
          id: review.id,
          score: review.score,
          scoreLabel: formatScore(review.score),
          submittedAt: review.submitted_at,
          submittedAtLabel: formatDateLabel(review.submitted_at, "ส่งเมื่อ")
        }))
      : [],
    scoreTrend: buildScoreTrend(analytics),
    sectionIssues: [
      ...(!documents
        ? [{ id: "documents" as const, message: "ยังไม่สามารถโหลดข้อมูลเอกสารได้ในขณะนี้" }]
        : []),
      ...(!analytics
        ? [{ id: "analytics" as const, message: "ยังไม่สามารถโหลดข้อมูลความคืบหน้าได้ในขณะนี้" }]
        : [])
    ]
  };
};

const buildScoreTrend = (analytics: StudyDashboardResponse | undefined): StudyDashboardScoreTrendPoint[] => {
  if (!analytics) return [];

  return [...analytics.score_trend]
    .filter((point) => !Number.isNaN(Date.parse(point.date)))
    .sort((first, second) => Date.parse(first.date) - Date.parse(second.date))
    .slice(-7)
    .map((point) => ({
      date: point.date,
      dateLabel: formatDateLabel(point.date, ""),
      score: point.average_score,
      scoreLabel: formatScore(point.average_score)
    }));
};

const buildNextActions = (
  analytics: StudyDashboardResponse | undefined,
  continuation: StudyDashboardContinuation
): StudyDashboardSupportingAction[] => {
  const actions: StudyDashboardSupportingAction[] = [
    {
      ariaLabel: "ไปที่เอกสารของฉันเพื่อจัดการเอกสาร",
      href: "/documents",
      id: "documents",
      label: "จัดการเอกสาร"
    }
  ];
  const quizAction = continuation.secondaryActions.find((action) => action.href.startsWith("/quiz?documentId="));

  if (quizAction) actions.push({ ...quizAction, id: "quiz" });
  if (analytics && (analytics.completed_quizzes > 0 || analytics.score_trend.length > 0)) {
    actions.push({ ariaLabel: "ดูสถิติการทบทวนทั้งหมด", href: "/analytics", id: "analytics", label: "ดูสถิติทั้งหมด" });
  }

  return actions.slice(0, 3);
};

export const isStudyDashboardDataEmpty = ({ analytics, documents }: DashboardSources) => {
  if (!analytics || !documents) return false;

  return (
    documents.total_documents === 0 &&
    documents.documents.length === 0 &&
    analytics.completed_quizzes === 0 &&
    analytics.recent_scores.length === 0 &&
    analytics.score_trend.length === 0
  );
};

const buildContinuation = (
  documents: DocumentLibraryResponse | undefined,
  sortedDocuments: DocumentItem[]
): StudyDashboardContinuation => {
  if (!documents) {
    return {
      description: "เปิดพื้นที่เอกสารเพื่อดูและจัดการเนื้อหาการเรียนของคุณ",
      kind: "documents-unavailable",
      primaryAction: buildAction("ไปที่เอกสารของฉัน", "/documents", "ไปที่เอกสารของฉัน"),
      secondaryActions: [],
      title: "ข้อมูลเอกสารยังไม่พร้อม"
    };
  }

  const candidate =
    sortedDocuments.find((document) => document.status === "ready" && document.summary_available) ??
    sortedDocuments.find((document) => document.status === "ready") ??
    sortedDocuments.find((document) => document.status === "pending" || document.status === "processing") ??
    sortedDocuments.find((document) => document.status === "error");

  if (!candidate) {
    return {
      description: "อัปโหลดเอกสารเพื่อให้ AI Tutor เตรียมสรุป แชท และควิซ",
      kind: "first-document",
      primaryAction: buildAction("ไปที่เอกสารของฉัน", "/documents", "ไปที่เอกสารของฉัน"),
      secondaryActions: [],
      title: "เริ่มจากเอกสารของคุณ"
    };
  }

  const uploadedAtLabel = formatDateLabel(candidate.created_at, "อัปโหลด");

  if (candidate.status === "ready" && candidate.summary_available) {
    return {
      description: "สรุปพร้อมแล้ว คุณสามารถเปิดเอกสารหรือทบทวนต่อด้วยแชทและควิซ",
      kind: "ready-summary",
      primaryAction: buildAction(
        "เปิดเอกสาร",
        buildDocumentDetailHref(candidate.id),
        `เปิดเอกสาร ${candidate.filename}`
      ),
      secondaryActions: [
        buildAction("ถามจากเอกสาร", buildQueryHref("/chat", "documentId", candidate.id), `ถามจากเอกสาร ${candidate.filename}`),
        buildAction("ทำควิซ", buildQueryHref("/quiz", "documentId", candidate.id), `ทำควิซจากเอกสาร ${candidate.filename}`)
      ],
      statusLabel: STATUS_LABELS.ready,
      title: candidate.filename,
      uploadedAt: candidate.created_at,
      uploadedAtLabel
    };
  }

  if (candidate.status === "ready") {
    return {
      description: "เอกสารถูกประมวลผลแล้ว แต่เนื้อหาสำหรับการเรียนด้วย AI ยังไม่พร้อม",
      kind: "ready-document",
      primaryAction: buildAction(
        "เปิดเอกสาร",
        buildDocumentDetailHref(candidate.id),
        `เปิดเอกสาร ${candidate.filename}`
      ),
      secondaryActions: [],
      statusLabel: "สรุปยังไม่พร้อม",
      title: candidate.filename,
      uploadedAt: candidate.created_at,
      uploadedAtLabel
    };
  }

  const failed = candidate.status === "error";
  return {
    description: failed
      ? "ไปที่พื้นที่เอกสารเพื่อตรวจสอบไฟล์และเลือกขั้นตอนถัดไป"
      : "เอกสารนี้ยังไม่พร้อมสำหรับสรุป แชท หรือควิซ",
    kind: failed ? "failed-document" : "processing-document",
    primaryAction: buildAction("จัดการเอกสาร", "/documents", `จัดการเอกสาร ${candidate.filename}`),
    secondaryActions: [],
    documentStatus: candidate.status,
    statusLabel: STATUS_LABELS[candidate.status],
    title: candidate.filename,
    uploadedAt: candidate.created_at,
    uploadedAtLabel
  };
};

const buildRecentDocuments = (documents: DocumentItem[]): StudyDashboardRecentDocument[] =>
  documents.slice(0, 4).map((document) => {
    const readyWithSummary = document.status === "ready" && document.summary_available;
    const statusLabel = document.status === "ready" && !document.summary_available
      ? "สรุปยังไม่พร้อม"
      : STATUS_LABELS[document.status];
    const href = document.status === "ready" ? buildDocumentDetailHref(document.id) : "/documents";

    return {
      action: buildAction(
        readyWithSummary ? "เรียนต่อ" : document.status === "ready" ? "เปิดเอกสาร" : "จัดการเอกสาร",
        href,
        `${readyWithSummary ? "เรียนต่อจาก" : document.status === "ready" ? "เปิด" : "จัดการ"} ${document.filename}`
      ),
      filename: document.filename,
      id: document.id,
      ...(document.related_exams_count > 0 ? { relatedQuizCount: document.related_exams_count } : {}),
      summaryAvailable: document.summary_available,
      status: document.status,
      statusLabel,
      uploadedAt: document.created_at,
      uploadedAtLabel: formatDateLabel(document.created_at, "อัปโหลด")
    };
  });

const buildMetrics = (
  analytics: StudyDashboardResponse | undefined,
  documents: DocumentLibraryResponse | undefined
): StudyDashboardMetric[] => {
  const metrics: StudyDashboardMetric[] = [];

  if (documents && documents.total_documents > 0) {
    metrics.push({
      helper: "ประมวลผลเสร็จและพร้อมเปิดใช้งาน",
      id: "ready-documents",
      label: "เอกสารพร้อมใช้",
      value: String(documents.status_counts.ready)
    });
  }

  if (analytics && analytics.completed_quizzes > 0) {
    metrics.push(
      {
        helper: "ผลควิซที่ส่งคำตอบแล้ว",
        id: "completed-quizzes",
        label: "ควิซที่ทำเสร็จ",
        value: String(analytics.completed_quizzes)
      },
      {
        helper: "คำนวณจากควิซที่ทำเสร็จ",
        id: "average-score",
        label: "คะแนนควิซเฉลี่ย",
        value: formatScore(analytics.average_score)
      }
    );
  }

  return metrics.slice(0, 3);
};

const sortDocumentsByCreatedAt = (documents: DocumentItem[]) =>
  [...documents].sort((first, second) => getTimestamp(second.created_at) - getTimestamp(first.created_at));

const buildAction = (label: string, href: string, ariaLabel: string): StudyDashboardAction => ({ ariaLabel, href, label });

const buildQueryHref = (pathname: string, key: string, value: string) => {
  const params = new URLSearchParams({ [key]: value });
  return `${pathname}?${params.toString()}`;
};

const formatGeneratedAt = (timestamp: Date) =>
  new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);

const formatDateLabel = (dateValue: string, prefix: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return prefix ? `${prefix} —` : "—";

  const label = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(date);
  return prefix ? `${prefix} ${label}` : label;
};

const getTimestamp = (dateValue: string) => {
  const timestamp = Date.parse(dateValue);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};
