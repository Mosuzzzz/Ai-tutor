import type { DocumentLibraryResponse } from "../document-summary/documentSummaryContract";

export const backendQuizDocumentsResponse: DocumentLibraryResponse = {
  documents: [
    {
      created_at: "2026-06-05T08:00:00.000Z",
      filename: "safety-handbook.pdf",
      id: "file-ready",
      related_exams_count: 1,
      status: "ready",
      summary_available: true,
      summary_markdown:
        "## Lab Safety\nReview the checklist before entering the lab.\n\n## Incidents\nReport unusual incidents immediately.",
      uploaded_by: "Trainer One"
    },
    {
      created_at: "2026-06-04T08:00:00.000Z",
      filename: "ethics-guide.pdf",
      id: "file-processing",
      related_exams_count: 0,
      status: "processing",
      summary_available: false,
      summary_markdown: null,
      uploaded_by: "Trainer Two"
    }
  ],
  status_counts: {
    error: 0,
    pending: 0,
    processing: 1,
    ready: 1
  },
  total_documents: 2
};

export const backendGeneratedExamResponse = {
  file_id: "file-ready",
  id: "exam-1",
  questions: [
    {
      citation: "safety-handbook.pdf section 2",
      correct_index: 0,
      explanation: "The safety checklist is required before lab work.",
      id: "question-1",
      options: [
        "Review the safety checklist",
        "Skip setup to save time",
        "Start mixing chemicals",
        "Wait until the end"
      ],
      question_text: "What should learners review before entering the lab?"
    }
  ],
  status: "draft",
  tenant_id: "tenant-1"
};

export const backendLearnerExamResponse = {
  file_id: "file-ready",
  id: "exam-learner",
  questions: [
    {
      id: "question-learner-1",
      options: ["Review the checklist", "Ignore the checklist"],
      question_text: "Which action is safest before lab work?"
    }
  ],
  status: "published",
  tenant_id: "tenant-1"
};

export const backendSubmitExamResponse = {
  correct_answers_count: 1,
  detailed_results: [
    {
      chosen: 0,
      citation: "safety-handbook.pdf section 2",
      correct_index: 0,
      explanation: "Checklist review is required.",
      question_id: "question-1"
    }
  ],
  exam_id: "exam-1",
  passed: true,
  score: 100,
  total_questions: 1
};
