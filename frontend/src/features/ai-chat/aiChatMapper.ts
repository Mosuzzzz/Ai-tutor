import type { AuthSession } from "../auth/types";
import { localizeKnownAiText } from "../core-ai/aiThaiText";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { aiChatSummaryMock } from "./aiChatData";
import type { ChatHistoryResponse, ChatQueryResponse } from "./aiChatContract";
import type {
  AiChatSummaryViewModel,
  ChatDocument,
  ChatDocumentStatus,
  ChatMessage
} from "./types";

type DocumentLibraryItem = DocumentLibraryResponse["documents"][number];

type ChatMessageDocumentContext = {
  filename: string;
  id: string;
};

type AiChatSummaryViewModelInput = {
  documentsResponse: DocumentLibraryResponse;
  history: ChatHistoryResponse;
  selectedDocumentId?: string;
  session: AuthSession;
};

export const toAiChatSummaryViewModel = ({
  documentsResponse,
  history,
  selectedDocumentId,
  session
}: AiChatSummaryViewModelInput): AiChatSummaryViewModel => {
  const selectedDocument = selectChatDocumentForHistory(documentsResponse, selectedDocumentId);
  const documents = documentsResponse.documents.map(toChatDocument);
  const messages = history.flatMap(toChatMessages);
  const readyDocuments = documents.filter((document) => document.status === "ready" && document.summaryAvailable);

  return {
    chatHistoryEndpoint: aiChatSummaryMock.chatHistoryEndpoint,
    chatQueryEndpoint: aiChatSummaryMock.chatQueryEndpoint,
    documents,
    documentsEndpoint: aiChatSummaryMock.documentsEndpoint,
    messages,
    metrics: [
      {
        helper: "คำตอบ AI ที่มีอ้างอิงจากเอกสาร",
        id: "grounded-answers",
        label: "คำตอบอ้างอิง",
        value: String(history.filter((item) => item.citations.length > 0).length)
      },
      {
        helper: "เอกสารที่พร้อมใช้ถาม AI พร้อมอ้างอิง",
        id: "ready-documents",
        label: "เอกสารพร้อมถาม",
        value: String(readyDocuments.length)
      },
      {
        helper: "จำนวนรอบสนทนาที่โหลดจากระบบ",
        id: "history-count",
        label: "ประวัติสนทนา",
        value: String(history.length)
      }
    ],
    selectedDocumentId: selectedDocument?.id ?? "",
    suggestedPrompts: aiChatSummaryMock.suggestedPrompts,
    summaryPanel: buildSummaryPanel(selectedDocument, history),
    workspaceName: buildWorkspaceName(session)
  };
};

export const isAiChatSummaryEmpty = (documentsResponse: DocumentLibraryResponse) => {
  return documentsResponse.total_documents === 0 || !selectChatDocumentForHistory(documentsResponse);
};

export const selectChatDocumentForHistory = (
  documentsResponse: DocumentLibraryResponse,
  selectedDocumentId?: string
): DocumentLibraryItem | undefined => {
  const readyDocuments = documentsResponse.documents.filter(
    (document) => document.status === "ready" && document.summary_available
  );

  if (selectedDocumentId) {
    const selectedDocument = readyDocuments.find((document) => document.id === selectedDocumentId);

    if (selectedDocument) {
      return selectedDocument;
    }
  }

  return readyDocuments[0];
};

export const toDocumentContextChatMessages = ({
  document,
  prompt,
  response,
  timestamp = new Date()
}: {
  document: ChatMessageDocumentContext;
  prompt: string;
  response: ChatQueryResponse;
  timestamp?: Date;
}): ChatMessage[] => {
  const createdAtLabel = formatTimeLabel(timestamp.toISOString());

  return [
    {
      body: prompt,
      citations: [],
      createdAtLabel,
      id: `${response.chat_history_id}-learner`,
      role: "learner"
    },
    {
      body: localizeKnownAiText(response.response_text),
      citations: response.citations.map((citation) => ({
        ...citation,
        file_id: citation.file_id || document.id,
        filename: citation.filename || document.filename,
        matched_text: citation.matched_text ? localizeKnownAiText(citation.matched_text) : citation.matched_text
      })),
      createdAtLabel,
      id: `${response.chat_history_id}-assistant`,
      role: "assistant"
    }
  ];
};

const toChatDocument = (document: DocumentLibraryItem): ChatDocument => ({
  filename: document.filename,
  id: document.id,
  ownerLabel: `อัปโหลดโดย ${document.uploaded_by}`,
  status: toChatDocumentStatus(document.status),
  summary: document.summary_markdown ? summarizeMarkdown(localizeKnownAiText(document.summary_markdown)) : buildDocumentStatusSummary(document.status),
  summaryAvailable: document.summary_available,
  topicCount: document.summary_markdown ? countMarkdownSections(document.summary_markdown) : 0,
  updatedAt: document.created_at,
  updatedAtLabel: formatDateLabel(document.created_at)
});

const toChatDocumentStatus = (status: DocumentLibraryItem["status"]): ChatDocumentStatus => {
  if (status === "pending") {
    return "pending";
  }

  return status;
};

const toChatMessages = (historyItem: ChatHistoryResponse[number]): ChatMessage[] => {
  const createdAtLabel = formatTimeLabel(historyItem.timestamp);

  return [
    {
      body: localizeKnownAiText(historyItem.query),
      citations: [],
      createdAtLabel,
      id: `${historyItem.id}-learner`,
      role: "learner"
    },
    {
      body: localizeKnownAiText(historyItem.response),
      citations: historyItem.citations.map((citation) => ({
        ...citation,
        matched_text: citation.matched_text ? localizeKnownAiText(citation.matched_text) : citation.matched_text
      })),
      createdAtLabel,
      id: `${historyItem.id}-assistant`,
      role: "assistant"
    }
  ];
};

const buildSummaryPanel = (
  selectedDocument: DocumentLibraryItem | undefined,
  history: ChatHistoryResponse
) => {
  const latestAnswer = [...history].reverse().find((item) => item.response)?.response;
  const summary = localizeKnownAiText(
    latestAnswer ?? selectedDocument?.summary_markdown ?? "ยังไม่มีประวัติคำตอบจาก AI สำหรับเอกสารนี้"
  );

  return {
    summary: summarizeMarkdown(summary),
    takeaways: buildTakeaways(summary),
    title: "สรุปประกอบคำตอบ"
  };
};

const buildTakeaways = (value: string) => {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*#\s]+/, "").trim())
    .filter(Boolean);

  return lines.slice(0, 3).length > 0 ? lines.slice(0, 3) : ["ยังไม่มีประเด็นสำคัญจากบทสนทนา"];
};

const summarizeMarkdown = (markdown: string) => {
  return localizeKnownAiText(markdown)
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 260);
};

const countMarkdownSections = (markdown: string) => {
  const headings = markdown.match(/^#{2,3}\s+/gm);
  return headings?.length ?? 1;
};

const buildDocumentStatusSummary = (status: DocumentLibraryItem["status"]) => {
  if (status === "pending") {
    return "เอกสารกำลังรอเข้าคิวประมวลผลก่อนเปิดให้ถาม AI";
  }

  if (status === "processing") {
    return "เอกสารยังประมวลผลอยู่ จึงยังถาม AI จากไฟล์นี้ไม่ได้";
  }

  if (status === "error") {
    return "ระบบอ่านเอกสารไม่สำเร็จ กรุณาอัปโหลดไฟล์ใหม่ก่อนถาม AI";
  }

  return "ยังไม่มีสรุปพร้อมใช้สำหรับเอกสารนี้";
};

const buildWorkspaceName = (session: AuthSession) => {
  const displayName = session.user.displayName?.trim();

  if (displayName) {
    return `พื้นที่แชทของ ${displayName}`;
  }

  return "พื้นที่แชทกับเอกสาร";
};

const formatDateLabel = (dateValue: string) => {
  const timestamp = new Date(dateValue);

  if (Number.isNaN(timestamp.getTime())) {
    return "อัปเดตจากระบบ";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};

const formatTimeLabel = (dateValue: string) => {
  const timestamp = new Date(dateValue);

  if (Number.isNaN(timestamp.getTime())) {
    return "จากระบบ";
  }

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
