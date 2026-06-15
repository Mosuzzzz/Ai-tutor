import type { AuthSession } from "../auth/types";
import { localizeKnownAiText } from "../core-ai/aiThaiText";
import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";
import { aiQuizGeneratorMock } from "./quizGeneratorData";
import type { ExamResponse, ExamSubmitResponse, TrainerExamQuestion } from "./quizGeneratorContract";
import { clampQuestionCount, estimateQuizDuration } from "./quizGeneratorHelpers";
import type {
  QuizAttemptResult,
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
  "คำถามที่ผูกกับสถานการณ์จากเอกสารที่เลือก",
  "ตัวเลือกต้องชัดเจนและไม่ชี้นำคำตอบ",
  "ยังไม่แสดงเฉลยในหน้าผู้เรียนก่อนส่งคำตอบ"
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
    title: source ? `แบบร่างควิซจาก ${source.filename}` : `แบบร่างควิซ ${examResponse.id}`
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
    capabilities: {
      canGenerateQuiz: canGenerateQuiz(session),
      canSubmitAttempt: canSubmitQuizAttempt(session)
    },
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
        helper: "ตามจำนวนคำถามที่ระบบรองรับ",
        id: "question-count",
        label: "คำถามในชุด",
        value: String(questionCount)
      },
      {
        helper: "เวลาเฉลี่ยสำหรับผู้เรียนทำควิซ",
        id: "duration",
        label: "เวลาโดยประมาณ",
        value: estimateQuizDuration(questionCount)
      },
      {
        helper: "เอกสารที่พร้อมสร้างแบบทดสอบ",
        id: "ready-sources",
        label: "แหล่งพร้อมใช้",
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

export const toQuizAttemptResult = ({
  questions,
  submitResponse
}: {
  questions: QuizQuestionPreview[];
  submitResponse: ExamSubmitResponse;
}): QuizAttemptResult => {
  const questionsById = new Map(questions.map((question) => [question.id, question]));

  return {
    correctAnswersLabel: `${submitResponse.correct_answers_count}/${submitResponse.total_questions} ข้อ`,
    items: submitResponse.detailed_results.map((result) => {
      const question = questionsById.get(result.question_id);

      return {
        citation: normalizeOptionalText(result.citation),
        correctOptionLabel: resolveOptionLabel(question, result.correct_index, "ไม่มีข้อมูลคำตอบที่ถูกต้องจาก backend"),
        chosenOptionLabel: resolveOptionLabel(question, result.chosen, "ยังไม่ได้ตอบ"),
        explanation: normalizeOptionalText(result.explanation),
        isCorrect: result.chosen !== undefined && result.chosen !== null && result.chosen === result.correct_index,
        questionId: result.question_id,
        questionText: question?.question_text ? localizeKnownAiText(question.question_text) : "คำถามจากระบบ"
      };
    }),
    passedLabel: submitResponse.passed ? "ผ่าน" : "ยังไม่ผ่าน",
    scoreLabel: `${submitResponse.score}%`
  };
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
      generatedAtLabel: "ยังไม่มีแบบร่างควิซ",
      id: "",
      questions: [],
      status: "draft",
      title: selectedSource ? `แบบร่างควิซจาก ${selectedSource.filename}` : "แบบร่างควิซ"
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
      filename: source?.filename ?? "เอกสารที่เลือก",
      matched_text: fullQuestion.citation ? localizeKnownAiText(fullQuestion.citation) : "ระบบจะแสดงอ้างอิงหลังสร้างคำถามสำเร็จ"
    },
    id: question.id,
    options: question.options.map((option, index) => ({
      id: `${question.id}-option-${index}`,
      label: localizeKnownAiText(option)
    })),
    question_text: localizeKnownAiText(question.question_text)
  };
};

const toQuizDraftStatus = (status: ExamResponse["status"]): QuizDraftStatus => {
  if (status === "published") {
    return "published";
  }

  return "draft";
};

const resolveOptionLabel = (
  question: QuizQuestionPreview | undefined,
  optionIndex: number | null | undefined,
  fallback: string
) => {
  if (optionIndex === undefined || optionIndex === null) {
    return fallback;
  }

  return question?.options[optionIndex]?.label ?? fallback;
};

const normalizeOptionalText = (value: string | null | undefined) => {
  const normalized = value?.trim();

  return normalized ? localizeKnownAiText(normalized) : undefined;
};

const summarizeMarkdown = (markdown: string) => {
  return localizeKnownAiText(markdown)
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
    return "เอกสารยังประมวลผลอยู่ จึงยังสร้างควิซไม่ได้";
  }

  if (status === "error") {
    return "ระบบอ่านเอกสารไม่สำเร็จ กรุณาอัปโหลดไฟล์ใหม่ก่อนสร้างควิซ";
  }

  return "ยังไม่มีสรุปพร้อมใช้สำหรับสร้างควิซ";
};

const buildWorkspaceName = (session: AuthSession) => {
  const displayName = session.user.displayName?.trim();

  if (displayName) {
    return `พื้นที่สร้างควิซของ ${displayName}`;
  }

  return "พื้นที่สร้างควิซ";
};

const canGenerateQuiz = (session: AuthSession) => {
  return session.user.role === "teacher" || session.user.role === "tenant_admin";
};

const canSubmitQuizAttempt = (session: AuthSession) => {
  return session.user.role === "student" || session.user.role === "teacher" || session.user.role === "tenant_admin";
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

const formatGeneratedAt = (timestamp: Date) => {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  }).format(timestamp);
};
