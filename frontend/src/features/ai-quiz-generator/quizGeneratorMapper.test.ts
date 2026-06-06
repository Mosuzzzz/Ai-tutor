import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { trainerExamResponseSchema } from "./quizGeneratorContract";
import {
  isQuizGeneratorEmpty,
  selectQuizSourceForGeneration,
  toQuizGeneratorViewModel
} from "./quizGeneratorMapper";
import {
  backendGeneratedExamResponse,
  backendQuizDocumentsResponse
} from "./quizGeneratorTestData";

const teacherSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Teacher One",
    email: "teacher@example.com",
    role: "teacher"
  }
};

describe("quizGeneratorMapper", () => {
  it("maps document dashboard data into quiz-ready sources and current-session labels", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      session: teacherSession
    });

    expect(viewModel.workspaceName).toBe("Teacher One's quiz workspace");
    expect(viewModel.workspaceName).not.toContain("teacher@example.com");
    expect(viewModel.sources).toHaveLength(2);
    expect(viewModel.sources[0]).toMatchObject({
      id: "file-ready",
      status: "ready",
      title: "safety-handbook.pdf",
      type: "document"
    });
    expect(viewModel.request).toMatchObject({
      difficulty: "medium",
      file_id: "file-ready",
      num_questions: 5
    });
  });

  it("maps a generated trainer exam into safe preview questions without answer keys", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      examResponse: trainerExamResponseSchema.parse(backendGeneratedExamResponse),
      session: teacherSession
    });

    expect(viewModel.draft.id).toBe("exam-1");
    expect(viewModel.draft.questions?.[0]).toMatchObject({
      id: "question-1",
      question_text: "What should learners review before entering the lab?"
    });
    expect(viewModel.draft.questions?.[0]).not.toHaveProperty("correct_index");
    expect(viewModel.draft.questions?.[0]).not.toHaveProperty("explanation");
    expect(viewModel.draft.questions?.[0]?.citation).toMatchObject({
      file_id: "file-ready",
      filename: "safety-handbook.pdf",
      matched_text: "safety-handbook.pdf section 2"
    });
  });

  it("detects empty source lists and falls back only to ready sources", () => {
    const emptyDashboard = {
      ...backendQuizDocumentsResponse,
      documents: [],
      total_documents: 0
    };

    expect(isQuizGeneratorEmpty(emptyDashboard)).toBe(true);
    expect(selectQuizSourceForGeneration(backendQuizDocumentsResponse, "file-processing")?.id).toBe("file-ready");
    expect(selectQuizSourceForGeneration(backendQuizDocumentsResponse, "file-ready")?.id).toBe("file-ready");
  });
});
