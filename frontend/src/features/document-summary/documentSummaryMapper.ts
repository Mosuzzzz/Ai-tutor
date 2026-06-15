import type { AuthSession } from "../auth/types";
import { localizeKnownAiText } from "../core-ai/aiThaiText";
import { documentSummaryMock } from "./documentSummaryData";
import { buildDocumentDetailHref, parseSummaryMarkdown } from "./documentSummaryHelpers";
import type {
  DocumentDetailResponse,
  DocumentLibraryResponse,
  RecapResponse
} from "./documentSummaryContract";
import type {
  DocumentBreakdownItem,
  DocumentLibraryItem,
  DocumentSummaryDetail,
  DocumentSummaryTopic,
  DocumentSummaryViewModel,
  RelatedDocument
} from "./types";

type DocumentSummaryViewModelInput = {
  dashboard: DocumentLibraryResponse;
  details?: DocumentDetailResponse[];
  recaps?: RecapResponse[];
  selectedDocumentId?: string;
  session: AuthSession;
  timestamp?: Date;
};

export const toDocumentSummaryViewModel = ({
  dashboard,
  details = [],
  recaps = [],
  selectedDocumentId,
  session,
  timestamp = new Date()
}: DocumentSummaryViewModelInput): DocumentSummaryViewModel => {
  const selectedDocument = selectDocumentForDetail(dashboard, selectedDocumentId);
  const documentDetails = details.map((detail) =>
    toDocumentSummaryDetail({
      dashboard,
      detail,
      recap: recaps.find((recap) => recap.file_id === detail.id)
    })
  );

  return {
    apiEndpoint: documentSummaryMock.apiEndpoint,
    apiResponse: dashboard,
    detailEndpointPattern: documentSummaryMock.detailEndpointPattern,
    documentDetails,
    generatedAtLabel: formatGeneratedAt(timestamp),
    recapEndpointPattern: documentSummaryMock.recapEndpointPattern,
    selectedDocumentId: selectedDocument?.id ?? "",
    workspaceName: buildWorkspaceName(session)
  };
};

export const isDocumentLibraryEmpty = (dashboard: DocumentLibraryResponse) => {
  return dashboard.total_documents === 0 && dashboard.documents.length === 0;
};

export const selectDocumentForDetail = (
  dashboard: DocumentLibraryResponse,
  selectedDocumentId?: string
): DocumentLibraryItem | undefined => {
  if (selectedDocumentId) {
    const selectedDocument = dashboard.documents.find((document) => document.id === selectedDocumentId);
    if (selectedDocument) {
      return selectedDocument;
    }
  }

  return (
    dashboard.documents.find((document) => document.status === "ready" && document.summary_available) ??
    dashboard.documents.find((document) => document.status === "ready") ??
    dashboard.documents[0]
  );
};

const toDocumentSummaryDetail = ({
  dashboard,
  detail,
  recap
}: {
  dashboard: DocumentLibraryResponse;
  detail: DocumentDetailResponse;
  recap?: RecapResponse;
}): DocumentSummaryDetail => {
  const libraryDocument = dashboard.documents.find((document) => document.id === detail.id);
  const summaryMarkdown = localizeKnownAiText(
    detail.summary_markdown ?? recap?.summary_markdown ?? libraryDocument?.summary_markdown ?? buildStatusSummary(detail.status)
  );
  const sections = parseSummaryMarkdown(summaryMarkdown);

  return {
    detailedBreakdown: buildBreakdown(sections, detail.extracted_text_preview),
    filename: detail.filename,
    generatedAtLabel: formatDocumentGeneratedAt(recap?.generated_at ?? detail.created_at),
    id: detail.id,
    keyTopics: buildKeyTopics(sections, detail.filename),
    relatedDocuments: buildRelatedDocuments(dashboard, detail.id),
    sourcePreview: localizeKnownAiText(detail.extracted_text_preview),
    summaryMarkdown,
    uploadedByLabel: `อัปโหลดโดย ${libraryDocument?.uploaded_by ?? detail.uploaded_by}`
  };
};

const buildBreakdown = (
  sections: ReturnType<typeof parseSummaryMarkdown>,
  extractedTextPreview: string
): DocumentBreakdownItem[] => {
  const sourceSections = sections.length > 0 ? sections : [
    {
      body: extractedTextPreview || "ยังไม่มีสรุปพร้อมแสดง",
      id: "document-preview",
      title: "ตัวอย่างเอกสาร"
    }
  ];

  return sourceSections.slice(0, 3).map((section, index) => ({
    body: section.body,
    id: section.id || `breakdown-${index + 1}`,
    title: section.title
  }));
};

const buildKeyTopics = (
  sections: ReturnType<typeof parseSummaryMarkdown>,
  fallbackTitle: string
): DocumentSummaryTopic[] => {
  const titles = sections.length > 0 ? sections.map((section) => section.title) : [fallbackTitle];

  return titles.slice(0, 3).map((title, index) => ({
    confidencePercent: Math.max(80, 96 - index * 4),
    id: `topic-${index + 1}`,
    title
  }));
};

const buildRelatedDocuments = (
  dashboard: DocumentLibraryResponse,
  selectedDocumentId: string
): RelatedDocument[] => {
  return dashboard.documents
    .filter((document) => document.id !== selectedDocumentId)
    .slice(0, 3)
    .map((document) => ({
      filename: document.filename,
      href: buildDocumentDetailHref(document.id),
      id: document.id,
      status: document.status
    }));
};

const buildStatusSummary = (status: DocumentDetailResponse["status"]) => {
  if (status === "processing") {
    return "## กำลังประมวลผล\nเอกสารนี้ยังอยู่ระหว่างประมวลผล กรุณากลับมาตรวจอีกครั้งเมื่อระบบอ่านไฟล์เสร็จ";
  }

  if (status === "pending") {
    return "## รอประมวลผล\nเอกสารนี้กำลังรอเข้าคิวอ่านเนื้อหา";
  }

  if (status === "error") {
    return "## มีปัญหา\nระบบอ่านเอกสารไม่สำเร็จ กรุณาอัปโหลดไฟล์ใหม่หรือติดต่อเจ้าของพื้นที่";
  }

  return "## สรุป\nยังไม่มีสรุปสำหรับเอกสารนี้";
};

const buildWorkspaceName = (session: AuthSession) => {
  const displayName = session.user.displayName?.trim();

  if (displayName) {
    return `คลังเอกสารของ ${displayName}`;
  }

  return "คลังเอกสาร AI Tutor";
};

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};

const formatDocumentGeneratedAt = (dateValue: string) => {
  const timestamp = new Date(dateValue);

  if (Number.isNaN(timestamp.getTime())) {
    return "อัปเดตจากระบบ";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
