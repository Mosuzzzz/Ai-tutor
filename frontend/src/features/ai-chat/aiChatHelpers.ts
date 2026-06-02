import type { ChatCitation, ChatDocument, ChatDocumentStatus, ChatMessage, ChatRole } from "./types";

const statusPriority: Record<ChatDocumentStatus, number> = {
  ready: 0,
  processing: 1,
  error: 2
};

const chatDocumentStatusLabels: Record<ChatDocumentStatus, string> = {
  ready: "พร้อมถาม AI",
  processing: "กำลังประมวลผล",
  error: "มีปัญหา"
};

export const formatChatDocumentStatus = (status: ChatDocumentStatus) => {
  return chatDocumentStatusLabels[status];
};

export const sortChatDocumentsByAvailability = (documents: ChatDocument[]) => {
  return [...documents].sort((left, right) => {
    const priorityDifference = statusPriority[left.status] - statusPriority[right.status];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
};

export const getSelectedChatDocument = (documents: ChatDocument[], selectedDocumentId: string) => {
  const sortedDocuments = sortChatDocumentsByAvailability(documents);
  const selectedDocument = sortedDocuments.find(
    (document) => document.id === selectedDocumentId && document.status === "ready" && document.summaryAvailable
  );

  if (selectedDocument) {
    return selectedDocument;
  }

  return sortedDocuments.find((document) => document.status === "ready" && document.summaryAvailable);
};

export const countGroundedAssistantMessages = (messages: ChatMessage[]) => {
  return messages.filter((message) => message.role === "assistant" && message.citations.length > 0).length;
};

export const buildCitationLabel = (citation: ChatCitation) => {
  return `${citation.filename} · ส่วนที่ ${citation.chunk_index + 1}`;
};

export const getLatestAssistantMessage = (messages: ChatMessage[]) => {
  return [...messages].reverse().find((message) => message.role === "assistant");
};

export const getMessageTone = (role: ChatRole) => {
  return role === "assistant" ? "assistant" : "learner";
};
