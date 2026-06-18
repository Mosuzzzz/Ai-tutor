import { describe, expect, it } from "vitest";

import { formatScore, getProgressPercentValue, getTopScores, scoreToGrade } from "./studyDashboardHelpers";

describe("study dashboard helpers", () => {
  it("normalizes score values for dashboard metrics", () => {
    expect(getProgressPercentValue(-10)).toBe(0);
    expect(getProgressPercentValue(72.8)).toBe(73);
    expect(getProgressPercentValue(140)).toBe(100);
    expect(formatScore(88.4)).toBe("88%");
  });

  it("maps scores into Thai study status labels", () => {
    expect(scoreToGrade(92)).toBe("ยอดเยี่ยม");
    expect(scoreToGrade(84)).toBe("ดีมาก");
    expect(scoreToGrade(74)).toBe("ดี");
    expect(scoreToGrade(54)).toBe("ควรทบทวน");
  });

  it("sorts recent scores without mutating the original input", () => {
    const scores = [
      { exam_id: "a", filename: "A.pdf", id: "1", score: 72, submitted_at: "2026-06-01T00:00:00.000Z" },
      { exam_id: "b", filename: "B.pdf", id: "2", score: 95, submitted_at: "2026-06-02T00:00:00.000Z" },
      { exam_id: "c", filename: "C.pdf", id: "3", score: 88, submitted_at: "2026-06-03T00:00:00.000Z" }
    ];

    expect(getTopScores(scores, 2).map((score) => score.id)).toEqual(["2", "3"]);
    expect(scores.map((score) => score.id)).toEqual(["1", "2", "3"]);
  });
});
