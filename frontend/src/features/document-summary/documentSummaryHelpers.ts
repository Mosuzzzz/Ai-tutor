import type {
  DocumentLibraryItem,
  DocumentProcessingStatus,
  ParsedSummarySection
} from "./types";

const statusPriority: Record<DocumentProcessingStatus, number> = {
  ready: 0,
  processing: 1,
  pending: 2,
  error: 3
};

const documentStatusLabels: Record<DocumentProcessingStatus, string> = {
  ready: "พร้อมสรุป",
  processing: "กำลังประมวลผล",
  pending: "รอประมวลผล",
  error: "มีปัญหา"
};

export const formatDocumentStatus = (status: DocumentProcessingStatus) => {
  return documentStatusLabels[status];
};

export const countAvailableSummaries = (documents: DocumentLibraryItem[]) => {
  return documents.filter((document) => document.summary_available).length;
};

export const sortDocumentsByReadiness = (documents: DocumentLibraryItem[]) => {
  return [...documents].sort((left, right) => {
    const priorityDifference = statusPriority[left.status] - statusPriority[right.status];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
};

export const getSelectedDocument = (documents: DocumentLibraryItem[], selectedDocumentId: string) => {
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId);

  if (selectedDocument) {
    return selectedDocument;
  }

  return sortDocumentsByReadiness(documents).find((document) => document.summary_available) ?? documents[0];
};

export const buildDocumentDetailHref = (documentId: string) => {
  return `/documents/${encodeURIComponent(documentId)}`;
};

export const normalizeDocumentRouteId = (fileId: string | undefined) => {
  const normalizedFileId = fileId?.trim();

  if (!normalizedFileId || normalizedFileId.length > 200) {
    return undefined;
  }

  if (normalizedFileId === "." || normalizedFileId === "..") {
    return undefined;
  }

  if (normalizedFileId.includes("/") || normalizedFileId.includes("\\") || normalizedFileId.includes("..")) {
    return undefined;
  }

  return normalizedFileId;
};

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
};

const cleanMarkdownLine = (line: string) => {
  return line
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .trim();
};

export const parseSummaryMarkdown = (markdown: string): ParsedSummarySection[] => {
  const lines = markdown.split(/\r?\n/);
  const sections: ParsedSummarySection[] = [];
  let currentTitle = "Executive Summary";
  let currentBody: string[] = [];

  const pushSection = () => {
    const body = currentBody.map(cleanMarkdownLine).filter(Boolean).join("\n");

    if (!body) {
      return;
    }

    sections.push({
      body,
      id: toSlug(currentTitle) || `section-${sections.length + 1}`,
      title: currentTitle
    });
  };

  for (const line of lines) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);

    if (heading) {
      pushSection();
      currentTitle = heading[1].trim();
      currentBody = [];
      continue;
    }

    currentBody.push(line);
  }

  pushSection();

  return sections;
};
