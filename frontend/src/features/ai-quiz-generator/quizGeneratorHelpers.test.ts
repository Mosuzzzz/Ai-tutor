import { describe, expect, it } from "vitest";

import {
  buildQuizCitationLabel,
  clampQuestionCount,
  countReadyQuizSources,
  estimateQuizDuration,
  formatDifficulty,
  formatQuizDraftStatus,
  formatQuizSourceStatus,
  formatQuizSourceType,
  getSafeQuizDraftQuestions,
  getSelectedQuizSource,
  sortQuizSourcesByReadiness
} from "./quizGeneratorHelpers";
import type { QuizCitationPreview, QuizQuestionPreview, QuizSource } from "./types";

const sources: QuizSource[] = [
  {
    id: "source-processing",
    questionCountRecommendation: 5,
    status: "processing",
    summary: "กำลังประมวลผล",
    title: "บทนำระบบย่อยอาหาร.pdf",
    type: "document",
    updatedAt: "2026-05-31T09:00:00.000Z",
    updatedAtLabel: "31 พ.ค. 2026"
  },
  {
    id: "source-ready-old",
    questionCountRecommendation: 5,
    status: "ready",
    summary: "สรุปจริยธรรม AI",
    title: "แนวทางจริยธรรม AI.pdf",
    type: "document",
    updatedAt: "2026-05-30T09:00:00.000Z",
    updatedAtLabel: "30 พ.ค. 2026"
  },
  {
    id: "source-ready-new",
    questionCountRecommendation: 10,
    status: "ready",
    summary: "สรุปความปลอดภัย",
    title: "คู่มือความปลอดภัย.pdf",
    type: "document",
    updatedAt: "2026-06-01T09:00:00.000Z",
    updatedAtLabel: "1 มิ.ย. 2026"
  },
  {
    id: "source-error",
    questionCountRecommendation: 5,
    status: "error",
    summary: "ไฟล์อ่านไม่ได้",
    title: "แบบฝึกหัดเก่า.pdf",
    type: "document",
    updatedAt: "2026-06-02T09:00:00.000Z",
    updatedAtLabel: "2 มิ.ย. 2026"
  }
];

const citation: QuizCitationPreview = {
  chunk_index: 4,
  file_id: "source-ready-new",
  filename: "คู่มือความปลอดภัย.pdf",
  matched_text: "ตรวจอุปกรณ์ป้องกันก่อนเริ่มทดลอง"
};

const question: QuizQuestionPreview = {
  citation,
  id: "question-1",
  options: [{ id: "a", label: "A" }],
  question_text: "Question"
};

describe("quizGeneratorHelpers", () => {
  it("formats difficulty, source type, source status, and draft status labels in Thai", () => {
    expect(formatDifficulty("easy")).toBe("ง่าย");
    expect(formatDifficulty("medium")).toBe("ปานกลาง");
    expect(formatDifficulty("hard")).toBe("ยาก");
    expect(formatQuizSourceType("document")).toBe("เอกสาร");
    expect(formatQuizSourceType("manual")).toBe("กำหนดเอง");
    expect(formatQuizSourceType("course")).toBe("คอร์สเรียน");
    expect(formatQuizSourceStatus("ready")).toBe("พร้อมสร้างควิซ");
    expect(formatQuizDraftStatus("draft")).toBe("แบบร่าง");
  });

  it("clamps question count to the backend-supported 5 to 20 range", () => {
    expect(clampQuestionCount(3)).toBe(5);
    expect(clampQuestionCount(12)).toBe(12);
    expect(clampQuestionCount(24)).toBe(20);
  });

  it("sorts ready sources first and then newest updated date", () => {
    expect(sortQuizSourcesByReadiness(sources).map((source) => source.id)).toEqual([
      "source-ready-new",
      "source-ready-old",
      "source-processing",
      "source-error"
    ]);
  });

  it("selects only ready sources and falls back to the first ready source", () => {
    expect(getSelectedQuizSource(sources, "source-ready-old")?.id).toBe("source-ready-old");
    expect(getSelectedQuizSource(sources, "source-processing")?.id).toBe("source-ready-new");
    expect(getSelectedQuizSource(sources, "missing-source")?.id).toBe("source-ready-new");
  });

  it("returns undefined when no source is ready", () => {
    expect(getSelectedQuizSource(sources.filter((source) => source.status !== "ready"), "missing")).toBeUndefined();
  });

  it("counts ready sources and estimates quiz duration", () => {
    expect(countReadyQuizSources(sources)).toBe(2);
    expect(estimateQuizDuration(5)).toBe("8 นาที");
    expect(estimateQuizDuration(12)).toBe("18 นาที");
  });

  it("guards draft questions from nullish backend payloads", () => {
    expect(getSafeQuizDraftQuestions([question])).toEqual([question]);
    expect(getSafeQuizDraftQuestions([])).toEqual([]);
    expect(getSafeQuizDraftQuestions(null)).toEqual([]);
    expect(getSafeQuizDraftQuestions(undefined)).toEqual([]);
  });

  it("builds citation labels without leaking API field names", () => {
    expect(buildQuizCitationLabel(citation)).toBe("คู่มือความปลอดภัย.pdf · ส่วนที่ 5");
  });
});
