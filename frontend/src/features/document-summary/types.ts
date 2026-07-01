export type DocumentProcessingStatus = "pending" | "processing" | "ready" | "error";

export type DocumentStatusCounts = Record<DocumentProcessingStatus, number>;

export type DocumentLibraryItem = {
  id: string;
  filename: string;
  status: DocumentProcessingStatus;
  created_at: string;
  uploaded_by: string;
  summary_available: boolean;
  summary_markdown: string | null;
  related_exams_count: number;
};

export type DocumentLibraryApiResponse = {
  total_documents: number;
  status_counts: DocumentStatusCounts;
  documents: DocumentLibraryItem[];
};

export type DocumentSummaryTopic = {
  id: string;
  title: string;
  confidencePercent: number;
};

export type DocumentBreakdownItem = {
  id: string;
  title: string;
  body: string;
};

export type RelatedDocument = {
  id: string;
  filename: string;
  status: DocumentProcessingStatus;
  href: string;
};

export type DocumentSummaryQuality = "document-derived" | "needs-backend-summary";

export type DocumentSummaryDetail = {
  id: string;
  filename: string;
  uploadedByLabel: string;
  generatedAtLabel: string;
  summaryMarkdown: string;
  summaryQuality: DocumentSummaryQuality;
  summaryNotice?: string;
  canUseAiActions: boolean;
  sourcePreview?: string;
  keyTopics: DocumentSummaryTopic[];
  detailedBreakdown: DocumentBreakdownItem[];
  relatedDocuments: RelatedDocument[];
};

export type ParsedSummarySection = {
  id: string;
  title: string;
  body: string;
};

export type DocumentSummaryViewModel = {
  workspaceName: string;
  generatedAtLabel: string;
  selectedDocumentId: string;
  apiEndpoint: "/api/files/dashboard";
  detailEndpointPattern: "/api/files/{file_id}/detail";
  recapEndpointPattern: "/api/recap/{file_id}";
  apiResponse: DocumentLibraryApiResponse;
  documentDetails: DocumentSummaryDetail[];
};

export type DocumentSummaryStatus = "ready" | "loading" | "empty" | "error";
