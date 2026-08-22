export type DashboardDataSourceId = "analytics" | "documents";
export type DashboardSourceAvailability = "available" | "unavailable";
export type DashboardDocumentStatus = "pending" | "processing" | "ready" | "error";

export type StudyDashboardAction = {
  ariaLabel: string;
  href: string;
  label: string;
};

export type StudyDashboardSupportingAction = StudyDashboardAction & {
  id: "analytics" | "documents" | "quiz";
};

export type StudyDashboardScoreTrendPoint = {
  date: string;
  dateLabel: string;
  score: number;
  scoreLabel: string;
};

export type StudyDashboardContinuation = {
  description: string;
  documentStatus?: DashboardDocumentStatus;
  kind:
    | "ready-summary"
    | "ready-document"
    | "processing-document"
    | "failed-document"
    | "first-document"
    | "documents-unavailable";
  primaryAction: StudyDashboardAction;
  secondaryActions: StudyDashboardAction[];
  statusLabel?: string;
  title: string;
  uploadedAt?: string;
  uploadedAtLabel?: string;
};

export type StudyDashboardRecentDocument = {
  action: StudyDashboardAction;
  filename: string;
  id: string;
  relatedQuizCount?: number;
  summaryAvailable: boolean;
  status: DashboardDocumentStatus;
  statusLabel: string;
  uploadedAt: string;
  uploadedAtLabel: string;
};

export type StudyDashboardRecentReview = {
  ariaLabel: string;
  filename: string;
  gradeLabel: string;
  href: string;
  id: string;
  score: number;
  scoreLabel: string;
  submittedAt: string;
  submittedAtLabel: string;
};

export type StudyDashboardMetric = {
  helper: string;
  id: "ready-documents" | "completed-quizzes" | "average-score";
  label: string;
  value: string;
};

export type StudyDashboardSectionIssue = {
  id: DashboardDataSourceId;
  message: string;
};

export type StudyDashboardViewModel = {
  availability: Record<DashboardDataSourceId, DashboardSourceAvailability>;
  continuation: StudyDashboardContinuation;
  displayName: string | null;
  generatedAt: string;
  generatedAtLabel: string;
  greeting: string;
  hasDocuments: boolean;
  intro: string;
  nextActions: StudyDashboardSupportingAction[];
  progressMetrics: StudyDashboardMetric[];
  recentDocuments: StudyDashboardRecentDocument[];
  recentReviews: StudyDashboardRecentReview[];
  scoreTrend: StudyDashboardScoreTrendPoint[];
  sectionIssues: StudyDashboardSectionIssue[];
};

export type StudyDashboardDataSource = "api";
export type StudyDashboardStatus = "empty" | "ready" | "partial" | "error";
