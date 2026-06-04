export type QuizDifficulty = "easy" | "medium" | "hard";

export type QuizSourceStatus = "ready" | "processing" | "error";

export type QuizSourceType = "document" | "manual" | "course";

export type QuizDraftStatus = "draft" | "ready_to_publish" | "published";

export type QuizGenerationRequest = {
  file_id: string;
  num_questions: number;
  difficulty: QuizDifficulty;
};

export type QuizSource = {
  id: string;
  title: string;
  type: QuizSourceType;
  status: QuizSourceStatus;
  summary: string;
  updatedAt: string;
  updatedAtLabel: string;
  questionCountRecommendation: number;
};

export type QuizOptionPreview = {
  id: string;
  label: string;
};

export type QuizCitationPreview = {
  filename: string;
  file_id: string;
  chunk_index: number;
  matched_text: string;
};

export type QuizQuestionPreview = {
  id: string;
  question_text: string;
  options: QuizOptionPreview[];
  citation: QuizCitationPreview;
};

export type QuizMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

export type QuizGeneratorViewModel = {
  workspaceName: string;
  selectedSourceId: string;
  generateEndpoint: "/api/exams/generate";
  detailEndpointPattern: "/api/exams/{exam_id}";
  publishEndpointPattern: "/api/exams/{exam_id}/publish";
  request: QuizGenerationRequest;
  sources: QuizSource[];
  draft: {
    id: string;
    file_id: string;
    status: QuizDraftStatus;
    title: string;
    generatedAtLabel: string;
    questions?: QuizQuestionPreview[] | null;
  };
  metrics: QuizMetric[];
  instructions: string[];
};

export type QuizGeneratorStatus = "ready" | "loading" | "error";
