export type ChatDocumentStatus = "ready" | "processing" | "error";

export type ChatRole = "assistant" | "learner";

export type ChatCitation = {
  filename: string;
  file_id: string;
  chunk_index: number;
  matched_text: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  body: string;
  createdAtLabel: string;
  citations: ChatCitation[];
};

export type ChatDocument = {
  id: string;
  filename: string;
  status: ChatDocumentStatus;
  summaryAvailable: boolean;
  updatedAt: string;
  updatedAtLabel: string;
  ownerLabel: string;
  summary: string;
  topicCount: number;
};

export type ChatMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

export type SuggestedChatPrompt = {
  id: string;
  prompt: string;
};

export type ChatSummaryPanel = {
  title: string;
  summary: string;
  takeaways: string[];
};

export type AiChatSummaryViewModel = {
  workspaceName: string;
  selectedDocumentId: string;
  chatQueryEndpoint: "/api/chat/query";
  chatHistoryEndpoint: "/api/chat/history";
  documentsEndpoint: "/api/files/dashboard";
  documents: ChatDocument[];
  messages: ChatMessage[];
  metrics: ChatMetric[];
  suggestedPrompts: SuggestedChatPrompt[];
  summaryPanel: ChatSummaryPanel;
};

export type AiChatSummaryStatus = "ready" | "loading" | "error";
