import { describe, expect, it } from "vitest";

import type { AuthSession } from "../auth/types";
import { trainerExamResponseSchema } from "./quizGeneratorContract";
import {
  isQuizGeneratorEmpty,
  selectQuizSourceForGeneration,
  toQuizAttemptResult,
  toQuizGeneratorViewModel
} from "./quizGeneratorMapper";
import {
  backendGeneratedExamResponse,
  backendLearnerExamResponse,
  backendSubmitExamResponse,
  backendQuizDocumentsResponse
} from "./quizGeneratorTestData";

const userSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "User One",
    email: "user@example.com",
    role: "user"
  }
};

const adminSession: AuthSession = {
  mode: "http-only-cookie",
  storesTokenInClient: false,
  user: {
    displayName: "Admin One",
    email: "admin@example.com",
    role: "admin"
  }
};

describe("quizGeneratorMapper", () => {
  it("maps document dashboard data into quiz-ready sources and current-session labels", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      session: userSession
    });

    expect(viewModel.workspaceName).toBe("พื้นที่สร้างควิซของ User One");
    expect(viewModel.capabilities).toEqual({
      canGenerateQuiz: true,
      canSubmitAttempt: true
    });
    expect(viewModel.workspaceName).not.toContain("user@example.com");
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
    expect(viewModel.metrics.map((metric) => metric.label)).toEqual([
      "คำถามในชุด",
      "เวลาโดยประมาณ",
      "แหล่งพร้อมใช้"
    ]);
    expect(viewModel.instructions).toEqual([
      "คำถามที่ผูกกับสถานการณ์จากเอกสารที่เลือก",
      "ตัวเลือกต้องชัดเจนและไม่ชี้นำคำตอบ",
      "ยังไม่แสดงเฉลยในหน้าผู้เรียนก่อนส่งคำตอบ"
    ]);
  });

  it("maps a generated trainer exam into safe preview questions without answer keys", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      examResponse: trainerExamResponseSchema.parse(backendGeneratedExamResponse),
      session: userSession
    });

    expect(viewModel.draft.id).toBe("exam-1");
    expect(viewModel.draft.questions?.[0]).toMatchObject({
      id: "question-1",
      question_text: "ผู้เรียนควรทบทวนอะไรก่อนเข้าห้องปฏิบัติการ"
    });
    expect(viewModel.draft.questions?.[0]).not.toHaveProperty("correct_index");
    expect(viewModel.draft.questions?.[0]).not.toHaveProperty("explanation");
    expect(viewModel.draft.questions?.[0]?.citation).toMatchObject({
      file_id: "file-ready",
      filename: "safety-handbook.pdf",
      matched_text: "safety-handbook.pdf ส่วนที่ 2"
    });
  });

  it("localizes known backend sandbox quiz drafts before rendering them", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      examResponse: trainerExamResponseSchema.parse({
        ...backendGeneratedExamResponse,
        questions: [
          {
            citation: "safety-handbook.pdf - Safety Protocol Section",
            correct_index: 1,
            explanation: "Corporate policy mandates immediate reporting to a supervisor to initiate mitigation procedures.",
            id: "question-sandbox",
            options: [
              "Ignore it and continue normal duties",
              "Report it immediately to the supervisor or Safety Committee",
              "Fix it yourself without reporting",
              "Discuss it with coworkers at lunch"
            ],
            question_text: "What is the primary action required upon discovering a safety hazard?"
          }
        ]
      }),
      session: userSession
    });
    const question = viewModel.draft.questions?.[0];

    expect(question?.question_text).not.toContain("What is the primary action");
    expect(question?.question_text).toContain("ความเสี่ยงด้านความปลอดภัย");
    expect(question?.options.map((option) => option.label).join(" ")).not.toContain("Ignore it");
    expect(question?.options[1]?.label).toContain("รายงานต่อผู้ดูแล");
    expect(question?.citation.matched_text).toContain("แนวปฏิบัติด้านความปลอดภัย");
  });

  it("maps a submitted learner attempt into score feedback without exposing raw answer-key fields", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      examResponse: backendLearnerExamResponse,
      session: userSession
    });

    expect(viewModel.capabilities).toEqual({
      canGenerateQuiz: true,
      canSubmitAttempt: true
    });
    const result = toQuizAttemptResult({
      questions: viewModel.draft.questions ?? [],
      submitResponse: backendSubmitExamResponse
    });

    expect(result).toMatchObject({
      correctAnswersLabel: "1/1 ข้อ",
      passedLabel: "ผ่าน",
      scoreLabel: "100%"
    });
    expect(result.items[0]).toMatchObject({
      chosenOptionLabel: "ทบทวนรายการตรวจสอบ",
      correctOptionLabel: "ทบทวนรายการตรวจสอบ",
      explanation: "ต้องทบทวนรายการตรวจสอบก่อนเริ่มงาน",
      isCorrect: true,
      questionId: "question-learner-1"
    });
    expect(JSON.stringify(result)).not.toContain("correct_index");
  });

  it("localizes known backend sandbox learner attempt feedback", () => {
    const viewModel = toQuizGeneratorViewModel({
      documentsResponse: backendQuizDocumentsResponse,
      examResponse: backendLearnerExamResponse,
      session: userSession
    });

    const result = toQuizAttemptResult({
      questions: viewModel.draft.questions ?? [],
      submitResponse: backendSubmitExamResponse
    });

    expect(result.items[0]?.questionText).not.toContain("Which action is safest");
    expect(result.items[0]?.questionText).toContain("ปลอดภัยที่สุด");
    expect(result.items[0]?.chosenOptionLabel).toContain("ทบทวนรายการตรวจสอบ");
    expect(result.items[0]?.explanation).toContain("ต้องทบทวนรายการตรวจสอบ");
    expect(result.items[0]?.citation).toContain("ส่วนที่ 2");
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
