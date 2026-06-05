import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { aiChatSummaryMock } from "./aiChatData";
import type { ChatHistoryResponse } from "./aiChatContract";
import type {
  AiChatSummaryViewModel,
  ChatDocument,
  ChatDocumentStatus,
  ChatMessage
} from "./types";

type DocumentLibraryItem = DocumentLibraryResponse["documents"][number];

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
        helper: "AI answers that include document citations",
        id: "grounded-answers",
        label: "Grounded answers",
        value: String(history.filter((item) => item.citations.length > 0).length)
      },
      {
        helper: "Documents available for RAG chat",
        id: "ready-documents",
        label: "Ready documents",
        value: String(readyDocuments.length)
      },
      {
        helper: "Recent chat turns loaded from Backend",
        id: "history-count",
        label: "History items",
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

const toChatDocument = (document: DocumentLibraryItem): ChatDocument => ({
  filename: document.filename,
  id: document.id,
  ownerLabel: `Uploaded by ${document.uploaded_by}`,
  status: toChatDocumentStatus(document.status),
  summary: document.summary_markdown ? summarizeMarkdown(document.summary_markdown) : buildDocumentStatusSummary(document.status),
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
      body: historyItem.query,
      citations: [],
      createdAtLabel,
      id: `${historyItem.id}-learner`,
      role: "learner"
    },
    {
      body: historyItem.response,
      citations: historyItem.citations,
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
  const summary = latestAnswer ?? selectedDocument?.summary_markdown ?? "No AI answer history is available for this document yet.";

  return {
    summary: summarizeMarkdown(summary),
    takeaways: buildTakeaways(summary),
    title: "Answer Summary"
  };
};

const buildTakeaways = (value: string) => {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*#\s]+/, "").trim())
    .filter(Boolean);

  return lines.slice(0, 3).length > 0 ? lines.slice(0, 3) : ["No key takeaway is available from the chat history yet."];
};

const summarizeMarkdown = (markdown: string) => {
  return markdown
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
    return "Document is waiting for ingestion before AI chat is available.";
  }

  if (status === "processing") {
    return "Document is still processing before AI chat is available.";
  }

  if (status === "error") {
    return "Document ingestion failed and cannot be used for grounded chat yet.";
  }

  return "Summary is not available yet.";
};

const buildWorkspaceName = (session: AuthSession) => {
  const displayName = session.user.displayName?.trim();

  if (displayName) {
    return `${displayName}'s AI chat workspace`;
  }

  return "AI Tutor chat workspace";
};

const formatDateLabel = (dateValue: string) => {
  const timestamp = new Date(dateValue);

  if (Number.isNaN(timestamp.getTime())) {
    return "Updated from Backend";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};

const formatTimeLabel = (dateValue: string) => {
  const timestamp = new Date(dateValue);

  if (Number.isNaN(timestamp.getTime())) {
    return "Backend";
  }

  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
