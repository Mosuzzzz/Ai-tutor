import type { AuthSession } from "../auth/types";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { aiQuizGeneratorMock } from "./quizGeneratorData";
import type { ExamResponse, TrainerExamQuestion } from "./quizGeneratorContract";
import { clampQuestionCount, estimateQuizDuration } from "./quizGeneratorHelpers";
import type {
  QuizDraftStatus,
  QuizGeneratorViewModel,
  QuizQuestionPreview,
  QuizSource,
  QuizSourceStatus
} from "./types";

type DocumentLibraryItem = DocumentLibraryResponse["documents"][number];

type QuizQuestionSource = {
  filename: string;
  id: string;
};

type QuizGeneratorViewModelInput = {
  documentsResponse: DocumentLibraryResponse;
  examResponse?: ExamResponse;
  selectedDocumentId?: string;
  session: AuthSession;
  timestamp?: Date;
};

const DEFAULT_QUIZ_INSTRUCTIONS = [
  "Use scenario-based questions grounded in the selected document.",
  "Keep every option clear and distinct.",
  "Do not expose answer keys in learner-facing previews."
];

export const toGeneratedQuizDraft = ({
  examResponse,
  source,
  timestamp = new Date()
}: {
  examResponse: ExamResponse;
  source?: QuizQuestionSource;
  timestamp?: Date;
}): QuizGeneratorViewModel["draft"] => {
  return {
    file_id: examResponse.file_id,
    generatedAtLabel: formatGeneratedAt(timestamp),
    id: examResponse.id,
    questions: examResponse.questions.map((question) =>
      toQuizQuestionPreview({
        question,
        source
      })
    ),
    status: toQuizDraftStatus(examResponse.status),
    title: source ? `Quiz draft for ${source.filename}` : `Quiz draft ${examResponse.id}`
  };
};

export const toQuizGeneratorViewModel = ({
  documentsResponse,
  examResponse,
  selectedDocumentId,
  session,
  timestamp = new Date()
}: QuizGeneratorViewModelInput): QuizGeneratorViewModel => {
  const selectedSource = selectQuizSourceForGeneration(documentsResponse, selectedDocumentId ?? examResponse?.file_id);
  const sources = documentsResponse.documents.map(toQuizSource);
  const questionCount = clampQuestionCount(selectedSource?.related_exams_count ? selectedSource.related_exams_count * 5 : 5);
  const instructions = DEFAULT_QUIZ_INSTRUCTIONS;

  return {
    detailEndpointPattern: aiQuizGeneratorMock.detailEndpointPattern,
    draft: buildDraft({
      examResponse,
      selectedSource,
      timestamp
    }),
    generateEndpoint: aiQuizGeneratorMock.generateEndpoint,
    instructions,
    metrics: [
      {
        helper: "Backend-supported range for AI-generated quizzes",
        id: "question-count",
        label: "Question count",
        value: String(questionCount)
      },
      {
        helper: "Estimated learner completion time",
        id: "duration",
        label: "Estimated time",
        value: estimateQuizDuration(questionCount)
      },
      {
        helper: "Documents ready for quiz generation",
        id: "ready-sources",
        label: "Ready sources",
        value: String(sources.filter((source) => source.status === "ready").length)
      }
    ],
    publishEndpointPattern: aiQuizGeneratorMock.publishEndpointPattern,
    request: {
      difficulty: "medium",
      file_id: selectedSource?.id ?? "",
      instructions: instructions.join("\n"),
      num_questions: questionCount
    },
    selectedSourceId: selectedSource?.id ?? "",
    sources,
    workspaceName: buildWorkspaceName(session)
  };
};

export const isQuizGeneratorEmpty = (documentsResponse: DocumentLibraryResponse) => {
  return documentsResponse.total_documents === 0 || !selectQuizSourceForGeneration(documentsResponse);
};

export const selectQuizSourceForGeneration = (
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

const toQuizSource = (document: DocumentLibraryItem): QuizSource => ({
  id: document.id,
  questionCountRecommendation: clampQuestionCount(document.related_exams_count > 0 ? document.related_exams_count * 5 : 5),
  status: toQuizSourceStatus(document.status),
  summary: document.summary_markdown ? summarizeMarkdown(document.summary_markdown) : buildDocumentStatusSummary(document.status),
  title: document.filename,
  type: "document",
  updatedAt: document.created_at,
  updatedAtLabel: formatDateLabel(document.created_at)
});

const toQuizSourceStatus = (status: DocumentLibraryItem["status"]): QuizSourceStatus => {
  if (status === "ready") {
    return "ready";
  }

  if (status === "error") {
    return "error";
  }

  return "processing";
};

const buildDraft = ({
  examResponse,
  selectedSource,
  timestamp
}: {
  examResponse?: ExamResponse;
  selectedSource?: DocumentLibraryItem;
  timestamp: Date;
}): QuizGeneratorViewModel["draft"] => {
  if (!examResponse) {
    return {
      file_id: selectedSource?.id ?? "",
      generatedAtLabel: "No generated quiz draft yet",
      id: "",
      questions: [],
      status: "draft",
      title: selectedSource ? `Quiz draft for ${selectedSource.filename}` : "Quiz draft"
    };
  }

  return toGeneratedQuizDraft({
    examResponse,
    source: selectedSource
      ? {
          filename: selectedSource.filename,
          id: selectedSource.id
        }
      : undefined,
    timestamp
  });
};

const toQuizQuestionPreview = ({
  question,
  source
}: {
  question: ExamResponse["questions"][number];
  source?: QuizQuestionSource;
}): QuizQuestionPreview => {
  const fullQuestion = question as Partial<TrainerExamQuestion>;

  return {
    citation: {
      chunk_index: 0,
      file_id: source?.id ?? "",
      filename: source?.filename ?? "Selected document",
      matched_text: fullQuestion.citation ?? "Citation is available after generation."
    },
    id: question.id,
    options: question.options.map((option, index) => ({
      id: `${question.id}-option-${index}`,
      label: option
    })),
    question_text: question.question_text
  };
};

const toQuizDraftStatus = (status: ExamResponse["status"]): QuizDraftStatus => {
  if (status === "published") {
    return "published";
  }

  return "draft";
};

const summarizeMarkdown = (markdown: string) => {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 220);
};

const buildDocumentStatusSummary = (status: DocumentLibraryItem["status"]) => {
  if (status === "processing" || status === "pending") {
    return "Document is still processing before AI quiz generation is available.";
  }

  if (status === "error") {
    return "Document ingestion failed and cannot be used for quiz generation yet.";
  }

  return "Summary is not available yet.";
};

const buildWorkspaceName = (session: AuthSession) => {
  const displayName = session.user.displayName?.trim();

  if (displayName) {
    return `${displayName}'s quiz workspace`;
  }

  return "AI Tutor quiz workspace";
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

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
