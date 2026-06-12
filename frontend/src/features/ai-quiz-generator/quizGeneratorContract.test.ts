import { describe, expect, it } from "vitest";

import {
  EXAM_GENERATE_API_PATH,
  examDetailApiPath,
  examPublishApiPath,
  examSubmitApiPath,
  examUpdateApiPath,
  quizGenerationInputSchema,
  trainerExamResponseSchema,
  learnerExamResponseSchema,
  examPublishResponseSchema,
  examSubmitInputSchema,
  examSubmitResponseSchema
} from "./quizGeneratorContract";
import {
  backendGeneratedExamResponse,
  backendLearnerExamResponse,
  backendSubmitExamResponse
} from "./quizGeneratorTestData";

describe("quizGeneratorContract", () => {
  it("builds Backend exam paths without allowing raw path injection", () => {
    expect(EXAM_GENERATE_API_PATH).toBe("/api/exams/generate");
    expect(examDetailApiPath("exam/one")).toBe("/api/exams/exam%2Fone");
    expect(examUpdateApiPath("exam/one")).toBe("/api/exams/exam%2Fone");
    expect(examPublishApiPath("exam/one")).toBe("/api/exams/exam%2Fone/publish");
    expect(examSubmitApiPath("exam/one")).toBe("/api/exams/exam%2Fone/submit");
  });

  it("validates generation input with backend-supported range and optional instructions", () => {
    expect(
      quizGenerationInputSchema.parse({
        difficulty: "hard",
        fileId: " file-ready ",
        instructions: " focus on scenario questions ",
        numQuestions: 10
      })
    ).toEqual({
      difficulty: "hard",
      fileId: "file-ready",
      instructions: "focus on scenario questions",
      numQuestions: 10
    });

    expect(() =>
      quizGenerationInputSchema.parse({
        difficulty: "medium",
        fileId: "file-ready",
        numQuestions: 4
      })
    ).toThrow();
  });

  it("accepts trainer exam payloads with answer keys but rejects answer keys in learner payloads", () => {
    const trainerExam = trainerExamResponseSchema.parse(backendGeneratedExamResponse);
    expect(trainerExam.questions[0]).toMatchObject({
      correct_index: 0,
      explanation: "The safety checklist is required before lab work."
    });

    expect(learnerExamResponseSchema.parse(backendLearnerExamResponse).questions[0]).not.toHaveProperty("correct_index");
    expect(() => learnerExamResponseSchema.parse(backendGeneratedExamResponse)).toThrow();
  });

  it("validates publish and submit response contracts", () => {
    expect(examPublishResponseSchema.parse({ id: "exam-1", status: "published" })).toEqual({
      id: "exam-1",
      status: "published"
    });

    expect(
      examSubmitInputSchema.parse({
        answers: {
          "question-1": 0
        }
      })
    ).toEqual({
      answers: {
        "question-1": 0
      }
    });

    expect(examSubmitResponseSchema.parse(backendSubmitExamResponse)).toMatchObject({
      exam_id: "exam-learner",
      passed: true,
      score: 100
    });
  });
});
