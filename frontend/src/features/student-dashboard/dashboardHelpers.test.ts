import { describe, expect, it } from "vitest";

import {
  formatScore,
  getHeroSummary,
  getProgressPercentValue,
  getRelativeTimeLabel,
  getStudentGreeting,
  getTopScores,
  scoreToGrade,
  sortRecentScoresByScore
} from "./dashboardHelpers";
import type { RecentScore } from "./types";

const scores: RecentScore[] = [
  {
    id: "score-low",
    exam_id: "exam-low",
    filename: "ควิซพื้นฐาน AI.pdf",
    score: 72,
    submitted_at: "2026-05-29T10:00:00.000Z"
  },
  {
    id: "score-high",
    exam_id: "exam-high",
    filename: "สรุปเวกเตอร์แคลคูลัส.pdf",
    score: 94,
    submitted_at: "2026-05-31T10:00:00.000Z"
  },
  {
    id: "score-mid",
    exam_id: "exam-mid",
    filename: "ข้อต่อหุ่นยนต์.pdf",
    score: 84,
    submitted_at: "2026-05-30T10:00:00.000Z"
  }
];

describe("student dashboard helpers", () => {
  it("formats scores as safe whole-number percentages", () => {
    expect(formatScore(84.6)).toBe("85%");
    expect(formatScore(120)).toBe("100%");
    expect(formatScore(-4)).toBe("0%");
  });

  it("maps score values to readable grades", () => {
    expect(scoreToGrade(95)).toBe("ยอดเยี่ยม");
    expect(scoreToGrade(84)).toBe("ดีมาก");
    expect(scoreToGrade(74)).toBe("ดี");
    expect(scoreToGrade(64)).toBe("ควรทบทวน");
  });

  it("clamps progress values for accessible progress bars", () => {
    expect(getProgressPercentValue(68)).toBe(68);
    expect(getProgressPercentValue(130)).toBe(100);
    expect(getProgressPercentValue(-10)).toBe(0);
  });

  it("sorts recent scores from highest to lowest without mutating input", () => {
    const sorted = sortRecentScoresByScore(scores);

    expect(sorted.map((score) => score.id)).toEqual(["score-high", "score-mid", "score-low"]);
    expect(scores.map((score) => score.id)).toEqual(["score-low", "score-high", "score-mid"]);
  });

  it("returns a limited list of top scores", () => {
    expect(getTopScores(scores, 2).map((score) => score.id)).toEqual(["score-high", "score-mid"]);
  });

  it("formats relative time labels in Thai", () => {
    const now = new Date("2026-06-01T10:00:00.000Z");

    expect(getRelativeTimeLabel("2026-06-01T09:40:00.000Z", now)).toBe("20 นาทีที่แล้ว");
    expect(getRelativeTimeLabel("2026-06-01T07:00:00.000Z", now)).toBe("3 ชั่วโมงที่แล้ว");
    expect(getRelativeTimeLabel("2026-05-30T10:00:00.000Z", now)).toBe("2 วันที่แล้ว");
  });

  it("creates student-facing hero copy", () => {
    expect(getStudentGreeting("ศิวกร")).toBe("ยินดีต้อนรับกลับมา ศิวกร");
    expect(getHeroSummary("ศิวกร")).toContain("บทเรียน เอกสาร และความคืบหน้าควิซ");
  });
});
